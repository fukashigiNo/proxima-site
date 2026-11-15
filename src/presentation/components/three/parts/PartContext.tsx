"use client";

import { createContext, useContext } from "react";

export type PartStatus = "idle" | "active" | "error";

export interface PartState {
  status: PartStatus;
  /** Деталь не выбрана — рисуется полупрозрачным «призраком» */
  ghost: boolean;
}

export const PartContext = createContext<PartState>({ status: "idle", ghost: false });
export const usePartState = () => useContext(PartContext);
