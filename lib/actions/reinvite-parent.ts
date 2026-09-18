'use server';

import { createClient } from '@/utils/supabase/server';
import { sendInvitationEmail } from '@/lib/email';
import { cookies } from 'next/headers';

interface ReinviteParentInput {
  childId: string;
  parentEmail: string;
  parentName: string;
}

interface ReinviteParentResult {
  success: boolean;
  error?: string;
}

export async function reinviteParent(
  input: ReinviteParentInput
): Promise<ReinviteParentResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: invitation, error: findError } = await supabase
      .from('invitations')
      .select('code, full_name, email, expires_at, status')
      .eq('child_id', input.childId)
      .eq('email', input.parentEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !invitation) {
      return { success: false, error: 'No se encontró invitación pendiente' };
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'La invitación ha expirado' };
    }

    const childResponse = await supabase
      .from('children')
      .select('full_name')
      .eq('id', input.childId)
      .single();

    const childName = childResponse.data?.full_name || '';
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/activar-cuenta?code=${invitation.code}`;

    const emailResult = await sendInvitationEmail({
      code: invitation.code,
      parentName: input.parentName || invitation.full_name,
      parentEmail: input.parentEmail,
      childName,
      activationUrl,
    });

    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
