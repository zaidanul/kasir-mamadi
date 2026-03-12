"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Transaction, TransactionItem } from "@/services/transactions";
import {
  deleteTransaction,
  getTransactionDetail,
} from "@/services/transactionDetail";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const { transaction, items, error } = await getTransactionDetail(
          params.id,
        );
        if (error) {
          setError(error.message ?? "Gagal memuat detail transaksi.");
        } else {
          setTransaction(transaction);
          setItems(items);
        }
      } catch {
        setError("Gagal memuat detail transaksi.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params?.id]);

  const handleDelete = async () => {
    if (!transaction || deleting) return;

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan.",
    );
    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);
    try {
      const { success, error } = await deleteTransaction(transaction.id);
      if (!success || error) {
        setError(error?.message ?? "Gagal menghapus transaksi.");
        setDeleting(false);
        return;
      }
      router.push("/salesreport");
    } catch {
      setError("Terjadi kesalahan saat menghapus transaksi.");
      setDeleting(false);
    }
  };

  const totalItems = items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 px-4 py-8 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 print:bg-white print:p-0">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 print:hidden">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Detail Transaksi
            </h1>
            {transaction && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Invoice: {transaction.invoice_code ?? "—"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
              Cetak Struk
            </button>
            <button
              type="button"
              onClick={() => router.push("/salesreport")}
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Kembali ke Laporan
            </button>
          </div>
        </header>

        {loading && (
          <p className="text-sm text-zinc-500">Memuat detail transaksi...</p>
        )}

        {error && (
          <div className="rounded-lg bg-red-900/60 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {transaction && !loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Tanggal
                </div>
                <div className="mt-2 text-sm font-medium">
                  {new Date(
                    transaction.transaction_date ?? transaction.created_at,
                  ).toLocaleString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Pembayaran
                </div>
                <div className="mt-2 text-sm font-medium capitalize">
                  {transaction.payment_method ?? "—"}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  Dibayar:{" "}
                  {transaction.paid_amount != null
                    ? `Rp ${transaction.paid_amount.toLocaleString("id-ID")}`
                    : "—"}
                </div>
                <div className="text-xs text-zinc-500">
                  Kembalian:{" "}
                  {transaction.change_amount != null
                    ? `Rp ${transaction.change_amount.toLocaleString("id-ID")}`
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Ringkasan
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Item</span>
                    <span className="font-medium">
                      {totalItems.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Total</span>
                    <span className="text-base font-semibold">
                      Rp {transaction.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Item Transaksi</h2>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  {deleting ? "Menghapus..." : "Hapus Transaksi"}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-zinc-100/80 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400">
                      <tr>
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Harga</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-sm text-zinc-500"
                          >
                            Tidak ada item pada transaksi ini.
                          </td>
                        </tr>
                      )}
                      {items.map((it) => (
                        <tr
                          key={it.id}
                          className="border-t border-zinc-100/80 text-xs text-zinc-700 hover:bg-zinc-100/60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
                        >
                          <td className="px-4 py-2.5">
                            <div className="font-medium">
                              {it.product_name || it.product?.name}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {it.qty.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            Rp {it.price.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            Rp {it.subtotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* --- RECEIPT (HIDDEN ON SCREEN, VISIBLE ON PRINT) --- */}
      {transaction && !loading && !error && (
        <div className="hidden print:block w-full max-w-[80mm] mx-auto bg-white text-black font-mono text-[11px] leading-tight pt-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold uppercase tracking-widest mb-1">RECEIPT</h1>
            <h2 className="text-sm font-bold uppercase">KEDAI MAMADE</h2>
            <div className="border-b border-dashed border-black my-2"></div>
          </div>

          {/* Info Section */}
          <div className="mb-4 grid grid-cols-2 gap-x-2">
            <div>
              <p>Date:</p>
            </div>
            <div className="text-right">
              <p>{new Date(transaction.transaction_date ?? transaction.created_at).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
            </div>
            <div>
              <p>Invoice:</p>
            </div>
            <div className="text-right">
              <p>{transaction.invoice_code}</p>
            </div>
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* Table Header */}
          <div className="flex justify-between font-bold mb-1">
            <span>Description</span>
            <span>Price</span>
          </div>

          {/* Items */}
          <div className="mb-2">
            {items.map(it => (
              <div key={it.id} className="flex justify-between items-start mb-1">
                <span className="flex-1 pr-2 truncate">
                  {it.product_name || it.product?.name}
                  {it.qty > 1 && <span className="block text-[10px] text-gray-600">x{it.qty}</span>}
                </span>
                <span>Rp {it.subtotal.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black my-2"></div>

          {/* Payment Details */}
          <div className="mb-4">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span>Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="uppercase">{transaction.payment_method ?? 'Cash'}</span>
              <span>Rp {(transaction.paid_amount ?? 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Kembalian</span>
              <span>Rp {(transaction.change_amount ?? 0).toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="font-bold mb-2">THANK YOU</p>
            <div className="border-b border-dashed border-black my-2"></div>

            {/* Fake Barcode */}
            <div className="mt-4 opacity-80 flex flex-col items-center">
              <div className="w-full h-8 flex justify-center bg-transparent gap-[1px]">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className={`bg-black h-full`} style={{ width: `${Math.floor(Math.random() * 3) + 1}px` }}></div>
                ))}
              </div>
              <p className="mt-1 text-[10px] tracking-widest">{transaction.invoice_code?.replace(/\D/g, '') || '1234567890123'}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

