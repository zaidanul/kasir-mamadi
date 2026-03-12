"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddProductModal } from "./AddProductModal";

export function ProductListHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh(); // Refresh the Server Component to show new data
  };

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Daftar Produk
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-5 rounded-lg bg-[#2563eb] px-2 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> */}
          Tambah Menu
        </button>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
