"use client";

import { PartMaterial, GlowStrip } from "../parts/PartMaterial";
import { SCENE_COLORS as C } from "../theme";
import { Fan } from "./Fan";

const noRaycast = () => null;

function Glass({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position} raycast={noRaycast}>
      <boxGeometry args={args} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.07} depthWrite={false} />
    </mesh>
  );
}

export function CaseShell({ color }: { color: "black" | "white" }) {
  const body = color === "white" ? C.chassisWhite : C.chassisBlack;
  const shroud = color === "white" ? "#dadad5" : "#29292d";

  return (
    <group>
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[2, 2.3, 0.04]} />
        <PartMaterial color={body} roughness={0.7} />
      </mesh>
      {[1.13, -1.13].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[2, 0.04, 1.04]} />
          <PartMaterial color={body} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[-0.98, 0, 0]}>
        <boxGeometry args={[0.04, 2.3, 1.04]} />
        <PartMaterial color={body} roughness={0.7} />
      </mesh>
      {[
        [0.98, 0.5],
        [0.98, -0.5],
        [-0.98, 0.5],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0, z]}>
          <boxGeometry args={[0.04, 2.3, 0.04]} />
          <PartMaterial color={body} roughness={0.7} />
        </mesh>
      ))}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, -1.19, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.9]} />
          <PartMaterial color={body} roughness={0.8} />
        </mesh>
      ))}

      <Glass position={[0, 0, 0.52]} args={[1.96, 2.26, 0.015]} />
      <Glass position={[0.99, 0, 0]} args={[0.015, 2.22, 1]} />

      <mesh position={[0, -0.62, 0]}>
        <boxGeometry args={[1.92, 0.02, 1]} />
        <PartMaterial color={shroud} roughness={0.6} />
      </mesh>
      <mesh position={[0.4, -0.87, 0]}>
        <boxGeometry args={[1.12, 0.48, 1]} />
        <PartMaterial color={shroud} roughness={0.6} />
      </mesh>
      <GlowStrip position={[0.4, -0.87, 0.505]} args={[0.5, 0.022, 0.005]} />

      {[0.62, 0.18, -0.26].map((y) => (
        <Fan key={y} position={[0.93, y, 0]} rotation={[0, Math.PI / 2, 0]} size={0.4} speed={5} />
      ))}
      <Fan position={[-0.93, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={0.34} speed={5} />
    </group>
  );
}
