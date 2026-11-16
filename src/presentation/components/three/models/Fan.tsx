"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { BoxGeometry, type BufferGeometry, type Group } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PartMaterial } from "../parts/PartMaterial";
import { usePartState } from "../parts/PartContext";
import { SCENE_COLORS } from "../theme";

interface FanProps {
  size?: number;
  speed?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const BLADES = 7;

const rotorCache = new Map<number, BufferGeometry>();
const rotorGeometry = (radius: number) => {
  const key = Math.round(radius * 1000);
  let geometry = rotorCache.get(key);
  if (!geometry) {
    const blades = Array.from({ length: BLADES }, (_, i) => {
      const blade = new BoxGeometry(radius * 0.6, radius * 0.32, 0.006);
      blade.rotateX(0.45);
      blade.translate(radius * 0.55, 0, 0);
      blade.rotateZ((i / BLADES) * Math.PI * 2);
      return blade;
    });
    geometry = mergeGeometries(blades)!;
    blades.forEach((b) => b.dispose());
    rotorCache.set(key, geometry);
  }
  return geometry;
};

export function Fan({ size = 0.36, speed = 6, position, rotation }: FanProps) {
  const rotor = useRef<Group>(null);
  const { ghost } = usePartState();
  const radius = size / 2;

  useFrame((_, delta) => {
    if (rotor.current && !ghost) rotor.current.rotation.z -= delta * speed;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius * 0.92, radius * 0.06, 12, 48]} />
        <PartMaterial color={SCENE_COLORS.accent} glow={1.4} roughness={0.3} />
      </mesh>
      <group ref={rotor}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.28, radius * 0.28, size * 0.12, 24]} />
          <PartMaterial color="#d0d0cc" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh geometry={rotorGeometry(radius)}>
          <PartMaterial color="#2c2c30" metalness={0.2} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
