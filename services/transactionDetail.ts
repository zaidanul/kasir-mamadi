import { supabase } from "@/lib/supabaseClient";
import type { Transaction, TransactionItem } from "@/services/transactions";
import type { Product } from "@/services/products";

export async function getTransactionDetail(transactionId: string) {
  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (txError || !tx) {
    return {
      transaction: null as Transaction | null,
      items: [] as TransactionItem[],
      error: txError,
    };
  }

  const transaction = tx as Transaction;

  const { data: rows, error: itemsError } = await supabase
    .from("transaction_items")
    .select("*")
    .eq("transaction_id", transactionId);

  if (itemsError) {
    return {
      transaction,
      items: [] as TransactionItem[],
      error: itemsError,
    };
  }

  const productIds = [...new Set((rows ?? []).map((r) => r.product_id as string))];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productsError) {
    return {
      transaction,
      items: (rows ?? []) as TransactionItem[],
      error: productsError,
    };
  }

  const productById = new Map<string, Product>();
  (products ?? []).forEach((p) => {
    productById.set(p.id as string, p as Product);
  });

  const items: TransactionItem[] = (rows ?? []).map((row) => {
    const product = productById.get(row.product_id as string);
    return {
      ...row,
      product,
    } as TransactionItem;
  });

  return {
    transaction,
    items,
    error: null,
  };
}

export async function deleteTransaction(transactionId: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  return {
    success: !error,
    error,
  };
}

