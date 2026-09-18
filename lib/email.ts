

interface SendInvitationEmailInput {
  code: string;
  parentName: string;
  parentEmail: string;
  childName: string;
  activationUrl: string;
}

interface SendInvitationEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput
): Promise<SendInvitationEmailResult> {
  const html = buildInvitationEmailHtml(input);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OpenDayCare <onboarding@resend.dev>',
        to: [input.parentEmail],
        subject: '¡Estás invitado a OpenDayCare!',
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || response.statusText,
      };
    }

    const data = await response.json() as { id: string };
    return { success: true, emailId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

function buildInvitationEmailHtml(input: SendInvitationEmailInput): string {
  const { code, parentName, childName, activationUrl } = input;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a OpenDayCare</title>
</head>
<body style="margin:0;padding:0;background-color:#F6ECDF;font-family:'Nunito',Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;margin-top:24px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr>
      <td style="padding:32px 24px;text-align:center;background-color:#F4977E;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-family:'Fredoka',sans-serif;font-size:28px;color:#ffffff;">¡Bienvenido a OpenDayCare!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="font-size:16px;color:#333333;margin:0 0 16px;">Hola <strong>${parentName}</strong>,</p>
        <p style="font-size:16px;color:#333333;margin:0 0 24px;">
          Has sido invitado a unirte a <strong>OpenDayCare</strong> para seguir las actividades de <strong>${childName}</strong>.
        </p>
        <p style="font-size:16px;color:#333333;margin:0 0 8px;">Tu código de invitación es:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
          <tr>
            <td style="background-color:#F6ECDF;border:2px dashed #F4977E;border-radius:8px;padding:16px 32px;text-align:center;">
              <span style="font-family:'Fredoka',sans-serif;font-size:32px;color:#F4977E;letter-spacing:4px;">${code}</span>
            </td>
          </tr>
        </table>
        <p style="font-size:14px;color:#666666;margin:0 0 24px;text-align:center;">
          Haz clic en el botón de abajo o copia el código y úsalo al crear tu cuenta.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background-color:#F4977E;border-radius:8px;text-align:center;">
              <a href="${activationUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:8px;">Activar mi cuenta</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px;font-size:12px;color:#999999;text-align:center;">
        <p style="margin:0;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
        <p style="margin:8px 0 0;">© 2026 OpenDayCare</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
