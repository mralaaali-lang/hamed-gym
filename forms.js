/* فورم حجز التمرينة → واتساب (زي المطلوب دلوقتي).
   التحقق من البيانات + فتح واتساب برسالة جاهزة. */
(function () {
  'use strict';

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

  function valid(d) {
    if (!d.name || d.name.length < 2) return 'اكتب اسمك الأول.';
    if ((d.phone || '').replace(/\D/g, '').length < 10) return 'رقم الموبايل مش مظبوط.';
    if (!d.time) return 'اختار الوقت المناسب ليك.';
    return null;
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'trialForm') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var data = {
      name: (form.querySelector('[name="name"]') || {}).value || '',
      phone: (form.querySelector('[name="phone"]') || {}).value || '',
      time: (form.querySelector('[name="time"]') || {}).value || '',
    };
    data.name = data.name.trim();
    data.phone = data.phone.trim();

    var err = valid(data);
    if (err) { setStatus(form, err, 'error'); return; }

    var msg = 'طلب تمرينة تجريبية — Hamed Gym\n'
      + 'الاسم: ' + data.name + '\n'
      + 'الموبايل: ' + data.phone + '\n'
      + 'الوقت المناسب: ' + data.time;

    setStatus(form, 'بنجهز رسالتك على واتساب...', 'loading');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
    setStatus(form, 'لو واتساب مفتحش، اضغط زر «كلّمنا واتساب» تحت.', 'ok');
  }, true);
})();
