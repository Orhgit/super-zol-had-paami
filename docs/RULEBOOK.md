# Rulebook — סופר זול חד פעמי

חוקים מחייבים. לא הצעות.

---

## קוד כללי

**R1 — גודל קובץ:** מקסימום 400 שורות לקובץ (חוץ מ-`*.stories.tsx`, `*.test.ts`). פצל לפי אחריות.

**R2 — אין `any`:** השתמש ב-`unknown` + type guard. `any` = bug שמחכה לקרות.

**R3 — Zod בכל boundary:** כל API route שמקבל data מבחוץ חייב Zod schema ב-input. כל env variable חייב Zod parse. כל form submission מ-client — validate גם בשרת.

**R4 — כסף באגורות:** `priceAgorot: number` (integer). אף פעם `price: 3.99`. חישוב תמיד ב-integer, המרה ל-display רק בשכבת UI.

**R5 — Storybook חובה:** כל שינוי ויזואלי (component חדש, variant חדש, עיצוב שהשתנה) מגיע עם story ב-`stories/` באותו PR. Story ללא screenshot test = PR ללא עדות.

**R6 — Migrations reversible:** כל `prisma migration` חייב שיהיה ניתן לבטל (`down migration` מתועד). אסור לשחרר migration שמשמיד data ללא backup confirmed.

**R7 — אין URL hardcoded:** `NEXT_PUBLIC_BASE_URL`, `STRIPE_WEBHOOK_SECRET` וכו׳ — הכל מ-`lib/config.ts` עם Zod parse. אין strings של `https://...` בתוך קוד.

**R8 — Third-party wrappers:** Stripe → `lib/payments/stripe.ts`. Email → `lib/email/`. כל SDK חיצוני עטוף ב-abstraction layer. אסור לקרוא ל-`stripe.checkout.sessions.create()` מתוך page component.

**R9 — Structured logger:** `lib/logger.ts` עם structured output. אסור `console.log`. אסור לכלול PII ב-logs (email, שם, כתובת).

**R10 — Pagination:** כל query שמחזיר list חייב cursor-based או offset pagination. אין `findMany()` ללא `take`.

**R11 — Server validation:** כל API route (`app/api/**`) שמקבל body — parse + validate עם Zod לפני כל לוגיק. 400 על validation failure.

**R12 — Async states:** כל component שמביא data מ-server חייב לטפל ב-3 מצבים: loading skeleton, empty state, error boundary/message.

**R13 — Branch strategy:** עבודה על feature branches. PR ל-`main`. אסור commit ישיר ל-`main`. שם branch: `feat/SUP-<id>-<slug>`.

**R14 — Feature flags:** כל feature flag חייב `expiresAt` date. Feature flag שפג תוקפו נמחק.

**R15 — Migration safety:** לפני migration על טבלה גדולה — expand→migrate→contract. אסור `ALTER TABLE` שחוסם reads על hot table.

---

## מוצרים וקטלוג

**R20 — Product images:** תמיד דרך Next.js `Image` component עם `sizes`. אסור `<img>` ישיר. תמיד `alt` תיאורי.

**R21 — מלאי:** `stock` field הוא source of truth. לפני כל הוספה לעגלה — check stock ב-server. Optimistic update רק ב-UI, validation תמיד server-side.

**R22 — קטגוריות:** היררכיה שטוחה (category → subcategory). אסור nested categories מעל 2 רמות.

**R23 — SEO:** כל עמוד product ו-category חייב `generateMetadata()` עם title, description, og:image.

---

## עגלה והזמנות

**R30 — עגלה:** עגלה מאוחסנת ב-server (DB) למשתמשים מחוברים, ב-localStorage ל-guest. Merge בעת login.

**R31 — Checkout flow:** לא לדלג שלבים. כל שלב (cart review → shipping → payment → confirmation) הוא server action נפרד עם validation מלא.

**R32 — Idempotency:** כל Stripe checkout session חייב `idempotency_key`. אסור double-charge.

**R33 — Order status:** מצבים: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED | CANCELLED | REFUNDED`. כל שינוי מצב = event ב-`OrderEvent` table (append-only).

**R34 — Webhook verification:** כל Stripe webhook חייב signature verification. אסור לעבד webhook ללא `stripe.webhooks.constructEvent()`.

---

## אבטחה

**R40 — Auth:** NextAuth עם session. אסור לשמור passwords. Admin routes מאחורי `middleware.ts` role check.

**R41 — Input sanitization:** כל text input מ-user עובר sanitize לפני שמירה ב-DB (למניעת XSS אם מוצג כ-HTML).

**R42 — Rate limiting:** API routes ציבוריות (search, product listing) — rate limit. Checkout — rate limit קפדני.

**R43 — HTTPS only:** אסור להגיש content רגיש דרך HTTP. HSTS header.

**R44 — Secrets בלבד ב-.env:** אסור API keys ב-code. אסור commit של `.env` file.

---

## ביצועים

**R50 — Core Web Vitals:** LCP < 2.5s, CLS < 0.1, FID < 100ms. בדוק לפני כל release.

**R51 — Image optimization:** WebP/AVIF דרך Next.js Image. Lazy loading ברירת מחדל. Placeholder blur.

**R52 — Bundle size:** `pnpm build && pnpm analyze` לפני הוספת dependency גדולה.

**R53 — DB indexes:** כל query שרץ בתדירות גבוהה (product listing, search) חייב index. `EXPLAIN ANALYZE` בכל PR שמוסיף query חדש.
