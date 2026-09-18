'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface ActivateAccountInput {
  code: string;
  email: string;
  fullName: string;
  password: string;
  childFullName: string;
  childRoomName: string;
  relationship: string;
}

interface ActivateAccountResult {
  success: boolean;
  error?: string;
}

export async function activateAccount(
  input: ActivateAccountInput
): Promise<ActivateAccountResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: invitation, error: findError } = await supabase
      .from('invitations')
      .select('code, email, full_name, relationship, child_id, status')
      .eq('code', input.code)
      .eq('status', 'pending')
      .single();

    if (findError || !invitation) {
      return { success: false, error: 'Código de invitación inválido o expirado' };
    }

    if (invitation.email.toLowerCase() !== input.email.toLowerCase()) {
      return { success: false, error: 'El email no coincide con la invitación' };
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: 'parent',
          status: 'active',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`,
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        return { success: false, error: 'Este email ya tiene una cuenta registrada' };
      }
      return { success: false, error: signUpError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Error al crear la cuenta' };
    }

    await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    const { error: insertError } = await supabase
      .from('parent_children')
      .insert({
        parent_id: authData.user.id,
        child_id: invitation.child_id,
        relationship: invitation.relationship,
      });

    if (insertError) {
      if (insertError.code !== '23505') {
        return { success: false, error: 'Error al crear el vínculo con el niño' };
      }
    }

    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('code', input.code);

    if (updateError) {
      console.warn('Failed to update invitation status:', updateError.message);
    }

    redirect('/');
  } catch (error) {
    if (error instanceof Error && 'digest' in error && (error as { digest: string }).digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
