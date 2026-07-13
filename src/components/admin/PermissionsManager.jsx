import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck, Eye, Pencil } from 'lucide-react';

const DATA_POINTS = [
  { key: 'personal_info', label: 'פרטים אישיים' },
  { key: 'medical_status_light', label: 'סטטוס רפואי (רמזור)' },
  { key: 'full_medical_record', label: 'תיק רפואי מלא' },
  { key: 'salary_contracts', label: 'נתוני שכר/חוזים' },
  { key: 'performance_scores', label: 'ציוני ביצועים' },
  { key: 'transfer_history', label: 'היסטוריית העברות' },
];

export default function PermissionsManager() {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: () => base44.entities.RolePermission.list(),
  });

  const toggle = useMutation({
    mutationFn: ({ role, key, mode, value }) => {
      const current = role.data_points?.[key] || {};
      const nextEntry = { ...current, [mode]: value };
      // Editing implies viewing — can't edit what you can't see.
      if (mode === 'edit' && value) nextEntry.view = true;
      // Removing view access removes edit access too.
      if (mode === 'view' && !value) nextEntry.edit = false;
      return base44.entities.RolePermission.update(role.id, {
        data_points: { ...role.data_points, [key]: nextEntry },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role-permissions'] }),
  });

  if (isLoading) return <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-[#D4AF37]" />
        <h2 className="text-white font-black text-xl">ניהול הרשאות לפי תפקיד</h2>
      </div>
      <p className="text-white/40 text-xs mb-6">לכל נתון — סמן <Eye size={11} className="inline text-white/50" /> לצפייה ו/או <Pencil size={11} className="inline text-white/50" /> לעריכה, עבור כל תפקיד (שחקן, הורה, מאמן, מנהל מקצועי, אדמין).</p>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead className="bg-[#1B263B]">
            <tr>
              <th className="text-white/40 font-bold py-3 px-4 text-right whitespace-nowrap">נתון \ תפקיד</th>
              {roles.map(r => (
                <th key={r.id} className="text-[#D4AF37] font-bold py-3 px-4 text-center whitespace-nowrap">{r.role_label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA_POINTS.map(dp => (
              <tr key={dp.key} className="border-t border-white/5">
                <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{dp.label}</td>
                {roles.map(r => {
                  const entry = r.data_points?.[dp.key] || {};
                  return (
                    <td key={r.id} className="py-3 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <label title="צפייה" className="flex flex-col items-center gap-0.5 cursor-pointer">
                          <Eye size={11} className="text-white/30" />
                          <input
                            type="checkbox"
                            checked={!!entry.view}
                            onChange={e => toggle.mutate({ role: r, key: dp.key, mode: 'view', value: e.target.checked })}
                            className="accent-[#D4AF37] w-3.5 h-3.5 cursor-pointer"
                          />
                        </label>
                        <label title="עריכה" className="flex flex-col items-center gap-0.5 cursor-pointer">
                          <Pencil size={11} className="text-white/30" />
                          <input
                            type="checkbox"
                            checked={!!entry.edit}
                            onChange={e => toggle.mutate({ role: r, key: dp.key, mode: 'edit', value: e.target.checked })}
                            className="accent-green-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {roles.map(r => (
          <div key={r.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
            <div className="text-white font-bold text-sm mb-1">{r.role_label}</div>
            {r.notes && <p className="text-white/40 text-xs leading-relaxed">{r.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}