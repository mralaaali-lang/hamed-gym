# لوحة التحكم — Hamed Gym

لوحة بسيطة على `/admin` بتعدّل `content.json` مباشرة على GitHub، والموقع (GitHub Pages) بينشر التعديل تلقائيًا.

## ليه مش Decap؟
Netlify وقّفت **Git Gateway** (الخدمة اللي Decap بيعتمد عليها للتسجيل) — الـ API بقى بيرجّع 404، فالمسار ده اتقفل. عشان كده اللوحة دي بتتكلم مع GitHub API مباشرة، من غير أي خدمة وسيطة.

## التشغيل (مرة واحدة)
1. افتح `https://mralaaali-lang.github.io/hamed-gym/admin/`
2. اتبع الخطوات المكتوبة في الصفحة:
   - GitHub → [New fine-grained token](https://github.com/settings/personal-access-tokens/new)
   - Repository access: **Only select repositories** → `hamed-gym`
   - Permissions → **Contents: Read and write**
   - Generate وانسخ التوكن والصقه في اللوحة.
3. التوكن بيتخزن في متصفحك بس (`localStorage`)، وتقدر تلغيه من GitHub في أي وقت.

## إزاي بتشتغل
- `admin/index.html` — الواجهة.
- `admin/admin.js` — بتقرأ `content.json` من GitHub API (مع `sha`)، وبتعرض ١٢ حقل، والحفظ بيعمل `PUT` (commit على `main`).
- `cms.js` — في الموقع نفسه، بيقرأ `content.json` ويطبّق القيم على النصوص وقت التحميل.
- القيمة لازم تطابق النص الأصلي في `index.html` **بالحرف** (الكود بيلاقي النص ويستبدله).

## إضافة حقل جديد
1. `admin/admin.js` → ضيف عنصر في `FIELDS`.
2. `site-pixel/cms.js` → ضيف نفس المفتاح في `DEFAULTS` بالقيمة الأصلية من HTML.
3. `site-pixel/content.json` → ضيف القيمة.

## ملاحظات
- الحفظ بيعمل commit حقيقي؛ لو حصل خطأ في الكتابة، ارجع من GitHub → Commits → Revert.
- الصفحة `noindex` — مش هتظهر في جوجل.
- الصور بتتغير من فولدر `assets/` حاليًا (مش من اللوحة).
