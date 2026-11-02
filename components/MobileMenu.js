"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenu({ children }) {
  const menuRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.open = false;
    }
  }, [pathname]);

  return (
    <details ref={menuRef} className="group relative md:hidden">
      {children}
    </details>
  );
}
