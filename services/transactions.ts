import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/services/products";

export type Transaction = {
  id: string;
  invoice_code: string | null;
  transaction_date: string;
  total_amount: number;
  payment_method: string | null;
  paid_amount: number | null;
  change_amount: number | null;
  created_at: string;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
  subtotal: number;
  product?: Product;
};

export type PaymentMethod = "cash" | "qris";

export type NewTransactionItemInput = {
  productId: string;
  quantity: number;
};

export async function createTransaction(
  items: NewTransactionItemInput[],
  options: { paymentMethod: PaymentMethod; paidAmount: number },
) {
  if (!items.length) {
    throw new Error("Tidak ada item di transaksi.");
  }

  const productIds = [...new Set(items.map((i) => i.productId))];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productsError) {
    return { transaction: null, items: [] as TransactionItem[], error: productsError };
  }

  const productById = new Map<string, Product>();
  (products ?? []).forEach((p) => {
    productById.set(p.id, p as Product);
  });

  const lineItems = items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error(`Produk dengan id ${item.productId} tidak ditemukan.`);
    }
    const price = product.price;
    const subtotal = price * item.quantity;
    return {
      product_id: item.productId,
      product_name: product.name,
      qty: item.quantity,
      price,
      subtotal,
    };
  });

  const totalAmount = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
  const paidAmount = options.paidAmount;
  const changeAmount = paidAmount - totalAmount;

  const { data: txData, error: txError } = await supabase
    .from("transactions")
    .insert({
      total_amount: totalAmount,
      payment_method: options.paymentMethod,
      paid_amount: paidAmount,
      change_amount: changeAmount,
    })
    .select("*")
    .single();

  if (txError || !txData) {
    return { transaction: null, items: [] as TransactionItem[], error: txError };
  }

  const transaction = txData as Transaction;

  const { data: insertedItems, error: itemsError } = await supabase
    .from("transaction_items")
    .insert(
      lineItems.map((li) => ({
        ...li,
        transaction_id: transaction.id,
      })),
    )
    .select("*");

  if (itemsError) {
    return { transaction, items: [] as TransactionItem[], error: itemsError };
  }

  const itemsWithProduct: TransactionItem[] = (insertedItems ?? []).map((row) => {
    const product = productById.get(row.product_id);
    return {
      ...row,
      product,
    } as TransactionItem;
  });

  return {
    transaction,
    items: itemsWithProduct,
    error: null,
  };
}

export async function getTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  return {
    transactions: (data ?? []) as Transaction[],
    error,
  };
}

export type SalesReportRange = "all" | "day" | "week" | "month";

type SalesReportOptions = {
  month?: number | null;
};

export async function getSalesReport(
  range: SalesReportRange = "all",
  options: SalesReportOptions = {},
) {
  const { transactions, error } = await getTransactions();

  const now = new Date();
  const targetMonth =
    typeof options.month === "number" && options.month >= 0 && options.month <= 11
      ? options.month
      : now.getMonth();

  const filteredTransactions =
    range === "all"
      ? transactions
      : transactions.filter((t) => {
          const txDate = new Date(t.transaction_date ?? t.created_at);
          if (Number.isNaN(txDate.getTime())) return false;

          if (range === "day") {
            return (
              txDate.getFullYear() === now.getFullYear() &&
              txDate.getMonth() === now.getMonth() &&
              txDate.getDate() === now.getDate()
            );
          }

          if (range === "week") {
            const startOfWeek = new Date(now);
            const day = (now.getDay() + 6) % 7; // Monday as start
            startOfWeek.setDate(now.getDate() - day);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            return txDate >= startOfWeek && txDate < endOfWeek;
          }

          if (range === "month") {
            return (
              txDate.getFullYear() === now.getFullYear() &&
              txDate.getMonth() === targetMonth
            );
          }

          return true;
        });

  const totalRevenue = filteredTransactions.reduce(
    (sum, t) => sum + t.total_amount,
    0,
  );

  const totalTransactions = filteredTransactions.length;

  const byPaymentMethod = filteredTransactions.reduce<Record<string, number>>(
    (acc, t) => {
      const key = t.payment_method ?? "unknown";
      acc[key] = (acc[key] ?? 0) + t.total_amount;
      return acc;
    },
    {},
  );

  return {
    transactions: filteredTransactions,
    totalRevenue,
    totalTransactions,
    byPaymentMethod,
    error,
  };
}

export type TopProduct = {
  product_name: string;
  total_qty: number;
  total_revenue: number;
};

// Fetch all-time top products sorted by qty sold (desc)
export async function getTopProducts(): Promise<{
  products: TopProduct[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("transaction_items")
    .select("product_name, qty, subtotal");

  if (error) {
    return { products: [], error };
  }

  const map = new Map<string, TopProduct>();
  for (const row of data ?? []) {
    const name = row.product_name ?? "(Tidak diketahui)";
    const existing = map.get(name);
    if (existing) {
      existing.total_qty += row.qty ?? 0;
      existing.total_revenue += row.subtotal ?? 0;
    } else {
      map.set(name, {
        product_name: name,
        total_qty: row.qty ?? 0,
        total_revenue: row.subtotal ?? 0,
      });
    }
  }

  const products = Array.from(map.values()).sort(
    (a, b) => b.total_qty - a.total_qty,
  );

  return { products, error: null };
}

// Fetch today's best-selling product
export async function getTodayTopProduct(): Promise<{
  product: TopProduct | null;
  error: Error | null;
}> {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();

  // Get today's transaction IDs first
  const { data: txData, error: txError } = await supabase
    .from("transactions")
    .select("id")
    .gte("transaction_date", startOfDay);

  if (txError) return { product: null, error: txError };

  const txIds = (txData ?? []).map((t) => t.id);
  if (txIds.length === 0) return { product: null, error: null };

  const { data, error } = await supabase
    .from("transaction_items")
    .select("product_name, qty, subtotal")
    .in("transaction_id", txIds);

  if (error) return { product: null, error };

  const map = new Map<string, TopProduct>();
  for (const row of data ?? []) {
    const name = row.product_name ?? "(Tidak diketahui)";
    const existing = map.get(name);
    if (existing) {
      existing.total_qty += row.qty ?? 0;
      existing.total_revenue += row.subtotal ?? 0;
    } else {
      map.set(name, {
        product_name: name,
        total_qty: row.qty ?? 0,
        total_revenue: row.subtotal ?? 0,
      });
    }
  }

  if (map.size === 0) return { product: null, error: null };

  const top = Array.from(map.values()).sort(
    (a, b) => b.total_qty - a.total_qty,
  )[0];

  return { product: top, error: null };
}

