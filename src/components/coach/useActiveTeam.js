// Hook to manage the active team context for a coach.
// Loads CoachAssignments for the current user (by email),
// persists the selected team id to localStorage, and exposes
// { teams, activeTeam, setActiveTeam, loading }.

import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'active_team_id';

export default function useActiveTeam() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!alive) return;
        setUser(u);
        const list = await base44.entities.CoachAssignment.filter(
          { coach_email: u.email, is_active: true },
          '-created_date',
          50
        );
        if (!alive) return;
        setAssignments(list || []);
        // auto-select first team if nothing persisted or persisted id no longer valid
        if (list.length > 0) {
          const persistedStillValid = list.some(a => a.team_id === activeTeamId);
          if (!activeTeamId || !persistedStillValid) {
            setActiveTeamId(list[0].team_id);
            localStorage.setItem(STORAGE_KEY, list[0].team_id);
          }
        }
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const setActiveTeam = (teamId) => {
    setActiveTeamId(teamId);
    if (teamId) localStorage.setItem(STORAGE_KEY, teamId);
    else localStorage.removeItem(STORAGE_KEY);
  };

  const activeAssignment = assignments.find(a => a.team_id === activeTeamId) || null;

  return {
    loading,
    assignments,
    teams: assignments,
    activeTeamId,
    activeAssignment,
    setActiveTeam,
  };
}