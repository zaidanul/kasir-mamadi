"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/services/products";
import { getProducts } from "@/services/products";
import Image from "next/image";
import {
  createTransaction,
  type NewTransactionItemInput,
  type PaymentMethod,
} from "@/services/transactions";

type CartItem = {
  product: Product;
  quantity: number;
};

export default function TransactionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const { products, error } = await getProducts();
        if (error) {
          setError(error.message ?? "Gagal memuat produk.");
        } else {
          setProducts(products);
        }
      } catch {
        setError("Gagal memuat produk.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const change = paidAmount - total;

  const handleSubmit = async () => {
    if (!cart.length) {
      setError("Keranjang masih kosong.");
      return;
    }

    if (!paymentMethod) {
      setError("Pilih metode pembayaran.");
      return;
    }

    if (!paidAmount || paidAmount <= 0) {
      setError("Masukkan nominal bayar.");
      return;
    }

    if (paidAmount < total) {
      setError("Nominal bayar kurang dari total.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const items: NewTransactionItemInput[] = cart.map((c) => ({
      productId: c.product.id,
      quantity: c.quantity,
    }));

    try {
      const { transaction, error } = await createTransaction(items, {
        paymentMethod,
        paidAmount,
      });
      if (error || !transaction) {
        setError(error?.message ?? "Gagal menyimpan transaksi.");
        return;
      }

      setSuccessMessage(
        `Transaksi berhasil disimpan. Total: Rp ${total.toLocaleString(
          "id-ID",
        )}`,
      );
      setCart([]);
      setPaidAmount(0);
      setPaymentMethod("cash");
    } catch {
      setError("Terjadi kesalahan saat menyimpan transaksi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 px-3 py-4 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 md:px-4 md:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Kasir - Transaksi
          </h1>
        </header>

        {error && (
          <div className="rounded-lg bg-red-900/60 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-emerald-900/60 p-4 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-4">
            <h2 className="mb-3 text-lg font-semibold">Daftar Menu</h2>
            {loading ? (
              <p className="text-sm text-zinc-500">Memuat Menu...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-zinc-500">Tidak ada Menu..</p>
            ) : (
              <div className="flex max-h-[460px] flex-col gap-3 overflow-y-auto md:max-h-[460px]">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {product.image_url ? (
                        <Image 
                          src={product.image_url} 
                          alt={product.name} 
                          width={48}
                          height={48}
                          className="h-14 w-14 rounded-lg object-cover bg-zinc-200"
                          suppressHydrationWarning
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-200 text-xs text-zinc-500">
                          Img
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-zinc-500 md:text-sm">
                          Rp {product.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 md:px-5 md:py-3">
                      Tambah
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-4">
            <h2 className="mb-3 text-lg font-semibold">Keranjang Pesanan</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Belum ada item. Klik produk di sebelah kiri untuk menambah ke
                keranjang.
              </p>
            ) : (
              <div className="flex-1 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {item.product.image_url ? (
                        <Image 
                          src={item.product.image_url} 
                          alt={item.product.name} 
                          width={32}
                          height={32}
                          className="h-10 w-10 rounded-md object-cover bg-zinc-200"
                          suppressHydrationWarning
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-200 text-[10px] text-zinc-500">
                          Img
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-xs text-zinc-500">
                          Rp {item.product.price.toLocaleString("id-ID")} x{" "}
                          {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-sm dark:border-zinc-600"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        className="h-7 w-14 rounded-md border border-zinc-300 bg-transparent px-2 text-center text-sm dark:border-zinc-600"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            Number(e.target.value),
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-sm dark:border-zinc-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700">
              <div className="mb-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Metode Pembayaran</span>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`rounded-full px-5 py-3 ${paymentMethod === "cash"
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                        }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("qris");
                        setPaidAmount(total);
                      }}
                      className={`rounded-full px-5 py-3 ${paymentMethod === "qris"
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                        }`}
                    >
                      QRIS
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Bayar</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="h-8 w-40 rounded-md border border-zinc-300 bg-transparent px-2 text-right text-sm dark:border-zinc-600"
                    value={paidAmount || ""}
                    onChange={(e) =>
                      setPaidAmount(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Kembalian</span>
                  <span className="text-sm font-medium">
                    Rp {Math.max(change, 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {submitting ? "Menyimpan..." : "Bayar"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

