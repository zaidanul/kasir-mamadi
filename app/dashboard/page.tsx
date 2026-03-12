import { getProducts } from "@/services/products";
import { ProductListHeader } from "@/components/ProductListHeader";
import { ProductListItem } from "@/components/ProductListItem";

export default async function Dashboard() {
  const { products, error } = await getProducts();

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 px-3 py-4 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
          <ProductListHeader />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-900/60 p-4 text-sm text-red-100">
            <div className="font-semibold">Error:</div>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {/* Empty state */}
        {!error && products.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 dark:border-zinc-700 dark:bg-zinc-900">
            <svg
              className="h-12 w-12 text-zinc-300 dark:text-zinc-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-sm text-zinc-500">Belum ada produk. Tambahkan menu sekarang!</p>
          </div>
        )}

        {/* Product card grid */}
        {!error && products.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {products.map((item) => (
              <ProductListItem key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
