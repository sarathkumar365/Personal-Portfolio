"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blogs", href: "/blogs" },
];

const baseLinkClasses =
  "inline-flex min-w-[96px] items-center justify-center border border-black/40 px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] transition-colors duration-200 sm:text-xs";

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <header className="flex justify-center pb-10">
      <nav aria-label="Primary" className="rounded-sm bg-white/60 shadow-soft backdrop-blur-sm">
        <ul className="flex items-center justify-center divide-x divide-black/20">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  className={`${baseLinkClasses} ${
                    isActive
                      ? "bg-black text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.35)]"
                      : "bg-transparent text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
