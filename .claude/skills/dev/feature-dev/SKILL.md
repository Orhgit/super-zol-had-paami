---
name: feature-dev
description: "Pipeline שלם: Linear story → קוד מאושר → PR. השתמש כשמבקשים end-to-end feature work או 'תעשה הכל' על סטורי מ-Linear."
---

# Feature Development Pipeline — סופר זול חד פעמי

Pipeline מלא: Linear → תכנון → מימוש → review → PR.

```
Linear Story (SUP-NNN)
    │
    ▼
Phase 1: קרא את הסטורי
    │
    ▼
Phase 2: תכנון (story-planner skill)
   ├─ Devil's Advocate
   ├─ Impact analysis
   ├─ Task breakdown + AC
   └─ Gate: אישור משתמש → צור Linear sub-issues
    │
    ▼
Phase 3: מימוש טאסק אחרי טאסק (implementation-agent skill)
   ├─ Architect Pass
   ├─ Edit → compile gate → fix → next file
   └─ Gate: code review אחרי כל טאסק
    │
    ▼
Phase 4: Tests
   ├─ pnpm typecheck + lint + build
   └─ Unit tests / E2E
    │
    ▼
Phase 5: PR
   └─ PR ל-main עם Linear mapping
```

---

## Phase -1: Constitutional Pre-flight

## 🔴 Sacred Topics Gate — לפני הכל

אם הבקשה נוגעת באחד מאלה → עצור מיד ודווח ל-HUMAN ללא דיון:
- כסף / מחיר / חישוב מע"מ / אגורות
- Prisma migration / שינוי schema
- Auth / permissions / roles
- Cardcom / חשבשבת / תשלומים
- מחיקת data (delete, drop, truncate)
- שינוי API חיצוני
- Secrets / env variables

**Reversibility:**
🔒 IRREVERSIBLE — לא ניתן לבטל → HUMAN תמיד
⏳ COSTLY — עולה יום עבודה לבטל → שאל לפני
🔄 REVERSIBLE — ניתן לבטל תוך שעה → המשך

---

**Scope Declaration:** לפני הכל, הצהר על ה-branch ועל הקבצים שייגעו.

**Devil's Advocate:** הצהר על:
1. סיבה אחת שהדרישה עשויה להיות שגויה
2. סיכון נסתר אחד

**Auto Mode Restrictions — תמיד interactive:**
- `git push`
- PR create
- `prisma db push` / `prisma migrate deploy`

---

## שלב -1 — Order Check

לפני שמתחילים — בדוק:
1. מה השלב הנוכחי של הפרויקט? (תשתית / עיצוב / לוגיקה / תוכן)
2. האם כל מה שהסקיל הזה דורש כבר קיים?
3. האם הפעולה המבוקשת מתאימה לשלב הנוכחי?

כלל ברזל: לא מדלגים על שלבים.
אם מגלים קפיצת שלב → HUMAN מיד עם הסבר.

---

## Phase 0: Consultation Receipt

`Consulted: RULEBOOK R1–R15, R20–R53. Binding rules: <רלוונטיים לסטורי זה>.`

---

## Phase 1: קרא את הסטורי

שלוף מ-Linear עם MCP:
- טיטל, תיאור, AC, sub-issues
- attachments ו-mockups

---

## Phase 1.5: Blast Radius Scan

@arch סורק לפני התכנון:
- קבצים שייגעו לפי הסטורי: [רשימה ראשונית]
- מה מייבא אותם: [grep]
- האם יש feature קיים שעלול להישבר: [רשימה]

**Gate:** אם Blast Radius חוצה קומפוננטים קריטיים (checkout, auth, DB schema) → HUMAN לפני תכנון.

---

## Phase 2: תכנון

הפעל `story-planner` skill.
צור תכנית מלאה עם task breakdown.
**Gate:** הצג למשתמש → אשר → צור Linear sub-issues.

---

## Phase 3: מימוש

לכל טאסק:
1. **Gate:** הצג approach → אשר
2. הפעל `implementation-agent` skill
3. הרץ `pnpm typecheck` — אם נכשל → תקן קודם
4. **Code Review:** בדוק מול bugs נפוצים מה-implementation-agent
5. **Gate:** הצג תוצאות → אשר → עבור לטאסק הבא

שם commit: `feat(SUP-<id>): <description>`

---

## Phase 4: Tests

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

אם יש כשלונות → חזור ל-Phase 3 לתיקון.

---

## Phase 5: PR

שם branch: `feat/SUP-<id>-<slug>`
PR title: `feat(SUP-<id>): <כותרת הסטורי>`

Body הכולל:
- Summary of changes
- Linear sub-issues list
- Test plan
- Screenshots (אם UI change)

**Gate:** הצג ל-user → אשר → `gh pr create`

---

## Checklist לסיום

- [ ] Consultation receipt הוצהר
- [ ] כל Linear sub-issues נוצרו ועודכנו
- [ ] כל טאסק עם commit נפרד
- [ ] `pnpm typecheck` נקי
- [ ] `pnpm build` עובר
- [ ] Storybook stories לכל שינוי UI (R5)
- [ ] Migration reversible (R6)
- [ ] PR נוצר עם Linear mapping

---

## Pattern Detector

אחרי כל פעולה — בדוק:
האם בעיה דומה הופיעה 3+ פעמים בפרויקט?
כן → צור Linear issue: "בעיה ארכיטקטורלית חוזרת: [נושא]"
זו לא שאלה נקודתית — זה סימפטום של בעיה עמוקה יותר.

---

## מה לא לעשות

- אל תדלג על תכנון — קוד בלי תכנית = rework
- אל תממש טאסקים מרובים בcommit אחד
- אל תעבור gate ללא אישור משתמש
- אל תדחוף ל-`main` ישירות (R13)
- אל תפעל אוטומטית push / PR / migrate
