'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface UserContext {
  id: string;
  daycareId: string | null;
}

export interface UserContextResult {
  success: boolean;
  user?: UserContext;
  error?: string;
}

export async function getUserContext(): Promise<UserContextResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'No autenticado',
      };
    }

    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('daycare_id')
      .eq('id', user.id)
      .single();

    if (dbError) {
      return {
        success: false,
        error: 'Error al obtener contexto del usuario',
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        daycareId: dbUser.daycare_id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
