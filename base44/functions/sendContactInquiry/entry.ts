import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const db = base44;
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a4d3d;">New Customer Inquiry</h2>
        <p style="color: #666;">A customer has submitted a message through the FunFable contact form.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #888; width: 100px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Email:</td><td style="padding: 8px 0; font-weight: bold;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Subject:</td><td style="padding: 8px 0; font-weight: bold;">${subject}</td></tr>
        </table>
        <div style="background: #f8f5f0; border-radius: 12px; padding: 16px; margin-top: 16px;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
          <p style="margin: 8px 0 0 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 24px; color: #999; font-size: 12px;">Reply directly to the customer at ${email}</p>
      </div>
    `;

    await db.asServiceRole.integrations.Core.SendEmail({
      to: 'hello@funfable.store',
      subject: `Contact: ${subject}`,
      body: html,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}