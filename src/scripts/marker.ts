/**
 * The orange square in the header is a toy brush.
 *  - Drag it: it follows the pointer with a little lag, leans into the direction
 *    of movement and leaves a trail of itself on the page.
 *  - Let go: a few seconds later the square walks back along its own trail to where
 *    it started, and the trail is rubbed out behind it as it goes.
 * The trail is drawn on a WebGPU canvas loaded on first use. Without WebGPU the
 * square still moves and glides home on a soft spring, it just leaves no trail.
 */
import type { Ink } from '../lib/marker/ink';

const CORNER_RATIO = 0.22; // matches `rounded-[22%]` on the square

// Feel
const FOLLOW_TAU = 0.045; // s: how late the square trails the pointer
const MAX_LEAN = 0.12; // rad (~7deg)
const LEAN_FULL_SPEED = 4500; // px/s of horizontal speed for the full lean
const LEAN_TAU = 0.09; // s: how smoothly the lean changes
const SPRING_K = 170; // slightly under-damped: a small, soft overshoot
const SPRING_C = 22;
const FALLBACK_RETURN_MS = 3000; // when there is no trail to wait for
const CHORD_PX = 6; // length of the pieces a smoothed curve is stamped in

const el = document.getElementById('marker');

if (el) {
	const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

	let inkPromise: Promise<Ink | null> | null = null;
	let canvas: HTMLCanvasElement | null = null;
	let ink: Ink | null = null;

	const accentColor = (): [number, number, number] => {
		const hex = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
		const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
		return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.9, 0.24, 0];
	};

	// Loads vgpu lazily; resolves to null when WebGPU is not available.
	const loadInk = () => {
		inkPromise ??= (async () => {
			if (!('gpu' in navigator)) return null;
			try {
				const { createInk } = await import('../lib/marker/ink');
				canvas = document.createElement('canvas');
				canvas.setAttribute('aria-hidden', 'true');
				canvas.style.cssText =
					'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:40';
				document.body.appendChild(canvas);
				return await createInk({
					canvas,
					color: accentColor(),
					size: el.getBoundingClientRect().width,
					cornerRatio: CORNER_RATIO,
					// The trail is being rewound: the square travels along it, back to its start.
					onRewind: (x, y, done) => rewindTo(x, y, done),
				});
			} catch (err) {
				console.error('[marker] could not start the drawing layer', err);
				canvas?.remove();
				return null;
			}
		})();
		return inkPromise;
	};

	// Warm up the module as soon as the pointer is near.
	el.addEventListener('pointerenter', () => void loadInk(), { once: true });

	// ---- State ---------------------------------------------------------------

	type Mode = 'idle' | 'drag' | 'return' | 'rewind';
	let mode: Mode = 'idle';

	// Offset of the square from its place in the layout, and its lean.
	let tx = 0;
	let ty = 0;
	let lean = 0;
	let leanRefTx = 0; // tx at the end of the previous step, to measure speed for the lean
	// Where the pointer wants the square (drag) / spring velocity (return).
	let goalTx = 0;
	let goalTy = 0;
	let vtx = 0;
	let vty = 0;

	type Drag = {
		id: number;
		startX: number;
		startY: number;
		startTx: number;
		startTy: number;
		bounds: { minTx: number; maxTx: number; minTy: number; maxTy: number };
	};
	let drag: Drag | null = null;
	let releasing = false; // pointer is up, the square is still catching up
	let natCx = 0; // centre of the square in page coords when untranslated
	let natCy = 0;

	// Trail: the last two centres, and where the smoothed curve stopped.
	let c0 = { x: 0, y: 0 };
	let c1 = { x: 0, y: 0 };
	let lastEnd = { x: 0, y: 0 };
	let lastAngle = 0;
	let dotStamped = false; // a press without movement still leaves one stamp

	let returnTimer = 0;
	let raf = 0;
	let lastTime = 0;

	const apply = () => {
		el.style.translate = `${tx}px ${ty}px`;
		el.style.rotate = `${lean}rad`;
	};
	const centre = () => ({ x: natCx + tx, y: natCy + ty });
	const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
		x: (a.x + b.x) / 2,
		y: (a.y + b.y) / 2,
	});

	// Stamps a quadratic curve s -> e (control point k) as short chords, rotating the brush a0 -> a1.
	const stampCurve = (
		s: { x: number; y: number },
		k: { x: number; y: number },
		e: { x: number; y: number },
		a0: number,
		a1: number,
	) => {
		if (!ink) return;
		const length = Math.hypot(k.x - s.x, k.y - s.y) + Math.hypot(e.x - k.x, e.y - k.y);
		const n = clamp(Math.ceil(length / CHORD_PX), 1, 48);
		let px = s.x;
		let py = s.y;
		for (let i = 1; i <= n; i++) {
			const t = i / n;
			const u = 1 - t;
			const x = u * u * s.x + 2 * u * t * k.x + t * t * e.x;
			const y = u * u * s.y + 2 * u * t * k.y + t * t * e.y;
			ink.segment(px, py, x, y, a0 + (a1 - a0) * ((i - 1) / n), a0 + (a1 - a0) * t);
			px = x;
			py = y;
		}
	};

	// Once the square has settled after letting go: close the trail and start the countdown.
	const finishDrag = () => {
		releasing = false;
		mode = 'idle';
		delete el.dataset.mode;
		const end = centre();
		if (ink) {
			ink.segment(lastEnd.x, lastEnd.y, end.x, end.y, lastAngle, lean);
			ink.release();
		} else {
			// No trail to wait for: just go home after a pause.
			window.clearTimeout(returnTimer);
			returnTimer = window.setTimeout(startReturn, FALLBACK_RETURN_MS);
		}
	};

	// The trail's rewind says where the square belongs on its path (page coordinates).
	function rewindTo(x: number, y: number, done: boolean) {
		if (mode === 'drag') return;
		if (done) {
			// The path starts at the square's own place.
			tx = ty = 0;
			mode = 'idle';
		} else {
			mode = 'rewind';
			tx = x - natCx;
			ty = y - natCy;
		}
		apply();
		ensureLoop();
	}

	function startReturn() {
		if (mode === 'drag') return;
		if (reduceMotion()) {
			tx = ty = lean = 0;
			vtx = vty = 0;
			mode = 'idle';
			apply();
			return;
		}
		vtx = vty = 0;
		mode = 'return';
		ensureLoop();
	}

	function step(now: number) {
		raf = 0;
		const dt = clamp((now - lastTime) / 1000, 0.001, 0.05);
		lastTime = now;
		const prevTx = leanRefTx;
		const reduce = reduceMotion();

		if (mode === 'drag') {
			const a = reduce ? 1 : 1 - Math.exp(-dt / FOLLOW_TAU);
			tx += (goalTx - tx) * a;
			ty += (goalTy - ty) * a;
		} else if (mode === 'return') {
			// Damped spring towards home.
			vtx += (-SPRING_K * tx - SPRING_C * vtx) * dt;
			vty += (-SPRING_K * ty - SPRING_C * vty) * dt;
			tx += vtx * dt;
			ty += vty * dt;
			if (Math.hypot(tx, ty) < 0.3 && Math.hypot(vtx, vty) < 5) {
				tx = ty = 0;
				vtx = vty = 0;
				mode = 'idle';
			}
		}

		// Lean into the direction of travel, smoothly.
		const prevLean = lean;
		const leanGoal = reduce ? 0 : clamp((tx - prevTx) / dt / LEAN_FULL_SPEED, -1, 1) * MAX_LEAN;
		lean += (leanGoal - lean) * (reduce ? 1 : 1 - Math.exp(-dt / LEAN_TAU));
		apply();
		leanRefTx = tx;

		if (mode === 'drag') {
			// Stamp a smoothed curve through the midpoints of the last three centres: it
			// lags half a step behind the square, which is hidden under the square itself.
			const c2 = centre();
			const s = mid(c0, c1);
			const e = mid(c1, c2);
			const moved = Math.hypot(c1.x - s.x, c1.y - s.y) + Math.hypot(e.x - c1.x, e.y - c1.y) > 0.01;
			if (moved || (!dotStamped && ink)) {
				stampCurve(s, c1, e, lastAngle, lean);
				dotStamped = true;
			}
			lastEnd = e;
			lastAngle = lean;
			c0 = c1;
			c1 = c2;

			if (releasing && Math.hypot(goalTx - tx, goalTy - ty) < 0.3) finishDrag();
		}

		if (mode !== 'idle' || Math.abs(lean) > 0.002) {
			ensureLoop();
		} else if (lean !== 0) {
			lean = 0;
			apply();
		}
	}

	function ensureLoop() {
		if (raf) return;
		lastTime = performance.now();
		raf = requestAnimationFrame(step);
	}

	// ---- Pointer -------------------------------------------------------------

	el.addEventListener('pointerdown', (e) => {
		if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
		e.preventDefault();
		el.setPointerCapture(e.pointerId);

		window.clearTimeout(returnTimer);
		ink?.hold(); // stop a pending or running retraction
		vtx = vty = 0;
		releasing = false;
		mode = 'drag';
		leanRefTx = tx;
		el.dataset.mode = 'drag';

		const r = el.getBoundingClientRect();
		// Where the square sits untranslated, to keep it inside the page.
		const naturalLeft = r.left + window.scrollX - tx;
		const naturalTop = r.top + window.scrollY - ty;
		natCx = naturalLeft + r.width / 2;
		natCy = naturalTop + r.height / 2;

		drag = {
			id: e.pointerId,
			startX: e.pageX,
			startY: e.pageY,
			startTx: tx,
			startTy: ty,
			bounds: {
				minTx: -naturalLeft,
				maxTx: document.documentElement.clientWidth - r.width - naturalLeft,
				minTy: -naturalTop,
				maxTy: document.documentElement.scrollHeight - r.height - naturalTop,
			},
		};
		goalTx = tx;
		goalTy = ty;

		// Start the trail from where the square is now.
		c0 = c1 = lastEnd = centre();
		lastAngle = lean;
		dotStamped = false;
		void loadInk().then((loaded) => {
			if (!loaded || mode !== 'drag') return;
			ink = loaded;
			ink.hold();
			// The layer may have taken a moment to load: restart the trail from the square.
			c0 = c1 = lastEnd = centre();
			lastAngle = lean;
			dotStamped = false;
		});
		ensureLoop();
	});

	el.addEventListener('pointermove', (e) => {
		if (!drag || e.pointerId !== drag.id) return;
		goalTx = clamp(drag.startTx + e.pageX - drag.startX, drag.bounds.minTx, drag.bounds.maxTx);
		goalTy = clamp(drag.startTy + e.pageY - drag.startY, drag.bounds.minTy, drag.bounds.maxTy);
	});

	const end = (e: PointerEvent) => {
		if (!drag || e.pointerId !== drag.id) return;
		drag = null;
		// Let the square finish catching up with the pointer, then close the trail.
		releasing = true;
		ensureLoop();
	};
	el.addEventListener('pointerup', end);
	el.addEventListener('pointercancel', end);
	el.addEventListener('contextmenu', (e) => e.preventDefault());
}
