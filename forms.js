/* فورم حجز التمرينة — نفس سلوك Site123:
   يبعت البيانات، يخفي الفورم، ويعرض رسالة "تم استلام طلبك".
   الرسائل بتوصلك على الإيميل (FormSubmit) — من غير أي حساب أو سيرفر. */
(function () {
  'use strict';

  /* ====== إعدادات الإرسال ======
     اختار واحد:
     1) Web3Forms (الأسهل): افتح web3forms.com → حط إيميلك → هيوصلك مفتاح → الصقه تحت.
     2) Formspree: https://formspree.io/f/xxxxx → حط الـ ID.
     3) سيبهم فاضيين: هيحاول FormSubmit على الإيميل، ولو فشل بيفتح واتساب. */
  var WEB3FORMS_KEY = '';
  var FORMSPREE_ID = '';
  var EMAIL = 'mr.alaaali@gmail.com';
  var WA = '201096100820';

  function endpoint() {
    if (WEB3FORMS_KEY) return { url: 'https://api.web3forms.com/submit', kind: 'web3' };
    if (FORMSPREE_ID) return { url: 'https://formspree.io/f/' + FORMSPREE_ID, kind: 'formspree' };
    return { url: 'https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL), kind: 'formsubmit' };
  }

  function payload(kind, data) {
    if (kind === 'web3') {
      return {
        access_key: WEB3FORMS_KEY,
        subject: data._subject,
        from_name: 'Hamed Gym',
        name: data.name,
        phone: data.phone,
        time: data.time,
        source: data.source,
      };
    }
    return data;
  }

  function isOk(kind, res) {
    if (!res) return false;
    if (kind === 'web3') return res.success === true;
    if (kind === 'formspree') return res.ok !== false;
    return res.success === 'true' || res.success === true;
  }

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

    var ep = endpoint();

    function send() {
      return fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload(ep.kind, data)),
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (!isOk(ep.kind, res)) throw new Error('send failed');
          return res;
        });
    }

    send()
      .then(function () { showSuccess(form); })
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
