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
      `Are you sure you want to delete "${product.name}"?\nThis action cannot be undone.`
    );
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const { success, error } = await deleteProduct(product.id, product.image_url);
      if (!success) {
        alert(error?.message || "Failed to delete product");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover bg-zinc-200"
              suppressHydrationWarning
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-200 text-xs text-zinc-500">
              No Img
            </div>
          )}
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-zinc-400">{product.uuid}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-right">
            <div className="font-semibold">
              Rp {product.price?.toLocaleString("id-ID")}
            </div>
            <div className="text-[10px] text-zinc-500 text-right w-full block">
              {new Date(product.created_at).toLocaleDateString("id-ID")}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-1 sm:mt-0">
            <button
              title="Edit"
              onClick={() => setIsEditModalOpen(true)}
              disabled={isDeleting}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button
              title="Delete"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
