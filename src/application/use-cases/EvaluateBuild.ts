import type { BuildSelection } from "@/domain/entities/Build";
import type { ComponentCategory, PcComponent } from "@/domain/entities/PcComponent";
import {
  PSU_HEADROOM,
  checkCompatibility,
  estimatePowerDraw,
  issuesForCandidate,
  missingCategories,
  totalPrice,
  type CompatibilityIssue,
} from "@/domain/services/compatibility";

/** Стоимость работ: сборка, кабель-менеджмент, тестирование (₸). */
export const ASSEMBLY_FEE = 25_000;

export interface BuildSummary {
  readonly partsPrice: number;
  readonly assemblyFee: number;
  readonly total: number;
  readonly powerDraw: number;
  readonly recommendedPsu: number;
  readonly issues: CompatibilityIssue[];
  readonly missing: ComponentCategory[];
  /** Категории в конфликте (ошибки) — подсвечиваются красным */
  readonly conflictCategories: ComponentCategory[];
  readonly isComplete: boolean;
  readonly isValid: boolean;
}

/** Чистый use case без I/O — безопасно вызывать на клиенте при каждом изменении. */
export const evaluateBuild = (selection: BuildSelection): BuildSummary => {
  const partsPrice = totalPrice(selection);
  const powerDraw = estimatePowerDraw(selection);
  const issues = checkCompatibility(selection);
  const missing = missingCategories(selection);
  const conflictCategories = [
    ...new Set(issues.filter((i) => i.severity === "error").flatMap((i) => i.categories)),
  ];
  return {
    partsPrice,
    assemblyFee: partsPrice > 0 ? ASSEMBLY_FEE : 0,
    total: partsPrice > 0 ? partsPrice + ASSEMBLY_FEE : 0,
    powerDraw,
    recommendedPsu: Math.ceil((powerDraw * PSU_HEADROOM) / 50) * 50,
    issues,
    missing,
    conflictCategories,
    isComplete: missing.length === 0,
    isValid: missing.length === 0 && conflictCategories.length === 0,
  };
};

export type CandidateStatus = "ok" | "warning" | "error";

export interface CandidateEvaluation {
  readonly status: CandidateStatus;
  readonly reasons: string[];
}

/** Как изменится совместимость, если выбрать этот вариант. */
export const evaluateCandidate = (selection: BuildSelection, candidate: PcComponent): CandidateEvaluation => {
  const issues = issuesForCandidate(selection, candidate);
  const status: CandidateStatus = issues.some((i) => i.severity === "error")
    ? "error"
    : issues.length > 0
      ? "warning"
      : "ok";
  return { status, reasons: issues.map((i) => i.message) };
};
