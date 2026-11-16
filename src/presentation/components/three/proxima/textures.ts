import { CanvasTexture, SRGBColorSpace, RepeatWrapping } from "three";

const fract = (x: number) => x - Math.floor(x);
const hash = (x: number, y: number, z: number) => fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453);
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
}

export function fbm(x: number, y: number, z: number, octaves = 4) {
  let sum = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq, z * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function sphereTexture(width: number, paint: (p: [number, number, number], lon: number, lat: number) => RGB) {
  const height = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  for (let j = 0; j < height; j++) {
    const lat = (0.5 - j / height) * Math.PI;
    for (let i = 0; i < width; i++) {
      const lon = (i / width) * Math.PI * 2;
      const p: [number, number, number] = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
      const [r, g, b] = paint(p, lon, lat);
      const k = (j * width + i) * 4;
      image.data[k] = r;
      image.data[k + 1] = g;
      image.data[k + 2] = b;
      image.data[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function proximaDTexture() {
  return sphereTexture(384, ([x, y, z]) => {
    const n = fbm(x * 3 + 7, y * 3, z * 3, 5);
    const crater = fbm(x * 9, y * 9 + 3, z * 9, 2);
    let c = mix([52, 40, 36], [128, 86, 62], clamp01((n - 0.35) * 2.2));
    if (crater > 0.66) c = mix(c, [30, 24, 22], clamp01((crater - 0.66) * 8));
    if (crater > 0.6 && crater < 0.63) c = mix(c, [160, 120, 96], 0.6);
    return c;
  });
}

export function proximaBTexture() {
  return sphereTexture(768, ([x, y, z]) => {
    const n = fbm(x * 4 + 11, y * 4, z * 4, 5);
    const detail = fbm(x * 12 + 3, y * 12, z * 12, 3);
    const toStar = clamp01(x);
    const e = toStar + (n - 0.5) * 0.3 + (detail - 0.5) * 0.08;
    const band = (lo: number, hi: number) => clamp01((e - lo) / (hi - lo));
    const ocean = mix([16, 50, 96], [30, 92, 150], clamp01((n - 0.3) * 2));
    const land = mix([86, 70, 56], [146, 124, 98], detail);
    const ice = mix([170, 192, 212], [238, 245, 252], clamp01((n - 0.3) * 1.8));
    let c = mix(ice, land, band(0.5, 0.6));
    c = mix(c, [60, 110, 130], band(0.66, 0.71));
    c = mix(c, ocean, band(0.7, 0.78));
    return c;
  });
}

export function proximaCTexture() {
  return sphereTexture(512, ([x, y, z], _lon, lat) => {
    const warp = fbm(x * 2.5, y * 2.5 + 4, z * 2.5, 4);
    const bands = 0.5 + 0.5 * Math.sin(lat * 9 + warp * 4);
    const haze = fbm(x * 5 + 2, y * 5, z * 5, 4);
    let c = mix([70, 92, 120], [150, 172, 196], bands * 0.7 + haze * 0.3);
    c = mix(c, [205, 220, 232], clamp01((haze - 0.62) * 3));
    return c;
  });
}

export function glowTexture(inner: string, outer: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, outer);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
