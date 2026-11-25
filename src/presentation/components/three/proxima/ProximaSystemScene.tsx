"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  NormalBlending,
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  type Mesh,
  type ShaderMaterial,
  type Sprite,
  type Texture,
  Vector3,
} from "three";
import { SHOTS, type Shot } from "./shots";
import { glowTexture, proximaBTexture, proximaCTexture, proximaDTexture } from "./textures";

export interface ProgressSource {
  get(): number;
}

const PLANETS = [
  { name: "d", radius: 0.16, orbit: 2.2, speed: 0.16, spin: 0.9, tilt: 0.05, phase: 0.6, locked: false, texture: proximaDTexture },
  { name: "b", radius: 0.3, orbit: 3.5, speed: 0.07, spin: 0, tilt: 0.02, phase: 2.4, locked: true, texture: proximaBTexture },
  { name: "c", radius: 0.55, orbit: 8.2, speed: 0.012, spin: 0.35, tilt: 0.42, phase: 4.1, locked: false, texture: proximaCTexture },
] as const;

const planetAngle = (i: number, t: number) => PLANETS[i].phase + t * PLANETS[i].speed;
const planetPosition = (i: number, t: number, out: Vector3) => {
  const a = planetAngle(i, t);
  return out.set(Math.cos(a) * PLANETS[i].orbit, 0, Math.sin(a) * PLANETS[i].orbit);
};

const STAR_RADIUS = 0.85;
const ALPHA_A = new Vector3(-62, 9, -92);
const ALPHA_B = new Vector3(-58, 7.5, -95);
const DWELL_EPS = 1e-4;

const MAX_RECOVERIES = 3;

export default function ProximaSystemScene({
  progress,
  className,
  active = true,
  light = false,
}: {
  progress: ProgressSource;
  className?: string;
  active?: boolean;
  light?: boolean;
}) {
  const [generation, setGeneration] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const watchContext = useCallback(
    ({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
      gl.domElement.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          if (generation >= MAX_RECOVERIES) return;
          window.setTimeout(() => setGeneration((g) => g + 1), 250);
        },
        { once: true },
      );
    },
    [generation],
  );

  return (
    <Canvas
      key={generation}
      frameloop={active ? "always" : "never"}
      className={className}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      camera={{ position: SHOTS[0].kind === "fixed" ? SHOTS[0].position : [0, 6, 15], fov: 42, near: 0.05, far: 400 }}
      gl={{ antialias: !compact, alpha: true, powerPreference: compact ? "default" : "high-performance" }}
      onCreated={watchContext}
    >
      <ambientLight intensity={light ? 0.35 : 0.05} color={light ? "#e9e4ff" : "#ffffff"} />
      <pointLight position={[0, 0, 0]} intensity={34} decay={1.15} distance={0} color="#ffb08a" />
      <Star light={light} />
      <Planets textureScale={compact ? 0.6 : 1} light={light} />
      <CameraRig progress={progress} />
      <DustBelt light={light} />
      <AlphaCentauri light={light} />
    </Canvas>
  );
}

const STAR_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = `
  uniform float uTime;
  uniform float uFlare;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.07; a *= 0.5; } return s; }
  void main() {
    vec3 p = normalize(vPos) * 3.2;
    float cells = fbm(p + vec3(uTime * 0.05, uTime * 0.03, -uTime * 0.04));
    float spots = smoothstep(0.62, 0.78, fbm(p * 0.6 - uTime * 0.01));
    vec3 deep = vec3(0.62, 0.12, 0.03);
    vec3 hot = vec3(1.0, 0.55, 0.28);
    vec3 white = vec3(1.0, 0.86, 0.72);
    vec3 col = mix(deep, hot, smoothstep(0.25, 0.75, cells));
    col = mix(col, white, smoothstep(0.62, 0.9, cells) * 0.6);
    col *= 1.0 - spots * 0.55;
    float limb = pow(max(dot(vNormal, vView), 0.0), 0.45);
    col *= 0.45 + 0.75 * limb;
    col += vec3(1.0, 0.5, 0.3) * uFlare * 0.9;
    gl_FragColor = vec4(col * 1.35, 1.0);
  }
`;

