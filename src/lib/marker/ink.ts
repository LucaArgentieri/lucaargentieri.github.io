import { effect, frame, init, surface, target, type FramePass } from 'vgpu';
import presentShader from './present.wgsl';
import strokeShader from './stroke.wgsl';

// Coordinates in CSS px, the distance along the whole path (CSS px) at both ends,
// and the brush rotation (radians) at both ends.
type Segment = readonly [
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	c0: number,
	c1: number,
	ang0: number,
	ang1: number,
];

export type Ink = {
	/** Stamp the brush along a segment (CSS px from the canvas' top-left), rotating ang0 -> ang1. */
	segment: (x0: number, y0: number, x1: number, y1: number, ang0?: number, ang1?: number) => void;
	/** The pointer is down: cancel a pending or running rewind (keeping what is left of the trail). */
	hold: () => void;
	/** The pointer is up: after a pause, the trail is rewound back to where it started. */
	release: () => void;
	dispose: () => void;
};

type Options = {
	canvas: HTMLCanvasElement;
	/** Marker colour, 0-1 RGB. */
	color: readonly [number, number, number];
	/** Side of the squircle brush in CSS pixels. */
	size: number;
	/** Corner radius of the brush, as a fraction of its side (0.22 = the header square). */
	cornerRatio: number;
	/**
	 * While the trail is rewound: the point of the path the trail currently ends at
	 * (CSS px, canvas coordinates). `done` is true on the last call, at the path's start.
	 */
	onRewind?: (x: number, y: number, done: boolean) => void;
};

const MAX_DPR = 1.5;
/** Pause after the last stroke before the rewind starts. */
const REWIND_DELAY_MS = 3000;
/** Rewind speed: about one second per this many px of trail, within the bounds below. */
const REWIND_PX_PER_S = 1400;
const REWIND_MIN_S = 0.9;
const REWIND_MAX_S = 2.4;
/** Anti-aliasing width (px of path) of the rewinding end. */
const FEATHER_PX = 6;
/**
 * Path progress is stored in a half float as distance / progressScale. Starting at
 * 4096px gives ~2px of resolution; very long scribbles double the scale (and replay).
 */
const INITIAL_PROGRESS_SCALE = 4096;

/**
 * Persistent brush layer on a WebGPU canvas. Strokes are accumulated into an
 * offscreen target and presented to the (transparent) canvas. Segments are
 * remembered in CSS pixels so the ink can be replayed after a resize.
 */
