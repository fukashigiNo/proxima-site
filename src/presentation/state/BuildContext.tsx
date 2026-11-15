"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { evaluateBuild, type BuildSummary } from "@/application/use-cases/EvaluateBuild";
import { removeCategory, selectComponent, type BuildSelection } from "@/domain/entities/Build";
import type { ComponentCategory, PcComponent } from "@/domain/entities/PcComponent";

interface State {
  selection: BuildSelection;
  activeCategory: ComponentCategory;
  presetTitle: string | null;
}

type Action =
  | { type: "select"; component: PcComponent }
  | { type: "remove"; category: ComponentCategory }
  | { type: "focus"; category: ComponentCategory }
  | { type: "load"; selection: BuildSelection; title: string }
  | { type: "reset" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "select":
      return { ...state, selection: selectComponent(state.selection, action.component), presetTitle: null };
    case "remove":
      return { ...state, selection: removeCategory(state.selection, action.category), presetTitle: null };
    case "focus":
      return { ...state, activeCategory: action.category };
    case "load":
      return { ...state, selection: action.selection, presetTitle: action.title };
    case "reset":
      return { ...state, selection: {}, presetTitle: null };
  }
};

interface BuildContextValue extends State {
  summary: BuildSummary;
  select: (component: PcComponent) => void;
  remove: (category: ComponentCategory) => void;
  focus: (category: ComponentCategory) => void;
  loadPreset: (selection: BuildSelection, title: string) => void;
  reset: () => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({
  initial,
  initialTitle = null,
  initialCategory = "cpu",
  children,
}: {
  initial: BuildSelection;
  initialTitle?: string | null;
  initialCategory?: ComponentCategory;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    selection: initial,
    activeCategory: initialCategory,
    presetTitle: initialTitle,
  });

  const select = useCallback((component: PcComponent) => dispatch({ type: "select", component }), []);
  const remove = useCallback((category: ComponentCategory) => dispatch({ type: "remove", category }), []);
  const focus = useCallback((category: ComponentCategory) => dispatch({ type: "focus", category }), []);
  const loadPreset = useCallback(
    (selection: BuildSelection, title: string) => dispatch({ type: "load", selection, title }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const summary = useMemo(() => evaluateBuild(state.selection), [state.selection]);

  const value = useMemo(
    () => ({ ...state, summary, select, remove, focus, loadPreset, reset }),
    [state, summary, select, remove, focus, loadPreset, reset],
  );

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild() {
  const context = useContext(BuildContext);
  if (!context) throw new Error("useBuild must be used inside <BuildProvider>");
  return context;
}
