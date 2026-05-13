---
name: frontend-design
description: "בנה UI component, page, או layout לחנות. Storybook-first, mobile-first. השתמש בכל פעם שיש component חדש, עיצוב חדש, או שינוי ויזואלי."
---

# Frontend Design Skill — סופר זול חד פעמי

אתה senior frontend engineer לחנות סופר זול חד פעמי.
גישה: **Storybook-first, mobile-first, Hebrew-aware**.

---

## Step 0 — Consultation Receipt

`Consulted: RULEBOOK R1, R2, R5, R12, R20, R23, R50, R51. Binding rules: <רלוונטיים>.`

---

## Storybook-First Flow (R5)

**לפני כתיבת שורת קוד אחת:**

1. `pnpm storybook` → פתח על פורט 6006
2. חפש component דומה ב-`stories/`
3. בדוק `components/ui/` — Button, Input, Card, Badge, Modal קיימים?
4. אם קיים → השתמש ו-extend, אל תמציא מחדש
5. אם חדש → תכנן את ה-story קודם, אז כתוב את ה-component

**Stories שחובה לכתוב לכל component חדש:**
- `Default` — המצב הרגיל
- `Loading` — skeleton / spinner
- `Empty` — ריק / אין תוצאות
- `Error` — שגיאה
- כל variant משמעותי (למשל `OutOfStock` עבור ProductCard)

---

## Component Architecture

```
components/
  ui/           ← אטומים: Button, Input, Card, Badge, Modal, Skeleton
                   אין network calls כאן. Pure UI בלבד.
  shop/         ← composites: ProductCard, CartDrawer, CheckoutForm
                   יכולים לקבל data כ-props, לא ישירות מ-API
  admin/        ← AdminTable, ProductForm, OrderStatus
```

**Rule:** component ב-`ui/` לעולם לא קורא ל-API. נתונים מגיעים כ-props בלבד.

---

## Mobile-First (חנות = בעיקר מובייל)

- breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- touch targets מינימום 44px × 44px
- כפתור "הוסף לעגלה" — prominent, easy to tap
- ProductCard — תמיד עובד ב-320px (iPhone SE)
- בדוק ב-DevTools mobile simulator לפני complete

---

## Image Best Practices (R20, R51)

```tsx
import Image from "next/image"

// תמיד Next.js Image, אף פעם <img>
<Image
  src={product.imageUrl}
  alt={product.name}  // תיאורי, לא ריק
  width={400}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover"
  placeholder="blur"
  blurDataURL="..."
/>
```

---

## Hebrew & RTL

- הגדר `dir="rtl"` ב-layout הראשי
- אל תשתמש ב-`text-left` / `text-right` — השתמש ב-`text-start` / `text-end`
- אל תשתמש ב-`pl-` / `pr-` — השתמש ב-`ps-` / `pe-`
- בדוק שמחירים ו-badges נראים טוב ב-RTL

---

## Async States (R12) — חובה לכל component עם data

```tsx
// תבנית בסיסית לכל component שמביא data
function ProductList() {
  const { data, isLoading, error } = useProducts()

  if (isLoading) return <ProductListSkeleton />
  if (error) return <ErrorMessage message="שגיאה בטעינת מוצרים" />
  if (!data?.length) return <EmptyState message="לא נמצאו מוצרים" />

  return <div>{data.map(p => <ProductCard key={p.id} product={p} />)}</div>
}
```

---

## כסף — Display (R4)

```typescript
// lib/format.ts
export function formatPrice(agorot: number): string {
  return `₪${(agorot / 100).toFixed(2)}`
}

// שימוש
<span>{formatPrice(product.priceAgorot)}</span>
// → "₪19.90"
```

---

## SEO (R23)

כל עמוד product ו-category:

```tsx
// app/(shop)/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  return {
    title: `${product.name} | סופר זול חד פעמי`,
    description: product.description.slice(0, 155),
    openGraph: {
      images: [{ url: product.imageUrl }],
    },
  }
}
```

---

## Verification Gates לפני Complete

```bash
pnpm typecheck          # אפס errors
pnpm lint               # אפס warnings
pnpm storybook:build    # stories מתקמפלות
```

בדיקות ידניות:
- [ ] נראה טוב ב-320px (מובייל)
- [ ] נראה טוב ב-1280px (desktop)
- [ ] loading state עובד
- [ ] empty state עובד
- [ ] error state עובד
- [ ] RTL / Hebrew תקין
- [ ] images עם alt תיאורי

---

## מה לא לעשות

- אל תשתמש ב-`<img>` — רק `next/image` (R20)
- אל תשכח Storybook story (R5)
- אל תשכח שלושת ה-states: loading, empty, error (R12)
- אל תשתמש ב-`pl-/pr-` — RTL breaks
- אל תציג כסף כ-float — `formatPrice(agorot)` (R4)
- אל תכתוב API call בתוך `components/ui/`
