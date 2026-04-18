export function brandedEmail(title: string, body: string, footer?: string): string {
  const logoBase = process.env.PUBLIC_WEB_URL || "https://avana.replit.app";
  const logoUrl = `${logoBase.replace(/\/$/, "")}/avana-logo.png`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a2035; padding: 20px; border-radius: 8px 8px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" valign="middle" style="color: #4CAF50;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 20px;">${title}</h1>
            </td>
            <td align="right" valign="middle" style="width: 140px;">
              <img src="${logoUrl}" alt="AVANA Recruit" height="32" style="height: 32px; width: auto; display: inline-block; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>
        </table>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${body}
        ${footer ? `<p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 24px;">${footer}</p>` : ""}
      </div>
    </div>`;
}
