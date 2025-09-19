"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import Link from "next/link";
import { usePageTransition } from "@/components/page-transition-provider";

interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  className?: string;
}

export default function TransitionLink({
  href,
  onClick,
  className,
  children,
  ...rest
}: TransitionLinkProps) {
  const { startTransition, isAnimating } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    startTransition(href);
  };

  const computedClassName = [
    className,
    isAnimating ? "pointer-events-none opacity-70" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={computedClassName}
      {...rest}
    >
      {children}
    </Link>
  );
}
