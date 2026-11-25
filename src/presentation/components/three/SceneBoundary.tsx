"use client";

import { Component, type ReactNode } from "react";

export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[3D] сцена отключена:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
