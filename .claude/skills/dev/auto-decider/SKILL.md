---
name: auto-decider
description: "מועצת החלטות אוטונומית לשאלות פיתוח. מסווגת שאלות, מכנסת מועצת מומחים, מצביעה עם נימוקים, ומחליטה — ללא שאלות מיותרות למשתמש. Human gate רק לדברים שמגיעים לסף."
---

# Auto-Decider — מועצת ההחלטות

המטרה: לקבל החלטות פיתוח מהר, מדויק, ובלי להטריד את המשתמש בשאלות טריוויאליות.

---

## ⚠️ מגבלות יסוד — חובה לקרוא לפני שימוש

מחקרים אקדמיים (2024–2025) מראים:

**Correlated Errors:** 60–76% מהטעויות בין מודלי LLM מתואמות — הם מאומנים על אותו data. הסכמה של מספר סוכנים ≠ אמת. הסכמה רק מחזקת את הביטחון, לא את הדיוק.

**Sycophancy:** מודלים נכנעים ללחץ ב-63–90% מהמקרים. אם השאלה מנוסחת עם הטיה, התשובה תהיה מוטה.

**Overconfidence:** מודלים מדווחים confidence גבוה גם כשהם טועים — calibration אמיתי קיים רק ב-token probabilities, לא בפלט המילולי.

**Cascade errors:** מערכות multi-agent נכשלות ב-41–86% מהמקרים על tasks מורכבים.

**מסקנה:** המועצה טובה לאיסוף זוויות ראייה ולסינון שאלות שלא נשאלו. היא **לא** תחליף לשיפוט אנושי בהחלטות irreversible.

---

## שלב -1 — בדיקת סדר פעולות (חובה לפני כל שלב)

לפני כל פעולה — @arch מריץ בדיקת "האם אני בשלב הנכון?":

```
@arch — Architecture Order Check:
1. מה השלב הנוכחי של הפרויקט? (תשתית / עיצוב / לוגיקה / תוכן)
2. האם כל התשתיות הקודמות לשלב זה הושלמו?
   - DB מוגדר ועולה?
   - Backend עולה ומגיב?
   - Frontend בסיסי פועל?
   - עיצוב ו-layout מוגדרים?
3. האם הפעולה המבוקשת מתאימה לשלב הנוכחי?
4. אם לא — מה השלב שצריך לבצע קודם?
```

**כלל ברזל:** אסור לדלג על שלב תשתית כדי לבצע שלב תוכן.
- אסור לייבא מוצרים לפני שה-DB עולה
- אסור לבנות UI לפני שה-backend מגיב
- אסור להגדיר integrations לפני שהסביבה יציבה

אם @arch מגלה קפיצת שלב → **HUMAN מיד** עם הסבר מה חסר.

```
🛑 WRONG ORDER DETECTED

שלב מבוקש: [מה ביקשו]
שלב נוכחי: [מה המצב האמיתי]
מה חסר לפני: [רשימת תנאים מקדימים]
השלב הנכון עכשיו: [מה לעשות במקום]
```

---

## שלב 0 — סיווג השאלה

לפני הכל — בדוק לפי הסדר הזה:

### Gate 1: Sacred Topics (לפני המועצה)
אם השאלה נוגעת באחד מאלה → **HUMAN מיד, ללא דיון:**

```
- כסף / מחיר / חישוב מע"מ / אגורות
- Prisma migration / שינוי schema
- Auth / permissions / roles
- Cardcom / חשבשבת / תשלומים
- מחיקת data (delete, drop, truncate)
- שינוי API חיצוני
- Secrets / env variables
```

### Gate 2: Reversibility Check
לפני המועצה — תייג:
```
🔄 REVERSIBLE    — ניתן לבטל תוך שעה
⏳ COSTLY        — ניתן לבטל, עולה יום עבודה
🔒 IRREVERSIBLE  — לא ניתן לבטל
```
**🔒 IRREVERSIBLE = HUMAN מיד, ללא קשר לנושא**

### Gate 3: סיווג
```
TRIVIAL   → auto-decider לבד (שמות, imports, קבצים, בחירה בין 2 שוות)
COUNCIL   → מועצת מומחים
HUMAN     → עצירה + הסבר מלא
```

---

## שלב 1 — Blast Radius (לפני הצבעה)

