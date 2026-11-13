// Draws the ink onto the transparent canvas, hiding what the cut has passed.
// r = path progress of the oldest stamp on the pixel, a = coverage (see stroke.wgsl).
// Pixels beyond `cut` fade out over `feather` (a few px of path, just anti-aliasing).
struct Params {
  cut: f32,
  feather: f32,
  color: vec3f,
}
@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var src: texture_2d<f32>;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let texel = vec2i(uv * vec2f(textureDimensions(src)));
  let ink = textureLoad(src, texel, 0);
  let alpha = ink.a * (1.0 - smoothstep(params.cut, params.cut + params.feather, ink.r));
  return vec4f(params.color * alpha, alpha);
}
