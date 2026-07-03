import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled weekly job: emails the professional director a summary of new players, open debts, and new injuries/requests.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const settingsList = await base44.asServiceRole.entities.ComplianceSettings.list();
    const reportEmail = settingsList[0]?.report_email;
    if (!reportEmail) {
      return Response.json({ success: false, reason: 'no report_email configured' });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const players = await base44.asServiceRole.entities.PlayerRegistration.list('-created_date', 500);
    const newPlayers = players.filter(p => new Date(p.created_date) >= weekAgo);

    const payments = await base44.asServiceRole.entities.Payment.list('-created_date', 500);
    const openDebt = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').reduce((s, p) => s + (p.amount || 0), 0);

    const requests = await base44.asServiceRole.entities.PlayerRequest.list('-created_date', 200);
    const newInjuryRequests = requests.filter(r => r.category === 'פציעה/בריאות' && new Date(r.created_date) >= weekAgo);

    const body = `
      <h2>סיכום שבועי — IEFA</h2>
      <p><b>שחקנים חדשים השבוע:</b> ${newPlayers.length}</p>
      <p><b>חובות פתוחים כרגע:</b> ₪${openDebt.toLocaleString()}</p>
      <p><b>פציעות/דיווחי בריאות חדשים השבוע:</b> ${newInjuryRequests.length}</p>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: reportEmail,
      subject: 'סיכום שבועי — IEFA Director Dashboard',
      body,
      from_name: 'IEFA System',
    });

    return Response.json({ success: true, newPlayers: newPlayers.length, openDebt, newInjuryRequests: newInjuryRequests.length });
  } catch (error) {
    console.error('weeklyReportEmail error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});