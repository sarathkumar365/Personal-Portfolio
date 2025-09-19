"use client";

import type { CSSProperties, ReactNode } from "react";
import RippleGrid, { type RippleGridProps } from "@/components/ripple-grid";

type RippleFrameProps = {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  gridProps?: RippleGridProps;
};

export default function RippleFrame({
  children,
  className,
  borderWidth = 2,
  gridProps,
}: RippleFrameProps) {
  const maskStyle = {
    padding: borderWidth,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as CSSProperties;

  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <div
        className="pointer-events-none absolute inset-0"
        style={maskStyle}
        aria-hidden="true"
      >
        <RippleGrid
          {...gridProps}
          className="absolute inset-0 opacity-80 mix-blend-screen"
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
