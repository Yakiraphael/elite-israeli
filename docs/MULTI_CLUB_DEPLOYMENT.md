# ארכיטקטורה רב-מועדונית (Multi-Tenant) — עילית ישראלית

מסמך עבודה להשקה מבוקרת של מודל רב-מועדונים מול ההתאחדות לכדורגל בישראל. מתעד את מבנה הנתונים, ההרשאות, נקודות הקצה ותוכנית היישום בפועל.

---

## 1. מודל הריבוי-דיירים (Data Isolation)

### מפתח דייר: `club_id`
כל ישות עסקית נושאת `club_id` המקשר ל-`Club.id`. המשתמש נושא `user.data.club_id`
(מאוכלס מ-`ClubUser.club_id` / `User.club_id`). RLS מגביל גישה ע"י התאמת
`data.club_id == {{user.data.club_id}}` לתפקידי סגל (coach/director/scout), בעוד
`role: admin` (Super Admin) נשאר רוחבי-מערכת.

| ישות | club_id | RLS נוכחי | מצב |
|------|---------|-----------|------|
| Club | (זהות) | admin ניהול; created_by קריאה | ✅ נוסף |
| Team | ✅ | — | Phase 2: RLS מותנה-מועדון |
| ClubUser | ✅ | — | Phase 2: תפיסת Seat + RLS |
| CoachAssignment | ✅ | — | Phase 2: RLS מותנה-מועדון |
| Contract | ✅ | ✅ `data.club_id == user.data.club_id` | ✅ |
| PlayerRegistration | ✗ (דרך `team_id→Team.club_id`) | role-broad | Phase 3: הוספת `club_id` + RLS |
| TransferProposal | (חדש: `from_club_id`/`to_club_id`) | — | Phase 2 |
| AuditLog, BehaviorLog, TeamReport | ✗ | — | Phase 3 |

### סיווג ארגוני (Org Classification)
`Club.org_classification` — ארבעה ערכים קובעים את פרופיל השחקן ומנוע הסקאוטינג:
- `IFA_VERIFIED` — מועדון מאומת התאחדות: הופעות רשמיות, דמי השבחה, מעקב חוזים, בדיקת כרטיס IFA.
- `YOUTH_DEPARTMENT` — מחלקת נוער: סקאוטינג פנימי גמיש + נתוני טורניר/השתתפות.
- `AMATEUR_LEAGUE` / `ASSOCIATION` — ליגת חובבנים/עמותה: נתוני טורניר והשתתפות בלבד.
מנוע ההקשר ב-`src/lib/orgProfileContext.js` (`resolveOrgContext`); הסיווג נקבע בעת בחינת המועדון (`ClubReviewModal`).

### מיפוי תפקידי RBAC (אפיון → פלטפורמה)
| אפיון | `User.role` | הרשאות |
|------|-----------|--------|
| SUPER_ADMIN | `admin` | קליטת מועדונים, אישור מסמכים, פקוח עברות בין-מועדוניות |
| CLUB_OWNER / SPORT_DIRECTOR | `director` | אישור חוזים, מו"מ, הגשת סגלים — במועדון שלהם בלבד |
| COACH | `coach` | צפייה בסגל, הגשת טפסי משחק (מותנה רגולטורית) |
| PLAYER / GUARDIAN | `player` / `guardian` | גישה לפרופיל השחקן בלבד |

### עיקרון הסליאה
- **Super Admin** (`role: admin`) — חוצה-מועדונים (קליטת מועדונים, אימות, השעיה).
- **מנהל מקצועי/מאמן/סקאוט** — מוגבל ל-`club_id` שלהם (RLS קשיח בצד שרת).
- **שחקן/אפוטרופוס** — גישה לרשומות השחקן שלהם בלבד (לפי `player_user_id` / `parent_email`).

---

## 2. קליטה ובחינת מועדונים (Super Admin Portal)

### נתיב: `/super-admin` (גישה: `role: admin` בלבד)
- `src/pages/SuperAdminPanel.jsx` — שער תפקיד + כרום.
- `src/components/admin/ClubOnboardingPanel.jsx` — רשימת מועדונים + סינון לפי
  סטטוס תפעולי/אימות + KPIs.
- `src/components/admin/ClubReviewModal.jsx` — בחינת מסמכים + קביעת סטטוס.

### שלבי קליטה (`Club.operational_status` / `onboarding_stage`)
```
הגשה → אימות מסמכים → חברות בהתאחדות → פעיל
ממתין להפעלה → בבדיקה → פעיל (| מושעה | נדחה)
```

