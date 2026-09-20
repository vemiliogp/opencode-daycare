'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { uploadImage } from '@/lib/upload-image';
import type { PostKind } from '@/app/data/feed';

export interface CreatePostInput {
  daycareId: string;
  authorId: string;
  kind: PostKind;
  body: string;
  imageFile?: File;
  audienceType: 'child' | 'room';
  audienceChildIds?: string[];
}

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  imageUrl?: string;
  error?: string;
}

export async function createPost(
  input: CreatePostInput,
): Promise<CreatePostResult> {
  try {
    if (!input.body.trim()) {
      return { success: false, error: 'La descripción es requerida' };
    }

    let imageUrl: string | undefined;

    if (input.imageFile) {
      const uploadResult = await uploadImage(input.imageFile, input.daycareId);
      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || 'Error al subir la imagen',
        };
      }
      imageUrl = uploadResult.publicUrl;
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        daycare_id: input.daycareId,
        author_id: input.authorId,
        kind: input.kind,
        body: input.body.trim(),
        image_url: imageUrl || null,
        audience_type: input.audienceType,
        audience_child_ids: input.audienceType === 'child' ? input.audienceChildIds : null,
      })
      .select('id')
      .single();

    if (error) {
      return {
        success: false,
        error: `Error al crear la publicación: ${error.message}`,
      };
    }

    return {
      success: true,
      postId: data.id,
      imageUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
