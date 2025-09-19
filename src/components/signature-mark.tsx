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
    <div className="pointer-events-none sticky top-5 z-40 mb-4 flex justify-start">
      <span
        className={`select-none text-2xl text-black/70 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-all duration-500 sm:text-3xl ${
          fontClass
        } ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
      >
        {name}
      </span>
    </div>
  );
}
