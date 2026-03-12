"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { updateProduct, type Product } from "@/services/products";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setPrice(product.price.toString());
      setPreviewUrl(product.image_url);
      setImageFile(null);
      setError("");
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setError("Name and price are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        setError("Invalid price");
        setLoading(false);
        return;
      }

      const { error: submitError } = await updateProduct(
        product.id,
        name,
        numericPrice,
        imageFile || undefined,
        product.image_url
      );
      
      if (submitError) {
        setError(submitError.message || "Failed to update product");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0f172a] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Edit product</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type product name"
                className="w-full rounded-lg border border-zinc-700 bg-[#1e293b] px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-200">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">Rp</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    min="0"
                    className="w-full rounded-lg border border-zinc-700 bg-[#1e293b] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-200">Category</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-lg border border-zinc-700 bg-[#1e293b] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-not-allowed opacity-70"
                    disabled
                  >
                    <option>Select category</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">Product Image</label>
              <div 
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed ${previewUrl ? (imageFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-600 bg-[#283548]') : 'border-zinc-700 bg-[#1e293b] hover:border-zinc-500 hover:bg-[#283548]'} p-6 transition-all`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  disabled={loading}
                />
                
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg shadow-md bg-zinc-800">
                      <Image 
                        src={previewUrl} 
                        alt="Preview" 
                        fill
                        className="object-cover" 
                        unoptimized
                      />
                    </div>
                    <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-full">
                      {imageFile ? imageFile.name : 'Current Image (Click to change)'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <div className="rounded-full bg-zinc-800 p-3 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Click to upload or drag and drop</span>
                    <span className="text-xs">SVG, PNG, JPG or GIF (MAX. 800x400px)</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              )}
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-zinc-700 bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
