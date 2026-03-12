"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SalesReportRange } from "@/services/transactions";

type Props = {
  currentRange: SalesReportRange;
  currentMonthIndex: number | null;
};

export function SalesReportMonthSelect({ currentRange, currentMonthIndex }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedValue =
    currentRange === "month" && currentMonthIndex !== null
      ? String(currentMonthIndex + 1)
      : "";

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams?.toString());

    if (!value) {
      params.delete("range");
      params.delete("month");
    } else {
      params.set("range", "month");
      params.set("month", value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <select
      className="h-9 w-full max-w-xs rounded-full border border-zinc-300 bg-zinc-100 px-3 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      value={selectedValue}
      onChange={handleChange}
    >
      <option value="">Pilih bulan</option>
      {[
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ].map((label, index) => {
        const monthNumber = index + 1;
        return (
          <option key={label} value={monthNumber}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

