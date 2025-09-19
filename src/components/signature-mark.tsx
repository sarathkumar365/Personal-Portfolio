"use client";

import { useEffect, useState } from "react";

type SignatureMarkProps = {
  fontClass: string;
  name: string;
};

const SIGNATURE_EVENT = "signature:show";

export default function SignatureMark({ fontClass, name }: SignatureMarkProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reveal = () => setVisible(true);

    window.addEventListener(SIGNATURE_EVENT, reveal);

    const fallback = window.setTimeout(reveal, 3200);

    return () => {
      window.removeEventListener(SIGNATURE_EVENT, reveal);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-6 top-8 z-40 flex w-full max-w-[220px] justify-start sm:left-12 sm:top-12">
      <span
        className={`select-none text-[1.55rem] font-extrabold tracking-[0.05em] text-black/85 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35),0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-400 sm:text-[2rem] ${
          fontClass
        } ${visible ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0"}`}
      >
        {name}
      </span>
    </div>
  );
}
