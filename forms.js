/* Trial-booking form → replaces the Site123 backend.
 *
 * Option A (default): opens WhatsApp with the request pre-filled — works instantly.
 * Option B: set HG_FORMS_ENDPOINT to a Formspree / Netlify Forms / Apps Script URL
 *           and submissions arrive as "طلبات" you can export as CSV.
 */
window.HG_FORMS_ENDPOINT = ''; // مثال: https://formspree.io/f/xxxxxxxx

(function () {
  'use strict';

  var WA = '201096100820';

  function statusEl(form) {
    return form.querySelector('[role="status"]') || document.getElementById('trialFormStatus');
  }

  function setStatus(form, text, kind) {
    var el = statusEl(form);
    if (!el) return;
    el.textContent = text;
    el.dataset.kind = kind || '';
    el.style.color = kind === 'error' ? '#ffb4b4' : '';
  }

  function collect(form) {
    var out = {};
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (!f.name) return;
      out[f.name] = (f.value || '').trim();
    });
    out.source = location.pathname;
    out.sentAt = new Date().toISOString();
    return out;
  }

  function valid(data) {
    if (!data.name || data.name.length < 2) return 'اكتب اسمك الأول.';
    var digits = (data.phone || '').replace(/\D/g, '');
    if (digits.length < 10) return 'رقم الموبايل مش مظبوط.';
    if (!data.time) return 'اختار الوقت المناسب ليك.';
    return null;
  }

  function waText(data) {
    return 'طلب تمرينة تجريبية — Hamed Gym\n'
      + 'الاسم: ' + data.name + '\n'
      + 'الموبايل: ' + data.phone + '\n'
      + 'الوقت المناسب: ' + data.time + '\n'
      + 'الصفحة: ' + data.source;
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'trialForm') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var data = collect(form);
    var err = valid(data);
    if (err) { setStatus(form, err, 'error'); return; }

    var endpoint = window.HG_FORMS_ENDPOINT;

    if (endpoint) {
      setStatus(form, 'بنبعت طلبك...', 'loading');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          form.reset();
          setStatus(form, 'تم استلام طلبك — هنكلمك في أقرب وقت. 💪', 'ok');
        })
        .catch(function () {
          setStatus(form, 'حصلت مشكلة في الإرسال — فتحنالك واتساب بدل ما الطلب يضيع.', 'error');
          window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(data)), '_blank');
        });
      return;
    }

    setStatus(form, 'بنجهز رسالتك على واتساب...', 'loading');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(data)), '_blank');
    setStatus(form, 'لو واتساب مفتحش، اضغط زر «كلّمنا واتساب».', 'ok');
  }, true);
})();
