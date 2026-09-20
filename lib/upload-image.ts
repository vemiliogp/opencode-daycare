import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Sube un File al bucket 'post-images' con path: posts/{daycareId}/{timestamp}-{random}.{ext}
 * Retorna la URL pública de la imagen subida.
 */
export async function uploadImage(
  file: File,
  daycareId: string,
): Promise<UploadImageResult> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "La imagen no debe superar los 5MB",
    };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `posts/${daycareId}/${timestamp}-${random}.${ext}`;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      error: `Error al subir la imagen: ${error.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  return {
    success: true,
    publicUrl,
  };
}
