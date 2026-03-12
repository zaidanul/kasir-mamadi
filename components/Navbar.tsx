"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/dashboard", label: "Produk" },
  { href: "/transaction", label: "Transaksi" },
  { href: "/salesreport", label: "Laporan" },
];

export function NavbarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Tutup menu saat berpindah halaman
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Top Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              kasir
            </span>
            <span className="text-base font-semibold tracking-tight">
              Mamade
            </span>
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <span
              className={`block h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-4 rounded-full bg-current transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {menuOpen && (
          <nav className="mx-auto mt-3 flex w-full max-w-7xl flex-col gap-1 pb-2 text-sm">
            {routes.map((route) => {
              const active = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Container padding top to avoid overlap with fixed nav */}
      <main className="flex-1 pt-20 px-4 pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

