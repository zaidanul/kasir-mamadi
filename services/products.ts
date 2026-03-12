import { supabase } from "@/lib/supabaseClient";

export type Product = {
  id: string;
  uuid: string;
  name: string;
  price: number;
  created_at: string;
  image_url: string | null;
};

export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return {
    products: (data ?? []) as Product[],
    error,
  };
}

export async function createProduct(
  name: string,
  price: number,
  imageFile?: File,
) {
  let image_url = null;

  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    // Generate a clean filename/path
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { product: null, error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    image_url = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("products")
    .insert([{ name, price, image_url }])
    .select()
    .single();

  return {
    product: data as Product | null,
    error,
  };
}

export async function updateProduct(
  id: string,
  name: string,
  price: number,
  newImageFile?: File,
  oldImageUrl?: string | null,
) {
  let image_url = oldImageUrl;

  if (newImageFile) {
    const fileExt = newImageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, newImageFile);

    if (uploadError) {
      return { product: null, error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    image_url = publicUrlData.publicUrl;

    // Optional: Delete old image if it exists
    if (oldImageUrl) {
      try {
        const oldFilePath = oldImageUrl.split("/product-images/")[1];
        if (oldFilePath) {
          await supabase.storage.from("product-images").remove([oldFilePath]);
        }
      } catch (e) {
        console.error("Failed to delete old image", e);
      }
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update({ name, price, image_url })
    .eq("id", id)
    .select()
    .single();

  return {
    product: data as Product | null,
    error,
  };
}

export async function deleteProduct(id: string, imageUrl?: string | null) {
  // Try to delete the image from storage first
  if (imageUrl) {
    try {
      const filePath = imageUrl.split("/product-images/")[1];
      if (filePath) {
        await supabase.storage.from("product-images").remove([filePath]);
      }
    } catch (e) {
      console.error("Failed to delete image", e);
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  
  return { success: !error, error };
}
