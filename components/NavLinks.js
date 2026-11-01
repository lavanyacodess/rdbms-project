"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/clubs", label: "Clubs" },
  { href: "/events", label: "Events" },
  { href: "/announcements", label: "Announcements" },
];

export default function NavLinks({ mobile = false }) {
  const pathname = usePathname();

  return (
    <div className={mobile ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${active ? "nav-link-active" : ""} ${
              mobile ? "w-full" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
