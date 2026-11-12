/* Pause website behavior: mobile menu, free scam checker, pricing toggle, partner calculator, contact form. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  // ---------- Free "Is this a scam?" checker ----------
  // A rules-based demo of the warning signs the Pause app's AI looks for.
  const RULES = [
    { re: /\b(gift ?cards?|wire (the )?money|wire transfer|bitcoin|crypto(currency)?|zelle|cash ?app|western union|moneygram)\b/i, w: 3,
      why: 'It asks for a payment that is hard to undo, like gift cards, wires, crypto, or payment apps.' },
    { re: /\b(ssn|social security( number)?|medicare (number|card)|password|pin|verification code|one[- ]time code|routing number|account number)\b/i, w: 3,
      why: 'It asks for private details that a real company would never request this way.' },
    { re: /\b[a-z0-9-]*(sunpass|usps|ups|fedex|amazon|amzn|apple|paypal|bank|irs|toll|medicare)[a-z0-9]*-[a-z0-9-]+\.[a-z]{2,}\b|\b[a-z0-9-]+-(sunpass|usps|ups|fedex|amazon|paypal|irs|toll|tolls)[a-z0-9-]*\.[a-z]{2,}\b/i, w: 3,
      why: "The link imitates a real company's website but is not its real address." },
    { re: /\b[a-z0-9-]+\.(info|top|xyz|live|click|shop|icu|cc|buzz|rest|support)\b/i, w: 2,
      why: 'The link ends in a web address type that scammers use often.' },
    { re: /\b(within \d+ ?(hours?|hrs?|minutes?|mins?)|immediately|urgent(ly)?|final notice|act now|today only|suspended|locked|avoid (a |the )?(\$?\d+ )?(late )?fee)\b/i, w: 2,
      why: 'It rushes you. Pressure to act fast is the most common sign of a scam.' },
    { re: /\b(don'?t tell|do not tell|keep (this|it) (between us|secret)|secret)\b/i, w: 2,
      why: 'It asks you to keep it secret, which cuts out the people who could help.' },
    { re: /\b(you('ve| have)? won|prize|lottery|sweepstakes|claim your (refund|reward))\b/i, w: 2,
      why: 'It promises a prize or refund you were not expecting.' },
    { re: /\b(grandma|grandpa|abuela|abuelo|accident|bail|jail|arrested|hospital)\b/i, w: 2,
      why: 'It describes a family emergency. Ask for your family code word, then call the person directly.' },
    { re: /\b(irs|medicare|social security administration|sunpass|usps|fedex|amazon|apple|paypal|police|sheriff|court)\b/i, w: 1,
      why: 'It uses the name of a well-known company or agency, which scammers copy.' },
    { re: /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|info|co|top|xyz|live|click|shop|io|me|us)\b)/i, w: 1,
      why: 'It asks you to open a link. Type the real address yourself instead.' },
  ];

  const EXAMPLES = {
    toll: 'SunPass: You have an unpaid toll of $4.15. Pay within 24 hrs to avoid a $50 late fee: sunpass-tolls-pay.info',
    family: "Grandma it's me, I lost my phone so this is my new number. I was in an accident and need $900 for bail. Can you get gift cards? Please don't tell Mom.",
    doctor: "Hello Rosa, this is a reminder of your appointment with Dr. Alvarez on Thursday at 10:30 AM. Reply C to confirm.",
  };

  const form = $('#checker-form');
  if (form) {
    const box = $('#checker-text'), out = $('#checker-result');
    $$('[data-example]').forEach(b => b.addEventListener('click', () => { box.value = EXAMPLES[b.dataset.example]; box.focus(); }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = box.value.trim();
      if (!text) { box.focus(); return; }
      const hits = RULES.filter(r => r.re.test(text));
      const score = hits.reduce((s, r) => s + r.w, 0);
      const level = score >= 4 ? 'scam' : score >= 2 ? 'caution' : 'safe';
      const word = { scam: 'Likely a scam.', caution: 'Be careful.', safe: 'No warning signs found.' }[level];
      const next = {
        scam: "Don't tap, pay, or reply. If it names a company you use, contact them at a number or website you already trust.",
        caution: 'Slow down before you act. Check with someone you trust, or contact the company directly.',
        safe: "We didn't find the common warning signs. If something still feels off, trust that feeling and check with someone you trust.",
      }[level];
      out.className = `result show ${level}`;
      out.innerHTML = `<div class="eyebrow">Our read</div><div class="word">${word}</div>
        ${hits.length ? `<ol>${hits.slice(0, 4).map(h => `<li><span>${h.why}</span></li>`).join('')}</ol>` : ''}
        <p style="margin-top:18px"><b>What to do:</b> ${next}</p>
        <p class="fine">This free checker looks for common warning signs. The Pause app adds AI and live Scam Radar reports. <a href="app/">See the app</a>.</p>`;
    });
    // ?try=toll|family|doctor pre-fills and runs an example (used for demos and screenshots)
    const demo = new URLSearchParams(location.search).get('try');
    if (EXAMPLES[demo]) { box.value = EXAMPLES[demo]; form.requestSubmit(); $('#checker').scrollIntoView(); }
  }

  // ---------- Pricing toggle ----------
  $$('[data-billing]').forEach(btn => btn.addEventListener('click', () => {
    const yearly = btn.dataset.billing === 'year';
    $$('[data-billing]').forEach(b => b.classList.toggle('on', b === btn));
    $$('[data-month]').forEach(el => { el.textContent = yearly ? el.dataset.year : el.dataset.month; });
    $$('[data-per-month]').forEach(el => { el.textContent = yearly ? el.dataset.perYear : el.dataset.perMonth; });
  }));

  // ---------- Partner calculator ($1.50 per enrolled member per month) ----------
  const range = $('#members');
  if (range) {
    const fmt = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const update = () => {
      const m = Number(range.value);
      $('#members-out').textContent = m.toLocaleString('en-US');
      $('#monthly-out').textContent = fmt(m * 1.5);
      $('#annual-out').textContent = fmt(m * 1.5 * 12);
    };
    range.addEventListener('input', update); update();
  }

  // ---------- Contact form: opens the visitor's email app, addressed to us ----------
  const cf = $('#contact-form');
  if (cf) {
    const topic = new URLSearchParams(location.search).get('topic');
    if (topic && cf.topic) cf.topic.value = topic;
    cf.addEventListener('submit', e => {
      e.preventDefault();
      const to = cf.dataset.to;
      const subject = `[${cf.topic.value}] Message from ${cf.name.value}`;
      const body = `${cf.message.value}\n\n${cf.name.value}\n${cf.email.value}`;
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      $('#contact-note').hidden = false;
    });
  }
})();
