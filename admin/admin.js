/* لوحة تحكم بسيطة: تقرأ وتكتب content.json عبر GitHub API. */
(function () {
  'use strict';

  var OWNER = 'mralaaali-lang';
  var REPO = 'hamed-gym';
  var BRANCH = 'main';
  var FILE = 'content.json';
  var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + FILE;
  var TOKEN_KEY = 'hg_admin_token';

  var FIELDS = [
    { id: 'hero_title_highlight', label: 'الهيرو — الجزء الأصفر', type: 'text' },
    { id: 'hero_text', label: 'الهيرو — النص التعريفي', type: 'textarea' },
    { id: 'phone_display', label: 'رقم التليفون (كما يظهر)', type: 'text' },
    { id: 'address', label: 'العنوان', type: 'text' },
    { id: 'hours', label: 'المواعيد', type: 'text' },
    { id: 'facilities_title', label: 'عنوان قسم الأقسام', type: 'text' },
    { id: 'gallery_title', label: 'عنوان قسم الصور', type: 'text' },
    { id: 'trainer_title', label: 'عنوان قسم المدرب', type: 'text' },
    { id: 'pricing_note', label: 'ملاحظة الأسعار', type: 'textarea' },
    { id: 'cta_title', label: 'عنوان فورم الحجز', type: 'text' },
    { id: 'cta_text', label: 'نص فورم الحجز', type: 'textarea' },
    { id: 'footer_note', label: 'وصف الفوتر', type: 'textarea' }
  ];

  var $ = function (id) { return document.getElementById(id); };
  var token = '';
  var sha = '';
  var original = {};

  function setStatus(el, text, kind) {
    el.textContent = text || '';
    el.className = 'status' + (kind ? ' ' + kind : '');
  }

  function apiFetch(url, options) {
    var opts = options || {};
    opts.headers = Object.assign({
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }, opts.headers || {});
    return fetch(url, opts).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 160)); });
      return r.json();
    });
  }

  function b64encode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function b64decode(b64) {
    var bin = atob(b64.replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function render(values) {
    var host = $('fields');
    host.innerHTML = '';
    FIELDS.forEach(function (f) {
      var wrap = document.createElement('div');
      wrap.className = 'field';
      var label = document.createElement('label');
      label.setAttribute('for', 'f_' + f.id);
      label.textContent = f.label;
      var input = document.createElement(f.type === 'textarea' ? 'textarea' : 'input');
      input.id = 'f_' + f.id;
      input.dataset.id = f.id;
      if (f.type !== 'textarea') input.type = 'text';
      input.value = values[f.id] || '';
      wrap.appendChild(label);
      wrap.appendChild(input);
      host.appendChild(wrap);
    });
  }

  function collect() {
    var out = {};
    FIELDS.forEach(function (f) {
      var el = $('f_' + f.id);
      if (el) out[f.id] = el.value;
    });
    return out;
  }

  function load() {
    setStatus($('authStatus'), 'بنقرأ المحتوى...');
    return apiFetch(API + '?ref=' + BRANCH)
      .then(function (data) {
        sha = data.sha;
        var parsed = JSON.parse(b64decode(data.content));
        original = parsed;
        render(parsed);
        $('authPanel').classList.add('hidden');
        $('editor').classList.remove('hidden');
        setStatus($('status'), '');
      })
      .catch(function (e) {
        setStatus($('authStatus'), 'مش قادر أقرأ الملف: ' + e.message, 'err');
      });
  }

  function save() {
    var values = collect();
    var body = {
      message: 'content: تحديث نصوص الموقع من لوحة التحكم',
      content: b64encode(JSON.stringify(values, null, 2)),
      sha: sha,
      branch: BRANCH
    };
    var btn = $('save');
    btn.disabled = true;
    setStatus($('status'), 'بنحفظ...');
    return apiFetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        sha = res.content.sha;
        original = values;
        setStatus($('status'), 'تم الحفظ ✅ — الموقع هينشر في خلال دقيقة.', 'ok');
      })
      .catch(function (e) {
        setStatus($('status'), 'فشل الحفظ: ' + e.message, 'err');
      })
      .then(function () { btn.disabled = false; });
  }

  function boot() {
    token = localStorage.getItem(TOKEN_KEY) || '';
    if (token) load();

    $('saveToken').addEventListener('click', function () {
      var v = $('token').value.trim();
      if (v.length < 20) { setStatus($('authStatus'), 'التوكن قصير — تأكد إنك نسخته كامل.', 'err'); return; }
      token = v;
      localStorage.setItem(TOKEN_KEY, token);
      load();
    });

    $('save').addEventListener('click', save);

    $('reset').addEventListener('click', function () {
      render(original);
      setStatus($('status'), 'رجّعنا القيم المحفوظة.', '');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