const flareAt = (t: number) => {
  const period = 11;
  const local = t % period;
  return local < 0.25 ? local / 0.25 : Math.exp(-(local - 0.25) * 1.6);
};

function Star({ light }: { light: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const corona = useRef<Sprite>(null);
  const halo = useRef<Sprite>(null);
  const coronaTexture = useMemo(() => glowTexture("rgba(255,170,120,0.9)", "rgba(255,80,40,0.35)"), []);
  const haloTexture = useMemo(() => glowTexture("rgba(255,120,70,0.35)", "rgba(255,70,30,0.08)"), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFlare: { value: 0 } }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flare = flareAt(t) * 0.6;
    if (material.current) {
      material.current.uniforms.uTime.value = t;
      material.current.uniforms.uFlare.value = flare;
    }
    const pulse = 1 + Math.sin(t * 0.8) * 0.03 + flare * 0.35;
    corona.current?.scale.setScalar(STAR_RADIUS * 4.2 * pulse);
    halo.current?.scale.setScalar(STAR_RADIUS * 11 * (1 + flare * 0.25));
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[STAR_RADIUS, 64, 64]} />
        <shaderMaterial ref={material} uniforms={uniforms} vertexShader={STAR_VERTEX} fragmentShader={STAR_FRAGMENT} />
      </mesh>
      <sprite ref={corona}>
        <spriteMaterial map={coronaTexture} blending={light ? NormalBlending : AdditiveBlending} depthWrite={false} transparent opacity={light ? 0.75 : 1} />
      </sprite>
      <sprite ref={halo}>
        <spriteMaterial map={haloTexture} blending={light ? NormalBlending : AdditiveBlending} depthWrite={false} transparent opacity={light ? 0.55 : 0.8} />
      </sprite>
    </group>
  );
}

function Planets({ textureScale, light }: { textureScale: number; light: boolean }) {
  const refs = useRef<{ group: Group | null }[]>(PLANETS.map(() => ({ group: null })));
  const spinners = useRef<(Mesh | null)[]>([]);
  const textures = useMemo<Texture[]>(() => PLANETS.map((p) => p.texture(textureScale)), [textureScale]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    PLANETS.forEach((p, i) => {
      const group = refs.current[i].group;
      const mesh = spinners.current[i];
      if (!group || !mesh) return;
      const angle = planetAngle(i, t);
      planetPosition(i, t, group.position);
      if (p.locked) {
        group.rotation.y = -angle;
      } else {
        mesh.rotation.y += delta * p.spin;
      }
    });
  });

  return (
    <>
      {PLANETS.map((p, i) => (
        <group key={p.name}>
          <OrbitLine radius={p.orbit} light={light} />
          <group ref={(g) => void (refs.current[i].group = g)}>
            <group rotation={[0, 0, p.tilt]}>
              <mesh ref={(m) => void (spinners.current[i] = m)}>
                <sphereGeometry args={[p.radius, 64, 48]} />
                <meshStandardMaterial map={textures[i]} roughness={0.92} metalness={0} />
              </mesh>
              {p.name !== "d" && (
                <mesh scale={1.045}>
                  <sphereGeometry args={[p.radius, 48, 32]} />
                  <meshBasicMaterial color={p.name === "b" ? "#9fd0ff" : "#b9c8ff"} transparent opacity={0.08} depthWrite={false} />
                </mesh>
              )}
            </group>
          </group>
        </group>
      ))}
    </>
  );
}

function OrbitLine({ radius, light }: { radius: number; light: boolean }) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      points.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(points, 3));
    return g;
  }, [radius]);
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={light ? "#5b4a9e" : "#b4bfd8"} transparent opacity={light ? 0.38 : 0.5} />
    </lineLoop>
  );
}

