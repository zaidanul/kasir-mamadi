"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddProductModal } from "./AddProductModal";
import { Toast, type ToastType } from "./Toast";

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export function ProductListHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, id: Date.now() });
  };

  const handleSuccess = (message: string) => {
    router.refresh();
    showToast(message, "success");
  };

  const handleError = (message: string) => {
    showToast(message, "error");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Daftar Produk
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Tambah Menu
        </button>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