### מסמכי חובה לבחינה
1. `incorporation_certificate_url` — רשם חברות/עמותות.
2. `ifa_membership_certificate_url` — חברות בהתאחדות לכדורגל.
3. `insurance_certificate_url` — פוליסת ביטוח חבות/צד ג'.
4. `protocol_documents[]` — תקנונים/פרוטוקולים נוספים.

### תיעוד החלטה
`reviewer_id`, `reviewer_name`, `reviewed_at`, `rejection_reason`, `operational_active_from` + רשומת `AuditLog`.

---

## 3. מנוע העברות בין-מועדוניות (Inter-Club Transfer Engine)

### נקודת קצה: `POST /api/functions/evaluateInterClubTransfer`
- תוכן: `{ "transfer_id": "<TransferProposal.id>" }`
- תפקידים מורשים: `admin`, `director`.
- תוצאה:
```json
{
  "transfer_scope": "בין-מועדוני (עילית)",
  "from_club": { "id", "name", "verified", "operational_status" },
  "to_club":   { "id", "name", "verified", "operational_status" },
  "both_verified": true,
  "gating_ok": true,
  "reasons": [],
  "required_approvals": ["אפוטרופוס","מנהל מקצועי קולט","מנהל מקצועי מעביר","IFA","תשלום IEFA"],
  "ifa_fee_required": true,
  "solidarity_fee_required": false,
  "recommended_iefa_fee": 2500,
  "evaluated_at": "2026-08-02T…"
}
```

### חסמים תקנוניים מאולצים
- **אימות** — שני המועדונים `is_verified && verification_status == "מאומת" && operational_status == "פעיל"`.
- **הבדלת דייר** — מועדון מעביר ≠ מועדון קולט.
- **דמי תיווך IEFA (5%)** — רק לבוגרים בהעברה בין-מועדונית (`contract_value * 0.05`).
- **דמי גריעה (Solidarity)** — רק להעברה בינלאומית בין-מועדונית.
- **אישור מועדון מעביר** — `releasing_club_approval_status` נדרש לפני סגירה (`releasing_director_id/name/approved_at`).

### היקף (`transfer_scope`)
- `בין-מועדוני (עילית)` — מפעיל הידור מלא.
- `תוך-מועדוני` — מעבר קבוצה באותו מועדון/ארגון (ללא אישור מועדון מעביר).
- `מבצע חיצוני` — מועדון חיצוני פונה (זרימה קיימת).

### שילוב בשער האישור הקיים
התוצאה מוזרמת ל-`buildApprovalChecks` (templateWorkflowEngine) כבדיקת זכאות
נוספת, לצד בדיקות הקטינים/OTP/מסמכים הקיימות.

---

## 4. פריסת עבודה בפועל (Production Deployment)

### עונה א' — יסוד (הושלם בנתון זה)
- [x] ישות `Club` עם שדות קליטה + RLS (admin ניהול).
- [x] פורטל Super Admin (`/super-admin`).
- [x] מנוע `evaluateInterClubTransfer` + שדות בין-מועדוניים ב-`TransferProposal`.
- [x] מנגנוני מו"מ / חתימה דיגיטלית / קטינים / QA — קיימים ומשולבים.

### עונה ב' — חיזוק הפרדה
- [ ] הוספת RLS מותנה-מועדון ל-`Team`, `ClubUser`, `CoachAssignment`, `TransferProposal`.
- [ ] backfill של `club_id` ב-`PlayerRegistration` (מ-`team_id → Team.club_id`) + הוספת RLS.
- [ ] ייבוא משתמשי מועדון → קישור `user.data.club_id` + `linked_accounts`.

### עונה ג' — עומק תפעולי
- [ ] RLS ל-`BehaviorLog`, `TeamReport`, `MatchSquad`, `PhysioAssessment`.
- [ ] דשבורד רב-מועדוני מצרפי (רק Super Admin) + דוחות חברות בהתאחדות.
- [ ] אוטומציית תזכורות חידוש חברות שנתית להתאחדות.

### צעדי הפעלה לארגון (לפני תחילת העונה)
1. **קליטת מועדונים** — כניסה ל-`/super-admin`, העלאת מסמכים, הגדרת
   `verification_status = מאומת` ו-`operational_status = פעיל` לכל מועדון רשום.
2. **חיבור משתמשים** — `user.data.club_id` מותאם למשתמשי הסגל/מאמנים.
3. **אימות יתד** — יצירת `ClubUser` פעיל לכל Seat; בדיקת תקורת מנוי (`max_allowed_users`).
4. **תקשורת מנוע העברות** — בעת יצירת `TransferProposal`, קביעת `transfer_scope`
   ו-`from_club_id`/`to_club_id`, וקריאה ל-`evaluateInterClubTransfer` בשער האישור.