function DustBelt({ light }: { light: boolean }) {
  const ref = useRef<Group>(null);
  const geometry = useMemo(() => {
    const count = 1400;
    const positions: number[] = [];
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 11 + rand() * 2.6 + (rand() - 0.5) * 0.8;
      positions.push(Math.cos(a) * r, (rand() - 0.5) * 0.35, Math.sin(a) * r);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return g;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.004;
  });
  return (
    <group ref={ref}>
      <points geometry={geometry}>
        <pointsMaterial color={light ? "#7d6aa8" : "#c9a58a"} size={0.05} sizeAttenuation transparent opacity={light ? 0.5 : 0.55} depthWrite={false} />
      </points>
    </group>
  );
}

function AlphaCentauri({ light }: { light: boolean }) {
  const a = useMemo(
    () => (light ? glowTexture("rgba(255,176,64,1)", "rgba(255,170,70,0.3)") : glowTexture("rgba(255,250,235,1)", "rgba(255,230,170,0.35)")),
    [light],
  );
  const b = useMemo(
    () => (light ? glowTexture("rgba(240,130,60,1)", "rgba(240,130,60,0.28)") : glowTexture("rgba(255,236,210,1)", "rgba(255,190,120,0.3)")),
    [light],
  );
  const blending = light ? NormalBlending : AdditiveBlending;
  return (
    <>
      <sprite position={ALPHA_A} scale={9}>
        <spriteMaterial map={a} blending={blending} depthWrite={false} transparent />
      </sprite>
      <sprite position={ALPHA_B} scale={6}>
        <spriteMaterial map={b} blending={blending} depthWrite={false} transparent />
      </sprite>
    </>
  );
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const tmp = { planet: new Vector3(), dir: new Vector3(), side: new Vector3(), right: new Vector3() };

function shotPose(shot: Shot, time: number, aspect: number, outPos: Vector3, outTarget: Vector3) {
  if (shot.kind === "fixed") {
    outPos.set(...shot.position);
    outTarget.set(...shot.target);
  } else {
    const p = planetPosition(shot.planet, time, tmp.planet);
    const toStar = tmp.dir.copy(p).normalize().negate();
    const perp = tmp.side.set(-toStar.z, 0, toStar.x);
    outPos
      .copy(p)
      .addScaledVector(toStar, Math.cos(shot.side) * shot.distance)
      .addScaledVector(perp, Math.sin(shot.side) * shot.distance);
    outPos.y += shot.height;
    outTarget.copy(p);
  }
  const view = tmp.right.copy(outTarget).sub(outPos);
  const dist = view.length();
  view.normalize();
  if (aspect >= 1) {
    const right = new Vector3().crossVectors(view, new Vector3(0, 1, 0)).normalize();
    outTarget.addScaledVector(right, -dist * 0.17);
  } else {
    outTarget.y -= dist * 0.18;
  }
}

function CameraRig({ progress }: { progress: ProgressSource }) {
  const { camera, size } = useThree();
  const posA = useRef(new Vector3());
  const posB = useRef(new Vector3());
  const tgtA = useRef(new Vector3());
  const tgtB = useRef(new Vector3());
  const look = useRef(new Vector3());
  const ready = useRef(false);

  useFrame(({ clock }, delta) => {
    const n = SHOTS.length;
    const time = clock.elapsedTime;
    const f = Math.min(Math.max(progress.get(), 0), 1) * (n - 1);
    const i = Math.min(Math.floor(f + DWELL_EPS), n - 1);
    const j = Math.min(i + 1, n - 1);
    const t = smoothstep(Math.min(Math.max(f - i, 0), 1));
    const aspect = size.width / Math.max(1, size.height);

    shotPose(SHOTS[i], time, aspect, posA.current, tgtA.current);
    shotPose(SHOTS[j], time, aspect, posB.current, tgtB.current);
    const pos = posA.current.lerp(posB.current, t);
    const target = tgtA.current.lerp(tgtB.current, t);
    if (aspect < 1) pos.sub(target).multiplyScalar(1.35).add(target);

    const k = ready.current ? 1 - Math.exp(-delta * 4) : 1;
    camera.position.lerp(pos, k);
    look.current.lerp(target, k);
    camera.lookAt(look.current);
    ready.current = true;
  });

  return null;
}
