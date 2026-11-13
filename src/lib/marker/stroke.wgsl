// One brush segment: the squircle stamped along a -> b, in ink pixels.
// The brush has the same shape as the header square (CSS `corner-shape: squircle`,
// order-4 superellipse corners).
//
// The ink target stores, per pixel: r = how far along the path the OLDEST stamp
// covering it sits (0..1, written with a min blend, cleared to 1), a = coverage
// (max blend). The present pass hides pixels whose r is beyond a moving cut, which
// rewinds the trail from its end back to its start. Because r is the oldest stamp,
// where the path crosses itself the earlier part is not bitten while it is still
// meant to be visible. r is interpolated along the segment, so the cut moves
// continuously and not segment by segment.
struct Params {
  a: vec2f,
  b: vec2f,
  size: vec2f,
  half: f32,    // half of the square's side
  corner: f32,  // corner radius
  t0: f32,      // path progress at `a`
  t1: f32,      // path progress at `b`
  ang0: f32,    // brush rotation (radians, clockwise) at `a`
  ang1: f32,    // brush rotation at `b`
}
@group(0) @binding(0) var<uniform> params: Params;

// Anti-aliased coverage of the squircle centred at the origin, rotated by `angle`.
fn squircle(local: vec2f, angle: f32) -> f32 {
  // Into brush space (inverse of a clockwise rotation, y pointing down).
  let cs = cos(angle);
  let sn = sin(angle);
  let p = vec2f(local.x * cs + local.y * sn, -local.x * sn + local.y * cs);
  let q = max(abs(p) - vec2f(params.half - params.corner), vec2f(0.0));
  let f = pow(q.x / params.corner, 4.0) + pow(q.y / params.corner, 4.0);
  let d = (pow(f, 0.25) - 1.0) * params.corner; // ~signed distance, exact along the edges
  return clamp(0.5 - d, 0.0, 1.0);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = uv * params.size;
  let ab = params.b - params.a;
  // One stamp every ~2px keeps the swept edge smooth.
  let steps = clamp(ceil(length(ab) / 2.0), 1.0, 64.0);
  var coverage = 0.0;
  var t = 1.0; // 1 = "never painted": a no-op for the min blend
  var found = false;
  for (var i = 0u; i <= u32(steps); i = i + 1u) {
    let s = f32(i) / steps;
    let c = squircle(p - (params.a + ab * s), mix(params.ang0, params.ang1, s));
    coverage = max(coverage, c);
    // The first stamp that touches this pixel is the oldest one.
    if (c > 0.0 && !found) {
      t = mix(params.t0, params.t1, s);
      found = true;
    }
  }
  return vec4f(t, 0.0, 0.0, coverage);
}
