(() => {
  // The artist's Signal contact link (the only place it is set).
  const SIGNAL_URL = 'https://signal.me/#eu/XoJKzqusmKxHkSmdQBsGkTcChj3USt-m9j70B_EzxGWn_Fz4QVdPm4emWMV2n8cM';

  // Web3Forms access key: emails every consultation request to the artist.
  // Get one free at https://web3forms.com: enter Sickinkstudioss@gmail.com and the key arrives in that inbox.
  // The key is meant to be public: it can only deliver to that one inbox.
  const ACCESS_KEY = '26609654-d2db-40b3-bd74-679f06c8ae21';

  const $ = (s, r = document) => r.querySelector(s);

  document.querySelectorAll('a.signal').forEach(a => { a.href = SIGNAL_URL; });

  // Mobile menu
  const menu = $('.menu'), nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  // Gallery lightbox: opens for any .tile that contains a real <img>
  const box = $('#lightbox'), big = $('img', box);
  document.addEventListener('click', e => {
    const img = e.target.closest('.tile img');
    if (!img || !box.showModal) return;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    box.showModal();
  });
  box.addEventListener('click', e => {
    if (e.target === box || e.target.closest('.x')) box.close();
  });

  // Consultation form
  const form = $('#form'), intro = $('#intro'), result = $('#result'), summary = $('#summary'), msg = $('#copy-msg');
  const sent = $('#sent'), send = $('#send'), formErr = $('#form-err');
  const sendLabel = send.textContent;
  let sending = false;

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const isPhone = v => /^\+?[\d\s().-]{7,20}$/.test(v) && v.replace(/\D/g, '').length >= 7;
  const rules = {
    name: v => v.trim() ? '' : 'Enter your name.',
    contact: v => (isEmail(v.trim()) || isPhone(v.trim())) ? '' : 'Enter an email address or phone number so the artist can reply.',
    idea: v => v.trim().length >= 15 ? '' : 'Describe your idea in at least 15 characters.',
    placement: v => v.trim() ? '' : 'Say where on your body you want the tattoo.'
  };
  const check = id => {
    const el = form.elements[id], text = rules[id](el.value);
    $('#e-' + id).textContent = text;
    el.setAttribute('aria-invalid', text ? 'true' : 'false');
    return text ? el : null;
  };
  const scrollTo = el => el.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });

  form.addEventListener('input', e => {
    if (rules[e.target.id] && e.target.getAttribute('aria-invalid') === 'true') check(e.target.id);
  });

  const collect = () => {
    const v = id => form.elements[id].value.trim();
    return {
      name: v('name'), contact: v('contact'), idea: v('idea'), style: v('style'),
      placement: v('placement'), size: v('size'), budget: v('budget'), dates: v('dates')
    };
  };

  // The same text goes in the email and, if email fails, in the Signal fallback
  const buildSummary = (d, forSignal) => {
    const line = (label, val) => val ? `${label}: ${val}` : '';
    return [
      'Hi, I would like a tattoo consultation.',
      line('Name', d.name),
      line('Contact', d.contact),
      line('Idea', d.idea),
      line('Style', d.style),
      line('Placement', d.placement),
      line('Size', d.size),
      line('Budget', d.budget),
      line('Availability', d.dates),
      forSignal ? 'I will send reference images here.' : 'Reference images: to be sent on Signal.'
    ].filter(Boolean).join('\n');
  };

  // Emails the request through Web3Forms. Resolves true only if it was delivered.
  async function sendEmail(d) {
    if (!ACCESS_KEY || ACCESS_KEY === 'PASTE_ACCESS_KEY_HERE') {
      console.warn('Set ACCESS_KEY at the top of script.js (free key from web3forms.com).');
      return false;
    }
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `New consultation request from ${d.name}`,
          from_name: 'Sick Ink website',
          name: d.name,
          // A real email address becomes the Reply-To, so the artist can answer straight from the inbox
          ...(isEmail(d.contact) ? { email: d.contact } : {}),
          message: buildSummary(d, false)
        }),
        signal: ctrl.signal
      });
      const json = await res.json().catch(() => ({}));
      return res.ok && json.success === true;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  function setSending(on) {
    sending = on;
    send.disabled = on;
    send.textContent = on ? 'Sending…' : sendLabel;
    form.setAttribute('aria-busy', String(on));
  }

  function showSent(d) {
    const first = d.name.split(/\s+/)[0];
    $('#sent-msg').textContent = `Thanks, ${first}. The artist has your idea and will reply using ${d.contact}.`;
    const recap = $('#recap');
    recap.replaceChildren();
    [['Idea', d.idea], ['Style', d.style], ['Placement', d.placement], ['Size', d.size],
     ['Budget', d.budget], ['Availability', d.dates]].forEach(([label, val]) => {
      if (!val) return;
      const wrap = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = val;
      wrap.append(dt, dd);
      recap.append(wrap);
    });
    form.hidden = true;
    intro.hidden = true;
    result.hidden = true;
    sent.hidden = false;
    scrollTo(sent);
    $('#sent-h').focus({ preventScroll: true });
  }

  function showFallback(d) {
    formErr.textContent = 'Your request didn’t send. Check your connection and try again, or send it on Signal instead.';
    summary.value = buildSummary(d, true);
    msg.textContent = '';
    result.hidden = false;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    const bad = Object.keys(rules).map(check).filter(Boolean);
    if (bad.length) { bad[0].focus(); return; }

    formErr.textContent = '';
    const data = collect();
    // Hidden trap field: people never see it, bots fill it. Look successful, send nothing.
    if (form.elements.website.value) { showSent(data); return; }

    setSending(true);
    const ok = await sendEmail(data);
    setSending(false);
    if (ok) showSent(data); else showFallback(data);
  });

  // Start a fresh request
  $('#again').addEventListener('click', () => {
    form.reset();
    Object.keys(rules).forEach(id => {
      $('#e-' + id).textContent = '';
      form.elements[id].setAttribute('aria-invalid', 'false');
    });
    formErr.textContent = '';
    sent.hidden = true;
    result.hidden = true;
    form.hidden = false;
    intro.hidden = false;
    scrollTo($('#consult'));
    form.elements.name.focus({ preventScroll: true });
  });

  // Signal fallback: copy with a fallback for browsers that block the clipboard API
  async function copyText() {
    try {
      await navigator.clipboard.writeText(summary.value);
      return true;
    } catch {
      summary.focus();
      summary.select();
      summary.setSelectionRange(0, summary.value.length);
      try { return document.execCommand('copy'); } catch { return false; }
    }
  }
  $('#copy').addEventListener('click', async () => {
    msg.textContent = (await copyText())
      ? 'Copied. Now open Signal and paste it.'
      : 'Copying didn’t work. The text is selected: press and hold it, choose Copy, then paste it in Signal.';
  });
})();
