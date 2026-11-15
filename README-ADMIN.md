# لوحة التحكم (Decap CMS) — دليل التشغيل

اللوحة على `/admin`، وبتعدّل ملف `content.json` مباشرة وتحفظه في GitHub، والاستضافة تنشر التعديل تلقائيًا.

## الملفات
| الملف | وظيفته |
|---|---|
| `admin/index.html` | صفحة اللوحة (تحمّل Decap CMS) |
| `admin/config.yml` | تعريف الحقول واللغة العربية |
| `content.json` | القيم اللي بتتعدّل (المصدر الوحيد للحقيقة) |
| `cms.js` | بيقرأ `content.json` ويحدّث النصوص في الصفحة وقت التحميل |

## خطوات الربط (مرة واحدة — ١٥ دقيقة)

### 1. ارفع المشروع على GitHub
```powershell
cd site-pixel
git init
git add .
git commit -m "Hamed Gym site"
git branch -M main
git remote add origin https://github.com/<user>/hamed-gym.git
git push -u origin main
```

### 2. اربطه بـ Netlify
- [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → اختار الريبو.
- Build command: **اتركه فاضي** · Publish directory: **`.`**
- Deploy.

### 3. فعّل الهوية والـ Gateway
- Site settings → **Identity** → Enable Identity.
- Identity → **Services → Git Gateway** → Enable.
- Identity → **Invite users** → اكتب إيميلك → هيوصلك لينك، اضغطه وحدد باسورد.

### 4. افتح اللوحة
`https://<your-site>.netlify.app/admin`

سجّل دخول → **محتوى الموقع → النصوص الأساسية** → عدّل → **Publish**.
كل حفظ = commit جديد في GitHub + نشر تلقائي (دقيقة تقريبًا).

> على Cloudflare Pages: الـ `git-gateway` مش متاح. لازم OAuth app على GitHub أو استخدام Netlify للوحة بس.

## إزاي تضيف حقل جديد

1. في `admin/config.yml` ضيف سطر:
   ```yaml
   - { name: trainer_name, label: "اسم المدرب", widget: string }
   ```
2. في `content.json` ضيف القيمة:
   ```json
   "trainer_name": "كابتن حامد"
   ```
3. في `cms.js` ضيف في `DEFAULTS`:
   ```js
   trainer_name: 'كابتن حامد'
   ```

القيمة لازم تطابق النص الموجود في HTML **بالحرف** — الكود بيلاقي النص ويستبدله.

## ملاحظات
- الصفحة فيها `<meta name="noindex">` — مش هتظهر في جوجل.
- التعديل بيمشي على النصوص. تغيير الصور (شعار/خلفية) بيتم من فولدر `assets/` لحد ما نضيف حقول صور.
- لو `content.json` مش موجود أو فاضي، الموقع بيشتغل بالنصوص الأصلية في HTML.
