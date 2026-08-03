import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// App Store "Right to be Forgotten" — deletes the calling user's entity-level
// data across the platform and strips PII from their auth profile. The auth
// account itself is managed by the platform; we clear what we can.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    // 1. Delete user-owned records across key entities
    const entityNames = ['PlayerRegistration', 'TeamReport', 'Contract', 'ClubUser', 'BehaviorLog', 'PlayerCaseNote'];
    for (const name of entityNames) {
      try {
        const records = await base44.asServiceRole.entities[name].filter({ created_by_id: userId }, undefined, 200);
        for (const r of records) {
          try { await base44.asServiceRole.entities[name].delete(r.id); } catch {}
        }
      } catch {}
    }

    // 2. Strip PII from auth profile
    try { await base44.auth.updateMe({ full_name: 'Deleted User' }); } catch {}

    // 3. Audit log
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        actor_id: userId, actor_name: user.full_name, actor_role: user.role,
        action: 'retention_anonymize',
        details: 'Account deletion requested by user (App Store compliance)'
      });
    } catch {}

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}