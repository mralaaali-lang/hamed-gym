/* يقرأ content.json (اللي بتعدّله لوحة /admin) ويحدّث النصوص في الصفحة.
   كل قيمة هنا لازم تطابق النص الأصلي في HTML بالحرف. */
(function () {
  'use strict';

  var DEFAULTS = {
    rating_value: '4.2',
    rating_count: '54',
    hero_title_highlight: 'وقت ما انت فاضي',
    hero_text: 'Hamed Gym في قلب حدائق المعادي — مفتوح 24 ساعة، 7 أيام في الأسبوع. قاعة أوزان ومنطقة كارديو، وفي مدرب يساعدك من أول يوم.',
    phone_display: '010 96100820',
    address: 'X7C5+238، عزبة نافع، قسم المعادي، محافظة القاهرة، 4223122',
    hours: 'مفتوح 24 ساعة — 7 أيام في الأسبوع',
    facilities_title: 'الأقسام المتاحة في الجيم',
    gallery_title: 'صور حقيقية من Hamed Gym',
    trainer_title: 'تعرّف على المدرب',
    pricing_note: 'الأسعار النهائية بتتأكد بالتليفون — كلّمنا على 010 96100820 ونقولك كل التفاصيل.',
    cta_title: 'احجز تمرينة تجريبية',
    cta_text: 'سيب اسمك ورقمك والوقت اللي يريحك، وهنكلمك نحدد معاك ميعاد أول تمرينة. الجيم فاتح 24 ساعة، 7 أيام في الأسبوع.',
    footer_note: 'صالة رياضة في عزبة نافع، قسم المعادي — قاعة أوزان ومنطقة كارديو، ومفتوحة 24 ساعة طول الأسبوع.'
  };

  function apply(values) {
    var pairs = [];
    Object.keys(DEFAULTS).forEach(function (id) {
      var value = values && typeof values[id] === 'string' ? values[id].trim() : '';
      if (!value || value === DEFAULTS[id]) return;
      pairs.push([DEFAULTS[id], value]);
    });
    if (!pairs.length) return;

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      var raw = node.nodeValue;
      var text = raw.trim();
      if (!text) return;
      for (var i = 0; i < pairs.length; i++) {
        if (text === pairs[i][0]) { node.nodeValue = raw.replace(pairs[i][0], pairs[i][1]); return; }
        if (text.indexOf(pairs[i][0]) !== -1 && pairs[i][0].length > 8) {
          node.nodeValue = raw.split(pairs[i][0]).join(pairs[i][1]);
          return;
        }
      }
    });

    // تحديث روابط التليفون لو الرقم اتغير
    var phone = values && values.phone_display;
    if (phone) {
      var digits = phone.replace(/\D/g, '');
      if (digits.length >= 10) {
        var intl = digits.charAt(0) === '0' ? '20' + digits.slice(1) : digits;
        document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
          a.setAttribute('href', 'tel:+' + intl);
        });
        document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
          a.setAttribute('href', a.getAttribute('href').replace(/wa\.me\/\d+/, 'wa.me/' + intl));
        });
      }
    }
  }

  function boot() {
    fetch('content.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) apply(data); })
      .catch(function () { /* الملف مش موجود — نسيب النصوص الأصلية */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
