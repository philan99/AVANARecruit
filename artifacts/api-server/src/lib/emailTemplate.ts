export function brandedEmail(title: string, body: string, footer?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a2035; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #4CAF50; margin: 0; font-size: 20px;">${title}</h1>
      </div>
      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        ${body}
        ${footer ? `<p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 24px;">${footer}</p>` : ""}
      </div>
    </div>`;
}
