import { REQUEST_STATUS_LABELS, type RequestStatus } from "@/domain/entities/BuildRequest";
import { cn } from "@/presentation/lib/cn";

const TONES: Record<RequestStatus, string> = {
  new: "bg-accent/12 text-accent",
  in_progress: "bg-warning/15 text-warning-ink",
  done: "bg-success/12 text-success",
  cancelled: "bg-line text-muted",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", TONES[status])}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
