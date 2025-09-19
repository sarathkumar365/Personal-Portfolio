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
    <div className="pointer-events-none fixed left-6 top-8 z-40 flex w-full max-w-[200px] justify-start sm:left-10 sm:top-10">
      <span
        className={`select-none text-2xl font-bold tracking-[0.08em] text-black/85 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] transition-all duration-500 sm:text-[1.85rem] ${
          fontClass
        } ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
      >
        {name}
      </span>
    </div>
  );
}
