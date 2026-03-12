"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/services/products";
import { deleteProduct } from "@/services/products";
import { EditProductModal } from "./EditProductModal";

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Hapus "${product.name}"?\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const { success, error } = await deleteProduct(product.id, product.image_url);
      if (!success) {
        alert(error?.message || "Gagal menghapus produk");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Terjadi kesalahan");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${
          isDeleting ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Image / placeholder */}
        <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              suppressHydrationWarning
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {/* Placeholder icon */}
              <svg
                className="h-14 w-14 text-zinc-300 dark:text-zinc-700"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Product name */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
              {product.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              Ditambahkan {new Date(product.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Price badge */}
          <div className="inline-flex w-fit items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40">
            Rp {product.price?.toLocaleString("id-ID")}
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-100 dark:border-zinc-800" />

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              title="Edit"
              onClick={() => setIsEditModalOpen(true)}
              disabled={isDeleting}
              className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <span>Edit</span>
            </button>

            <button
              title="Hapus"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center gap-1 rounded-lg border border-red-100 px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        product={product}
      />
    </>
  );
}