לפני שהמועצה פותחת פה, @arch מריץ סריקה:

```
Blast Radius Report:
- קבצים שנוגעים: [רשימה]
- מי מייבא אותם: [grep imports]
- החלטות קודמות באותו אזור (מה-log): [האם יש סתירה?]
- מה feature/component נוכחי שיכול להישבר: [רשימה]
```

אם נמצאת סתירה עם החלטה קודמת → **HUMAN מיד.**

---

## שלב 2 — הצבעה עיוורת (Blind Voting)

**כלל קריטי נגד Authority Bias ו-Groupthink:**
כל סוכן מצביע **לפני** שרואה עמדות אחרים. אין deliberation עד אחרי ההצבעה.

כל סוכן מדווח:

```
@[role]: [🟢 APPROVE / 🟡 CONDITIONAL / 🔴 BLOCK]
Confidence: [HIGH / MEDIUM / LOW]
נימוק 1: ...
נימוק 2: ...
נימוק 3: ...
סיכון שאני עלול לפספס: ... ← חובה
```

### תפקידי המועצה (Functional, לא Hierarchical):

**@impact** — טווח השפעה. שואל: "מה עוד יישבר?"
**@data** — DB, Prisma, transactions, migrations. שואל: "האם יש race condition?"
**@security** — auth, injection, secrets, rate limiting. שואל: "איפה יכול להיפרץ?"
**@performance** — queries, bundle, cache, ISR. שואל: "מה יאט?"
**@devil** — Devil's Advocate. תפקידו **לתקוף** כל הצעה, גם אם הוא מסכים אישית.

**@devil הוא חובה בכל סבב.** ללא יוצא מן הכלל.

---

## שלב 3 — אגרגציה והחלטה

### חוקי Gate (כל אחד מספיק לבדו):

```
אחד 🔴  →  HUMAN
@devil מביא ראיה שלא נשקלה  →  HUMAN
2+ סוכנים ב-LOW confidence  →  החזר שאלת הבהרה (לא HUMAN, לא החלטה)
Deadlock: 2+ סוכנים עם ראיות חזקות לכיוונים מנוגדים  →  HUMAN
```

### Deadlock — מה להציג למשתמש:

```
⚠️ DEADLOCK — נדרשת החלטת ערכים

@data: [עמדה] כי [א, ב, ג]
@performance: [עמדה הפוכה] כי [ד, ה, ו]

שניהם צודקים. זו לא שאלה טכנית — זו שאלה של עדיפות עסקית:
[X] vs [Y] — מה חשוב יותר לך?
```

### מה אחרי הצבעה תקינה:

```
פה אחד 🟢  →  APPROVE, לוג קצר
רוב 🟢 + כמה 🟡  →  APPROVE עם תנאים מהסוכנים המותנים
```

---

## שלב 4 — Pattern Detector

אחרי כל החלטה — בדוק ב-log:
```
האם שאלה דומה הופיעה 3+ פעמים?
  כן → צור Linear issue: "בעיה ארכיטקטורלית חוזרת: [נושא]"
       זו לא שאלה — זה סימפטום
```

---

## פורמט ה-Log (כל החלטה)

```markdown
## [YYYY-MM-DD HH:MM] — Decision #N

**שאלה:** [ניסוח מדויק]
**סיווג:** TRIVIAL / COUNCIL / HUMAN
**Reversibility:** 🔄 / ⏳ / 🔒

**Blast Radius:**
- קבצים: [...]
- צרכנים: [...]
- סתירות עם עבר: [אין / פירוט]

**הצבעה:**
| סוכן | עמדה | Confidence | נימוקים | סיכון שפספסתי |
|------|------|-----------|---------|--------------|
| @impact | 🟢 | HIGH | ... | ... |
| @data | 🟡 | MEDIUM | ... | ... |
| @security | 🟢 | HIGH | ... | ... |
| @performance | 🟢 | LOW | ... | ... |
| @devil | 🔴 | HIGH | ... | ... |

**תוצאה:** APPROVE / BLOCK / HUMAN / DEADLOCK
**החלטה:** [מה בדיוק נעשה]
**תנאים:** [אם יש]
**Linear:** [comment על issue הפעיל / issue חדש אם pattern]
```

---

## TRIVIAL — מה מחליטים בלי מועצה

