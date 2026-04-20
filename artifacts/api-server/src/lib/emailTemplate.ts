export function brandedEmail(title: string, body: string, footer?: string): string {
  // Public absolute URL is the only reliable way to embed an image in HTML
  // email — Gmail strips data: URIs, and SVG isn't supported in most clients.
  // The logo file lives in the web app's public folder so it's served at the
  // root of the deployed site.
  const logoBase = (process.env.PUBLIC_WEB_URL || "https://avanarecruit.ai").replace(/\/$/, "");
  const logoUrl = `${logoBase}/avana-logo.png`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a2035; padding: 16px 20px; border-radius: 8px 8px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          <tr>
            <td align="left" valign="middle" style="vertical-align: middle;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 20px; line-height: 32px;">${title}</h1>
            </td>
            <td align="right" valign="middle" width="140" style="width: 140px; vertical-align: middle;">
              <img src="${logoUrl}" alt="AVANA Recruit" width="140" height="32" style="display: block; width: 140px; height: 32px; border: 0; outline: none; text-decoration: none;" />
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
