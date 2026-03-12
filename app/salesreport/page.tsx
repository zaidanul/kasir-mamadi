import Link from "next/link";
import {
  getSalesReport,
  getTopProducts,
  getTodayTopProduct,
  type SalesReportRange,
} from "@/services/transactions";
import { SalesReportMonthSelect } from "@/components/SalesReportMonthSelect";

type SalesSearchParams = { [key: string]: string | string[] | undefined };

function createSearchParams(base: SalesSearchParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === "string") {
      sp.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "string") {
          sp.append(key, v);
        }
      });
    }
  }
  return sp;
}

function parsePage(raw: string | string[] | undefined): number {
  const str = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const n = str ? Number.parseInt(str, 10) : NaN;
  return !Number.isNaN(n) && n > 0 ? n : 1;
}

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<SalesSearchParams>;
}) {
  const params = await searchParams;

  const rawRange = params.range;
  const rangeValue =
    typeof rawRange === "string" ? rawRange : Array.isArray(rawRange) ? rawRange[0] : undefined;
  const range: SalesReportRange = rangeValue === "month" ? "month" : "all";

  const rawMonth = params.month;
  const monthParam =
    typeof rawMonth === "string" ? rawMonth : Array.isArray(rawMonth) ? rawMonth[0] : undefined;
  const parsedMonth = monthParam ? Number.parseInt(monthParam, 10) : NaN;
  const monthIndex =
    Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12
      ? null
      : parsedMonth - 1;

  const { transactions, totalRevenue, totalTransactions, byPaymentMethod, error } =
    await getSalesReport(range, { month: monthIndex });

  const { products: topProducts } = await getTopProducts();
  const { product: todayTop } = await getTodayTopProduct();

  // --- Transaction pagination ---
  const txPageSize = 10;
  const currentTxPage = parsePage(params.page);
  const totalTxPages = Math.max(1, Math.ceil(transactions.length / txPageSize));
  const safeTxPage = Math.min(currentTxPage, totalTxPages);
  const txStartIndex = (safeTxPage - 1) * txPageSize;
  const pagedTransactions = transactions.slice(txStartIndex, txStartIndex + txPageSize);

  // --- Top products pagination ---
  const productPageSize = 5;
  const currentProductPage = parsePage(params.productPage);
  const totalProductPages = Math.max(1, Math.ceil(topProducts.length / productPageSize));
  const safeProductPage = Math.min(currentProductPage, totalProductPages);
  const productStartIndex = (safeProductPage - 1) * productPageSize;
  const pagedProducts = topProducts.slice(productStartIndex, productStartIndex + productPageSize);

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-50 px-3 py-4 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 md:px-4 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              LAPORAN PENJUALAN
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              RINGKASAN TRANSAKSI
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-lg bg-red-900/60 p-4 text-sm text-red-100">
            Gagal memuat laporan: {error.message}
          </div>
        )}

        {/* ── Summary Cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Total Pendapatan */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs uppercase tracking-wide font-semibold">
              TOTAL PENDAPATAN
            </div>
            <div className="mt-2 text-2xl font-semibold">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Jumlah Transaksi */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs uppercase tracking-wide font-semibold">
              JUMLAH TRANSAKSI
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {totalTransactions.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Per Metode Pembayaran */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs uppercase tracking-wide font-semibold">
              PER METODE PEMBAYARAN
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {Object.keys(byPaymentMethod).length === 0 && (
                <p className="text-zinc-500">Belum ada data.</p>
              )}
              {Object.entries(byPaymentMethod).map(([method, amount]) => (
                <div
                  key={method}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="capitalize text-base">
                    {method === "cash" || method === "qris" ? method : "Lainnya"}
                  </span>
                  <span className="text-base">Rp {amount.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Produk Terlaris Hari Ini */}
          <div className="rounded-xl border border-blue-200 bg-blue-100 p-4 shadow-sm dark:border-blue-700/50 dark:bg-blue-900/20">
            <div className="text-xs uppercase tracking-wide text-zinc-600 dark:text-amber-400">
              🏆 Produk Terlaris Hari Ini
            </div>
            {todayTop ? (
              <>
                <div className="mt-2 text-lg font-semibold text-zinc-800 dark:text-amber-200 leading-tight">
                  {todayTop.product_name}
                </div>
                <div className="mt-1 text-sm text-zinc-700 dark:text-amber-300">
                  Terjual: <span className="font-medium">{todayTop.total_qty.toLocaleString("id-ID")} pcs</span>
                </div>
                <div className="text-sm text-zinc-700 dark:text-amber-300">
                  Total: <span className="font-medium">Rp {todayTop.total_revenue.toLocaleString("id-ID")}</span>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-600 dark:text-amber-400">
                Belum ada penjualan hari ini.
              </p>
            )}
          </div>
        </section>

        {/* ── Detail Transaksi ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold md:text-lg">
                🛒 DATA TRANSAKSI
              </h2>
              <span className="text-xs text-zinc-500">
                Menampilkan{" "}
                {pagedTransactions.length.toLocaleString("id-ID")} dari{" "}
                {transactions.length.toLocaleString("id-ID")} transaksi
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs md:text-sm">
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                Filter bulan (tahun ini):
              </span>
              <SalesReportMonthSelect
                currentRange={range}
                currentMonthIndex={monthIndex}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
              <table className="min-w-[720px] border-collapse text-left text-sm md:min-w-full md:text-base">
                <thead className="bg-zinc-100/80 text-[13px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400 md:text-sm">
                  <tr>
                    <th className="px-7 py-4 text-center">No.</th>
                    <th className="px-7 py-4 text-center">Tanggal</th>
                    <th className="px-7 py-4 text-center">Metode</th>
                    <th className="px-7 py-4 text-center">Total</th>
                    <th className="px-7 py-4 text-center">Dibayar</th>
                    <th className="px-7 py-4 text-center">Kembalian</th>
                    <th className="px-7 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-sm text-zinc-500"
                      >
                        {range === "month"
                          ? "Belum ada transaksi di bulan ini."
                          : "Belum ada transaksi."}
                      </td>
                    </tr>
                  )}
                  {pagedTransactions.map((tx, index) => {
                    const date = new Date(tx.transaction_date ?? tx.created_at);
                    const formattedDate = date.toLocaleString("id-ID", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={tx.id}
                        className="border-t border-zinc-100/80 text-sm text-zinc-700 hover:bg-zinc-100/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900/60 md:text-base"
                      >
                        <td className="px-5 py-3.5 text-center font-medium">
                          {txStartIndex + index + 1}
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-3.5 text-center capitalize">
                          {tx.payment_method ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          Rp {tx.total_amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.paid_amount != null
                            ? `Rp ${tx.paid_amount.toLocaleString("id-ID")}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {tx.change_amount != null
                            ? `Rp ${tx.change_amount.toLocaleString("id-ID")}`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Link
                            href={`/salesReportDetail/${tx.id}`}
                            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 md:px-5 md:py-3"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalTxPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs md:text-sm">
              {Array.from({ length: totalTxPages }, (_, index) => {
                const page = index + 1;
                const paramsForPage = createSearchParams(params);
                if (page === 1) {
                  paramsForPage.delete("page");
                } else {
                  paramsForPage.set("page", String(page));
                }
                const query = paramsForPage.toString();
                const href = query ? `/salesreport?${query}` : "/salesreport";
                const isActive = page === safeTxPage;

                return (
                  <Link
                    key={page}
                    href={href}
                    className={`min-w-9 rounded-full px-3 py-1 text-center ${
                      isActive
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Top Produk Terjual ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <div className="mb-3 flex flex-col gap-1 md:mb-4">
            <h2 className="text-base font-semibold md:text-lg">
              🛒 PRODUK / MENU TERLARIS
            </h2>
            <span className="text-xs text-zinc-500">
              Diurutkan dari yang paling banyak terjual
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="overflow-x-auto">
              <table className="min-w-[400px] border-collapse text-left text-sm md:min-w-full md:text-base">
                <thead className="bg-zinc-100/80 text-[13px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400 md:text-sm">
                  <tr>
                    <th className="px-5 py-3 text-center">No.</th>
                    <th className="px-5 py-3">Nama Produk / Menu</th>
                    <th className="px-5 py-3 text-center">Jumlah Terjual</th>
                    <th className="px-5 py-3 text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-sm text-zinc-500"
                      >
                        Belum ada data penjualan produk.
                      </td>
                    </tr>
                  )}
                  {pagedProducts.map((p, index) => (
                    <tr
                      key={p.product_name}
                      className="border-t border-zinc-100/80 text-sm text-zinc-700 hover:bg-zinc-100/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900/60 md:text-base"
                    >
                      <td className="px-5 py-3 text-center font-medium text-zinc-400">
                        {productStartIndex + index + 1}
                      </td>
                      <td className="px-5 py-3 font-medium">{p.product_name}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {p.total_qty.toLocaleString("id-ID")} pcs
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        Rp {p.total_revenue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Pagination */}
          {totalProductPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs md:text-sm">
              {Array.from({ length: totalProductPages }, (_, index) => {
                const page = index + 1;
                const paramsForPage = createSearchParams(params);
                if (page === 1) {
                  paramsForPage.delete("productPage");
                } else {
                  paramsForPage.set("productPage", String(page));
                }
                const query = paramsForPage.toString();
                const href = query ? `/salesreport?${query}` : "/salesreport";
                const isActive = page === safeProductPage;

                return (
                  <Link
                    key={page}
                    href={href}
                    className={`min-w-9 rounded-full px-3 py-1 text-center ${
                      isActive
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