```
✅ שמות קבצים, תיקיות
✅ imports ו-exports
✅ naming conventions (camelCase, kebab-case)
✅ בחירה בין 2 פונקציות עם אותה תוצאה
✅ הוספת comment
✅ סדר fields בobject שלא נשמר ב-DB
✅ גרסת error message (נוסח)
✅ אחרת שלא מופיעה ב-Sacred Topics ואינה IRREVERSIBLE
```

**לוג TRIVIAL:** שורה אחת בלבד:
```
[HH:MM] TRIVIAL: [שאלה] → [החלטה]
```

---

## HUMAN Gate — מה להציג

כשמגיעים ל-HUMAN, **לא** לשאול בצורה פתוחה. להציג:

```
🛑 HUMAN REQUIRED

סיבה: [Sacred Topic / IRREVERSIBLE / 🔴 vote / Deadlock]

הרקע:
[Blast Radius מלא]

העמדות:
[הצבעת המועצה אם התקיימה]

השאלה הספציפית שצריך להחליט:
[שאלה אחת, ממוקדת, בינארית אם אפשר]

אפשרויות:
א. [פעולה ותוצאתה]
ב. [פעולה ותוצאתה]
```

---

## Command Approval Matrix — פקודות Bash ו-CLI

### ✅ מאושר אוטומטית — הרץ בלי לשאול

**קריאה בלבד (read-only):**
```bash
grep / find / ls / cat / head / tail / wc
git status / git diff / git log / git show
curl GET (תיעוד רשמי, APIs חיצוניים לקריאה)
```

**אימות קוד:**
```bash
pnpm typecheck / pnpm lint / pnpm build / pnpm test
pnpm storybook:build / pnpm analyze
tsc --noEmit
```

**פעולות פיתוח שגרתיות:**
```bash
mkdir / touch (יצירת קבצים/תיקיות בפרויקט)
git add <file> (קבצים ספציפיים, לא -A .)
git commit (לא --amend)
pnpm install / pnpm add <package> (תמיד בדוק bundle size אחרי)
```

**חקירה וניתוח:**
```bash
prisma format / prisma validate
EXPLAIN ANALYZE (read-only על DB)
```

---

### ⚠️ שאל לפני הרצה — משפיע על state

**Git שמשנה history או remote:**
```bash
git push          ← שאל תמיד
git pull          ← שאל (עלול להשפיע על עבודה בתהליך)
git checkout      ← שאל (מחליף branch)
git reset         ← שאל תמיד
git stash         ← שאל
git merge / rebase ← שאל תמיד
```

**מחיקה:**
```bash
rm / rmdir        ← שאל תמיד, הצג מה נמחק
```

**Prisma שמשנה DB:**
```bash
prisma migrate dev     ← שאל (יוצר migration)
prisma db push         ← שאל (מסוכן יותר מ-migrate)
prisma migrate reset   ← HUMAN (מוחק data!)
```

**התקנת dependencies עם impact גדול:**
```bash
pnpm add <package שגדול מ-50KB>  ← שאל + הצג גודל
```

---

### 🛑 HUMAN תמיד — לא מריץ בלי אישור מפורש

```bash
prisma migrate deploy     ← production DB
git push --force          ← מסוכן
git push origin main      ← direct to main
DROP TABLE / DELETE FROM  ← מחיקת data
rm -rf                    ← מחיקה רקורסיבית
curl POST עם credentials  ← שליחת מידע רגיש
gh pr create              ← PR לgithub
```

---

## מה לא לעשות

- אל תשאל את המשתמש על TRIVIAL
- אל תשאל "האם לחקור?", "האם ליצור git?", "האם להמשיך?" — עשה
- אל תשאל על פקודות מהרשימה ✅ — הרץ ישר
- אל תנסח שאלות למועצה עם הטיה ("האם X לא עדיף?") — ניסוח נייטרלי בלבד
- אל תסמוך על הסכמת כולם כראיה לאמת — זה Correlated Errors
- אל תדלג על @devil — Groupthink הורג מערכות
- אל תשתמש ב-LLM כמקור יחיד לעובדות גרסאות/APIs — בדוק תיעוד רשמי
- אל תתן APPROVE על 🔒 IRREVERSIBLE — תמיד HUMAN
