import { getProducts } from "@/services/products";
import { ProductListHeader } from "@/components/ProductListHeader";
import { ProductListItem } from "@/components/ProductListItem";

export default async function Dashboard() {
  const { products, error } = await getProducts();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
        <ProductListHeader />

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/60 p-4 text-sm text-red-100">
            <div className="font-semibold">Error:</div>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {!error && products.length === 0 && (
          <p className="text-sm text-zinc-500">Tidak ada data.</p>
        )}

        {!error && products.length > 0 && (
          <div className="mt-4 space-y-2">
            {products.map((item) => (
              <ProductListItem key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
