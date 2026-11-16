import { cn } from "@/presentation/lib/cn";

export function Logo({ className, title = "PRX comp — Proxima Computers" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="129 180 765 617" className={cn("logo h-10 w-auto", className)} role="img" aria-label={title}>
      <path className="logo-folder" fill="#252e38" d="M159 180H402Q410 180 415 186L466 242Q471 248 479 248H864A30 30 0 0 1 894 278V767A30 30 0 0 1 864 797H159A30 30 0 0 1 129 767V210A30 30 0 0 1 159 180Z" />
      <path className="logo-bookmark" fill="var(--bg)" d="M214 180H318V300L266 268L214 300Z" />
      <path className="logo-prx" fill="#fff" fillRule="evenodd" d="M226 402H373L393 422V514L371 536H264V598H226Z M264 439V498H354V439Z M424 402H570L590 422V508L564 536L590 571V598H552L520 537H462V598H424Z M462 439V494H552V439Z M619 402H659V426L708 478L757 426V402H797V426L737 500L797 573V598H758V575L708 524L658 575V598H618V573L679 500L619 426Z" />
      <text
        className="logo-comp"
        x="433"
        y="731"
        fill="#a6a6a6"
        fontFamily="var(--font-sans)"
        fontSize="143"
        textLength="369"
        lengthAdjust="spacingAndGlyphs"
      >
        comp
      </text>
    </svg>
  );
}
