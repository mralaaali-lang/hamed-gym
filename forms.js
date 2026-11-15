/* فورم حجز التمرينة — نفس سلوك Site123:
   يبعت البيانات، يخفي الفورم، ويعرض رسالة "تم استلام طلبك".
   الرسائل بتوصلك على الإيميل (FormSubmit) — من غير أي حساب أو سيرفر. */
(function () {
  'use strict';

  /* غيّر الإيميل من هنا لو حبيت */
  var EMAIL = 'mr.alaaali@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL);
  var WA = '201096100820';

  function statusEl(form) {
    return form.querySelector('[role="status"]') || document.getElementById('trialFormStatus');
  }

  function setStatus(form, text, kind) {
    var el = statusEl(form);
    if (!el) return;
    el.textContent = text || '';
    el.dataset.kind = kind || '';
    el.style.color = kind === 'error' ? '#ffb4b4' : '';
  }

  function collect(form) {
    var out = {};
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (!f.name) return;
      out[f.name] = (f.value || '').trim();
    });
    out._subject = 'طلب تمرينة تجريبية — Hamed Gym';
    out._template = 'table';
    out.source = location.href;
    out.sentAt = new Date().toISOString();
    return out;
  }

  function valid(d) {
    if (!d.name || d.name.length < 2) return 'اكتب اسمك الأول.';
    if ((d.phone || '').replace(/\D/g, '').length < 10) return 'رقم الموبايل مش مظبوط.';
    if (!d.time) return 'اختار الوقت المناسب ليك.';
    return null;
  }

  function showSuccess(form) {
    var success = document.getElementById('trialSuccess');
    var text = document.getElementById('trialSuccessText');
    if (text && form.querySelector('[name="name"]')) {
      var name = form.querySelector('[name="name"]').value.trim();
      text.textContent = 'شكرًا ' + name + '! استلمنا بياناتك وهنكلمك في أقرب وقت نأكد معاك ميعاد تمرينتك التجريبية.';
    }
    form.hidden = true;
    form.style.display = 'none';
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function whatsappFallback(d) {
    var msg = 'طلب تمرينة تجريبية — Hamed Gym\nالاسم: ' + d.name + '\nالموبايل: ' + d.phone + '\nالوقت: ' + d.time;
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'trialForm') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var data = collect(form);
    var err = valid(data);
    if (err) { setStatus(form, err, 'error'); return; }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    setStatus(form, 'بنبعت طلبك...', 'loading');

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        var ok = res && (res.success === 'true' || res.success === true);
        if (!ok) throw new Error((res && res.message) || 'send failed');
        showSuccess(form);
      })
      .catch(function () {
        if (btn) btn.disabled = false;
        var link = whatsappFallback(data);
        var el = statusEl(form);
        if (el) {
          el.innerHTML = 'الإرسال ماعندوش نتيجة — <a href="' + link + '" target="_blank" rel="noopener" style="color:#ffd400;font-weight:800">ابعت الطلب على واتساب</a> بدل ما يضيع.';
          el.dataset.kind = 'error';
        }
      });
  }, true);
})();
