import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ActivateForm from '@/components/activate-form';
import ActivateCodeEntry from '@/components/activate-code-entry';

interface InvitationData {
  code: string;
  email: string;
  fullName: string;
  relationship: string;
  childFullName: string;
  childRoomName: string;
}

export default async function ActivateAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return <ActivateCodeEntry />;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      code,
      email,
      full_name,
      relationship,
      children:child_id (
        full_name,
        rooms:room_id (name)
      )
    `)
    .eq('code', code)
    .eq('status', 'pending')
    .single();

  if (error || !invitation) {
    return <ActivateCodeEntry invalidCode />;
  }

  const childData = invitation.children as unknown as { full_name: string; rooms: { name: string }[] } | null;
  const firstRoom = childData?.rooms?.[0];

  const invitationData: InvitationData = {
    code: invitation.code,
    email: invitation.email,
    fullName: invitation.full_name,
    relationship: invitation.relationship,
    childFullName: childData?.full_name || '',
    childRoomName: firstRoom?.name || '',
  };

  return <ActivateForm invitation={invitationData} />;
}