export async function createInk({ canvas, color, size, cornerRatio, onRewind }: Options): Promise<Ink> {
	const gpu = await init();
	const canvasSurface = surface(gpu, canvas, { dpr: [1, MAX_DPR] });

	// r = path progress of the oldest stamp (min blend, cleared to 1), a = coverage (max blend).
	const ink = target(gpu, { size: [1, 1], format: 'rgba16float' });
	const blend = {
		color: { src: 'one', dst: 'one', op: 'min' },
		alpha: { src: 'one', dst: 'one', op: 'max' },
	} as const;
	const stroke = effect(gpu, strokeShader, { blend });
	const present = effect(gpu, presentShader);
	present.set({ src: ink, params: { cut: 4, feather: 0, color: [color[0], color[1], color[2]] } });

	const segments: Segment[] = [];
	let pending: Segment[] = [];
	let needsReplay = true;
	let raf = 0;
	let pathLength = 0;
	let progressScale = INITIAL_PROGRESS_SCALE;
	// Distance along the path (CSS px) the visible trail is cut at; null = nothing is hidden.
	let cut: number | null = null;
	let delayTimer = 0;
	let rewindRaf = 0;

	// Same clamp as the surface's `dpr: [1, MAX_DPR]`, so ink and canvas stay the same size.
	const dpr = () => Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DPR);

	// The canvas covers the whole page; keep the ink the same physical size.
	const syncSize = () => {
		const w = Math.max(1, Math.round(canvas.clientWidth * dpr()));
		const h = Math.max(1, Math.round(canvas.clientHeight * dpr()));
		if (w !== ink.size[0] || h !== ink.size[1]) {
			ink.resize([w, h]);
			needsReplay = true;
			schedule();
		}
	};
	const drawSegment = (pass: FramePass, s: Segment, scale: number) => {
		stroke.set({
			params: {
				a: [s[0] * scale, s[1] * scale],
				b: [s[2] * scale, s[3] * scale],
				size: [ink.size[0], ink.size[1]],
				half: (size / 2) * scale,
				corner: size * cornerRatio * scale,
				t0: s[4] / progressScale,
				t1: s[5] / progressScale,
				ang0: s[6],
				ang1: s[7],
			},
		});
		pass.draw(stroke);
	};

	const render = () => {
		raf = 0;
		const scale = ink.size[0] / Math.max(1, canvas.clientWidth);
		const replay = needsReplay;
		// A replay only needs what is not cut away.
		const batch = replay ? segments.filter((s) => cut === null || s[4] < cut + FEATHER_PX) : pending;
		pending = [];
		needsReplay = false;
		present.set({
			params: {
				cut: cut === null ? 4 : cut / progressScale, // progress is <= 1, so 4 hides nothing
				feather: FEATHER_PX / progressScale,
			},
		});

		frame(gpu, (f) => {
			if (replay || batch.length > 0) {
				// Replay clears the whole ink (progress 1 = "never painted");
				// incremental draws only touch the dirty rectangle.
				let scissor: [number, number, number, number] | undefined;
				if (!replay) {
					const pad = Math.ceil((size / 2) * 1.2 * scale) + 2; // 1.2: room for the tilt
					let x0 = Infinity,
						y0 = Infinity,
						x1 = -Infinity,
						y1 = -Infinity;
					for (const s of batch) {
						x0 = Math.min(x0, s[0], s[2]);
						y0 = Math.min(y0, s[1], s[3]);
						x1 = Math.max(x1, s[0], s[2]);
						y1 = Math.max(y1, s[1], s[3]);
					}
					const sx = Math.max(0, Math.floor(x0 * scale) - pad);
					const sy = Math.max(0, Math.floor(y0 * scale) - pad);
					const ex = Math.min(ink.size[0], Math.ceil(x1 * scale) + pad);
					const ey = Math.min(ink.size[1], Math.ceil(y1 * scale) + pad);
					if (ex > sx && ey > sy) scissor = [sx, sy, ex - sx, ey - sy];
				}
				f.pass(
					{ target: ink, clear: replay ? [1, 0, 0, 0] : false, ...(scissor ? { scissor } : {}) },
					(pass) => {
						for (const s of batch) drawSegment(pass, s, scale);
					},
				);
			}
			f.pass({ target: canvasSurface, clear: [0, 0, 0, 0] }, (pass) => pass.draw(present));
		});
	};

	function schedule() {
		if (!raf) raf = requestAnimationFrame(render);
	}

	// Render right now (used from inside an animation frame, to avoid a frame of lag).
	function flush() {
		if (raf) cancelAnimationFrame(raf);
		render();
	}

	// Start observing only once render/schedule exist (they are consts above).
	const observer = new ResizeObserver(syncSize);
	observer.observe(canvas);
	syncSize();
	gpu.onError?.((err: unknown) => console.error('[marker] GPU error', err));

	const stopRewind = () => {
		window.clearTimeout(delayTimer);
		delayTimer = 0;
		if (rewindRaf) cancelAnimationFrame(rewindRaf);
		rewindRaf = 0;
	};

	// The point of the path at `distance` px from its start.
	const pointAt = (distance: number): { x: number; y: number } | null => {
		if (segments.length === 0) return null;
		let lo = 0;
		let hi = segments.length - 1;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (segments[mid][5] >= distance) hi = mid;
			else lo = mid + 1;
		}
		const s = segments[lo];
		const span = s[5] - s[4];
		const u = span > 0 ? Math.min(1, Math.max(0, (distance - s[4]) / span)) : 0;
		return { x: s[0] + (s[2] - s[0]) * u, y: s[1] + (s[3] - s[1]) * u };
	};

	// Forget the path so the next stroke starts fresh.
	const reset = () => {
		segments.length = 0;
		pending = [];
		pathLength = 0;
		progressScale = INITIAL_PROGRESS_SCALE;
		cut = null;
		needsReplay = true; // clears the ink
	};

	// Walks the cut from the end of the trail back to its start with an ease-out, telling
	// the caller where it is so the square can travel back along its own trail.
	const startRewind = () => {
		const from = pathLength;
		if (from <= 0 || segments.length === 0) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const duration = reduce
			? 0
			: Math.min(REWIND_MAX_S, Math.max(REWIND_MIN_S, from / REWIND_PX_PER_S)) * 1000;
		const start = performance.now();
		const tick = (now: number) => {
			const p = duration > 0 ? Math.min(1, Math.max(0, (now - start) / duration)) : 1;
			const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
			cut = from * (1 - eased);
			const point = pointAt(cut);
			if (p >= 1) {
				rewindRaf = 0;
				if (point) onRewind?.(point.x, point.y, true);
				reset();
			} else {
				rewindRaf = requestAnimationFrame(tick);
				if (point) onRewind?.(point.x, point.y, false);
			}
			flush();
		};
		rewindRaf = requestAnimationFrame(tick);
	};

	return {
		segment(x0, y0, x1, y1, ang0 = 0, ang1 = ang0) {
			const c0 = pathLength;
			pathLength += Math.hypot(x1 - x0, y1 - y0);
			const s: Segment = [x0, y0, x1, y1, c0, pathLength, ang0, ang1];
			// A very long scribble outgrows the half-float range: widen it and redraw.
			if (pathLength > progressScale) {
				progressScale *= 2;
				needsReplay = true;
			}
			segments.push(s);
			pending.push(s);
			schedule();
		},
		hold() {
			const wasRewinding = cut !== null;
			stopRewind();
			if (wasRewinding && cut !== null) {
				// Interrupted halfway: what the square already rewound over is gone; the rest stays
				// and the new stroke continues from the square.
				const limit = cut;
				const kept = segments.filter((s) => s[4] < limit);
				segments.length = 0;
				segments.push(...kept);
				pathLength = kept.length ? kept[kept.length - 1][5] : 0;
				pending = [];
				cut = null;
				needsReplay = true;
				schedule();
			}
		},
		release() {
			stopRewind();
			delayTimer = window.setTimeout(startRewind, REWIND_DELAY_MS);
		},
		dispose() {
			stopRewind();
			if (raf) cancelAnimationFrame(raf);
			observer.disconnect();
			stroke.dispose();
			present.dispose();
			gpu.dispose();
		},
	};
}
