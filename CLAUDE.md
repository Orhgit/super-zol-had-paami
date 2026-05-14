# סופר זול חד פעמי — Claude Code Instructions

**קובץ זה נטען אוטומטית לכל session. הוא נקודת הכניסה הבלעדית לקוד.**

## 🛑 לפני כל עבודה — קרא את זה קודם

לפני קריאת קוד, כתיבת קוד, או מענה לשאלות הנדסה בריפו הזה:

1. **קרא את `docs/RULEBOOK.md`** — מקור האמת לאיך בונים כאן
2. **קרא את הספרים הרלוונטיים לטאסק**:
   - UI / עיצוב → `docs/FRONTEND.md` + פתח Storybook
   - API / backend → `docs/API.md`
   - מוצרים / קטלוג → `docs/CATALOG.md`
   - הזמנות / תשלומים → `docs/ORDERS.md`
   - אבטחה → `docs/SECURITY.md`
3. **הפעל את ה-Skill המתאים** מ-`.claude/skills/dev/` לפני נגיעה בקוד

## 📢 הצהרת ייעוץ (חובה)

השורה הראשונה של כל תשובה הנדסית חייבת להיות:

> Consulted: RULEBOOK R<ids>, <book-name>. Binding rules: R<ids>.

## 📚 הספרים

| ספר | נתיב |
|---|---|
| **Rulebook** | `docs/RULEBOOK.md` |
| Frontend & Storybook | `docs/FRONTEND.md` |
| API & Backend | `docs/API.md` |
| קטלוג מוצרים | `docs/CATALOG.md` |
| הזמנות ותשלומים | `docs/ORDERS.md` |
| אבטחה | `docs/SECURITY.md` |

## 🛠 Skills Directory

| משימה | Skill |
|---|---|
| תכנון feature מ-Linear story | `story-planner` |
| כתיבת קוד production מתוך תכנית | `implementation-agent` |
| pipeline שלם: Linear → PR | `feature-dev` |
| בניית UI component / page | `frontend-design` |
| code review לפני push | `code-reviewer` |
| ספק טכני / ארכיטקטורה / נקודות שבירה | `nextjs-senior-team` |
| החלטות אוטונומיות / מועצת מומחים | `auto-decider` |

## 🏗️ ארכיטקטורה

חנות Next.js 15 (App Router) + Prisma + TypeScript + Tailwind CSS.

```
app/                  ← Next.js App Router (pages, layouts, API routes)
  (shop)/             ← routes ציבוריות: דף בית, קטגוריות, מוצרים, עגלה, checkout
  (admin)/            ← ממשק ניהול: מוצרים, הזמנות, לקוחות
  api/                ← API routes (RESTful)
components/           ← React components
  ui/                 ← אטומים: Button, Input, Card, Badge (מחוברים לסטורי בוק)
  shop/               ← ProductCard, CartDrawer, CheckoutForm, ...
  admin/              ← AdminTable, ProductForm, OrderStatus, ...
lib/                  ← logic ללא UI
  prisma.ts           ← Prisma client singleton
  auth.ts             ← NextAuth config
  cart.ts             ← cart logic (server)
  payments/           ← Stripe wrapper
prisma/
  schema.prisma       ← DB schema
  migrations/         ← Prisma migrations
stories/              ← Storybook stories (*.stories.tsx)
docs/                 ← ספרי הפרוייקט (RULEBOOK, FRONTEND, API, ...)
```

## ✅ חוקים חיוניים

- **R1** קובץ מקסימום 400 שורות
- **R2** אין `any` — `unknown` + type guard
- **R3** Zod בכל boundary חיצוני (API routes, form inputs, env)
- **R4** כסף = integer אגורות, אף פעם float (`priceAgorot: number`)
- **R5** כל שינוי UI מגיע עם Storybook story באותו PR
- **R6** migrations של Prisma תמיד reversible
- **R7** אין URL hardcoded — הכל דרך `lib/config.ts`
- **R8** Stripe ו-third-party SDKs רק דרך wrappers ב-`lib/payments/` ו-`lib/integrations/`
- **R9** אין `console.log` בקוד production — structured logger
- **R10** כל query שמחזיר list צריך pagination
- **R11** validation בצד שרת על כל API route שמקבל input
- **R12** טיפול ב-loading / empty / error state בכל component async
- **R13** commit ל-`main` רק דרך PR (feature branches!)
- **R14** כל feature flag עם תאריך פקיעה
- **R15** migrations אסור שישברו את ה-DB בלי rollback plan

## 🧠 Storybook First

לפני יצירת כל component חדש:
1. חפש ב-Storybook אם כבר קיים
2. בדוק `components/ui/` — אל תמציא מחדש מה שכבר קיים
3. אם יוצר component חדש — כתוב story ב-`stories/` באותו PR (R5)

הרץ Storybook: `pnpm storybook` (פורט 6006)

## 🚫 מה לא לעשות

- אל תדלג על Pre-Work Consultation
- אל תצור component בלי לבדוק Storybook קודם
- אל תשתמש ב-`any` (R2)
- אל תכתוב float לכסף (R4)
- אל תכניס URL hardcoded (R7)
- אל תקרא ל-Stripe ישירות — רק דרך `lib/payments/` (R8)
- אל תשכח error / loading / empty states (R12)
- אל תדחוף ל-`main` ישירות (R13)
- אל תכתוב migration ללא rollback (R15)
- אל תבצע push / PR אוטומטית — תמיד interactive

## 🆘 כשיש ספק

שאל. שאלה עולה שניות; כיוון שגוי עולה שעות.
