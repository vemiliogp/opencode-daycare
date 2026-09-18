'use server';

import { createClient } from '@/utils/supabase/server';
import { sendInvitationEmail } from '@/lib/email';
import { cookies } from 'next/headers';

interface SendInvitationInput {
  fullName: string;
  email: string;
  relationship: string;
  childId: string;
}

interface SendInvitationResult {
  success: boolean;
  code?: string;
  error?: string;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function sendInvitation(
  input: SendInvitationInput
): Promise<SendInvitationResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await supabase
      .from('invitations')
      .insert({
        child_id: input.childId,
        invited_by: user.id,
        full_name: input.fullName,
        email: input.email,
        relationship: input.relationship,
        code,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const retryCode = generateCode();
        const { error: retryError } = await supabase
          .from('invitations')
          .insert({
            child_id: input.childId,
            invited_by: user.id,
            full_name: input.fullName,
            email: input.email,
            relationship: input.relationship,
            code: retryCode,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (retryError) {
          return { success: false, error: retryError.message };
        }

        const emailResult = await sendInvitationEmail({
          code: retryCode,
          parentName: input.fullName,
          parentEmail: input.email,
          childName: '',
          activationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/activar-cuenta?code=${retryCode}`,
        });

        if (!emailResult.success) {
          return { success: false, error: emailResult.error };
        }

        return { success: true, code: retryCode };
      }

      return { success: false, error: insertError.message };
    }

    const childResponse = await supabase
      .from('children')
      .select('full_name')
      .eq('id', input.childId)
      .single();

    const childName = childResponse.data?.full_name || '';
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/activar-cuenta?code=${code}`;

    const emailResult = await sendInvitationEmail({
      code,
      parentName: input.fullName,
      parentEmail: input.email,
      childName,
      activationUrl,
    });

    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }

    return { success: true, code };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
