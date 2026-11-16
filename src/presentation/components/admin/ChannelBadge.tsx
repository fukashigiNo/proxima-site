import { REQUEST_CHANNEL_LABELS, channelOf, type BuildRequest, type RequestChannel } from "@/domain/entities/BuildRequest";
import { cn } from "@/presentation/lib/cn";

const TONES: Record<RequestChannel, string> = {
  site: "border-line-strong text-muted",
  telegram: "border-[#2aabee]/40 text-[#2aabee]",
  whatsapp: "border-[#25d366]/40 text-[#1fa855]",
};

export function ChannelBadge({ request }: { request: BuildRequest }) {
  const channel = channelOf(request);
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]", TONES[channel])}>
      {REQUEST_CHANNEL_LABELS[channel]}
    </span>
  );
}

export const requestTitle = (request: BuildRequest) =>
  request.name ||
  (request.buildTitle ? `${request.buildTitle} · чат ${REQUEST_CHANNEL_LABELS[channelOf(request)]}` : `Чат ${REQUEST_CHANNEL_LABELS[channelOf(request)]}`);
