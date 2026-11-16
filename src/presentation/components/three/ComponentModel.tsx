"use client";

import type { PcComponent } from "@/domain/entities/PcComponent";
import { CaseShell } from "./models/CaseShell";
import { AioPump, AioRadiator, AirCooler } from "./models/Cooling";
import { Cpu } from "./models/Cpu";
import { Gpu } from "./models/Gpu";
import { Motherboard } from "./models/Motherboard";
import { Psu } from "./models/Psu";
import { Ram } from "./models/Ram";
import { Storage } from "./models/Storage";

export function ComponentModel({ component }: { component: PcComponent }) {
  switch (component.category) {
    case "case":
      return <CaseShell color={component.color} />;
    case "motherboard":
      return <Motherboard formFactor={component.formFactor} />;
    case "cpu":
      return (
        <group scale={3}>
          <Cpu />
        </group>
      );
    case "cooling":
      return component.kind === "air" ? (
        <group rotation={[0, -0.6, 0]}>
          <AirCooler heightMm={component.heightMm} />
        </group>
      ) : (
        <group>
          <group rotation={[-1.15, 0, 0]}>
            <AioRadiator radiatorMm={component.radiatorMm} />
          </group>
          <group position={[0, -0.6, 0.1]}>
            <AioPump />
          </group>
        </group>
      );
    case "ram":
      return (
        <group rotation={[0, -0.5, 0]}>
          <Ram sticks={component.sticks} />
        </group>
      );
    case "gpu":
      return (
        <group rotation={[-1.15, 0, 0]}>
          <Gpu lengthMm={component.lengthMm} fans={component.fans} slots={component.slots} />
        </group>
      );
    case "storage":
      return (
        <group scale={2.5}>
          <Storage gen={component.pcieGen} />
        </group>
      );
    case "psu":
      return <Psu wattage={component.wattage} />;
  }
}
