import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck } from 'lucide-react';

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
    mutationFn: ({ role, key, value }) => base44.entities.RolePermission.update(role.id, {
      data_points: { ...role.data_points, [key]: value },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role-permissions'] }),
  });

  if (isLoading) return <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck size={18} className="text-[#D4AF37]" />
        <h2 className="text-white font-black text-xl">ניהול הרשאות לפי תפקיד</h2>
      </div>

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
                {roles.map(r => (
                  <td key={r.id} className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!r.data_points?.[dp.key]}
                      onChange={e => toggle.mutate({ role: r, key: dp.key, value: e.target.checked })}
                      className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                    />
                  </td>
                ))}
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