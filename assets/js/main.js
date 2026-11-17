/* =========================================================
   Smile Umzug – main.js (shared across all pages)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const html = document.documentElement, body = document.body;
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- 3D BOXES (any .stack[data-boxes]) ---------- */
  const BOX_SETS = {
    hero: [
      {w:230,h:160,d:190,x:0,y:0,z:0,r:0,label:'<b>●</b> Wohnzimmer'},
      {w:190,h:120,d:160,x:10,y:-140,z:6,r:12,label:'<b>●</b> Küche'},
      {w:130,h:100,d:120,x:-6,y:-250,z:0,r:-8,cls:'box--red float',smile:true},
      {w:150,h:110,d:140,x:-250,y:25,z:30,r:-14,label:'<b>●</b> Bücher'},
      {w:110,h:80,d:100,x:200,y:40,z:150,r:20,label:'<b>!</b> Fragile'}
    ],
    self: [
      {w:200,h:140,d:170,x:0,y:0,z:0,r:0,label:'<b>●</b> Offen'},
      {w:160,h:110,d:140,x:-200,y:15,z:20,r:-10,label:'<b>●</b> Kleider'},
      {w:120,h:90,d:110,x:20,y:-125,z:0,r:14,cls:'box--red float',smile:true}
    ],
    team: [
      {w:220,h:150,d:180,x:0,y:0,z:0,r:0,label:'<b>●</b> Geschirr'},
      {w:190,h:120,d:160,x:4,y:-135,z:4,r:-6,label:'<b>●</b> Bücher'},
      {w:160,h:100,d:140,x:-8,y:-245,z:0,r:9,label:'<b>!</b> Fragile'},
      {w:120,h:90,d:110,x:4,y:-340,z:0,r:-12,cls:'box--red float',smile:true},
      {w:150,h:110,d:140,x:-240,y:20,z:40,r:-14,label:'<b>●</b> Bad'},
      {w:140,h:100,d:130,x:230,y:25,z:60,r:16,label:'<b>●</b> Büro'}
    ]
  };
  const arrows = '<span class="arrows"><svg width="10" height="14" viewBox="0 0 10 14"><path d="M5 1v12M1 5l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><svg width="10" height="14" viewBox="0 0 10 14"><path d="M5 1v12M1 5l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>';
  const buildBoxes = (stack, set) => {
    stack.innerHTML = '';
    (BOX_SETS[set] || []).forEach(b => {
      const el = document.createElement('div');
      el.className = 'box ' + (b.cls || '');
      el.style.cssText = `--w:${b.w}px;--h:${b.h}px;--d:${b.d}px;transform:translate3d(${b.x}px,${b.y}px,${b.z}px) rotateY(${b.r}deg)`;
      const front = b.smile
        ? `<div class="face f-front"><div class="smile"><svg viewBox="0 0 48 48"><use href="#i-smile"/></svg></div></div>`
        : `<div class="face f-front"><span class="lbl">${b.label}</span>${arrows}</div>`;
      el.innerHTML = front + ['back','right','left','top','bottom'].map(f => `<div class="face f-${f}"></div>`).join('');
      stack.appendChild(el);
    });
  };
  $$('.stack[data-boxes]').forEach(s => buildBoxes(s, s.dataset.boxes));
  const heroStack = $('#stack');
  if (heroStack) heroStack.style.marginTop = '120px';

  /* ---------- REGIONS (home) ---------- */
  const row1 = $('#row1'), row2 = $('#row2');
  if (row1 && row2) {
    const towns = ['Winterthur','Uster','Wetzikon','Dietikon','Dübendorf','Bülach','Kloten','Wallisellen','Opfikon','Schlieren','Urdorf','Horgen','Wädenswil','Adliswil','Illnau-Effretikon'];
    const mk = list => list.map(n => `<a href="#regionen">${n}</a>`).join('');
    const a = towns.slice(0, 8), b = towns.slice(7);
    row1.innerHTML = mk(a) + mk(a); row2.innerHTML = mk(b) + mk(b);
  }

  /* ---------- GIANT FOOTER WORD ---------- */
  const giant = $('#giant');
  if (giant) {
    giant.innerHTML = 'SMILE UMZUG'.split('').map(c => c === ' ' ? '<span style="width:.22em"></span>' : `<span>${c}</span>`).join('');
    const gs = $$('span', giant);
    giant.addEventListener('mousemove', e => gs.forEach(s => {
      const r = s.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
      s.style.transform = `translateY(${-Math.max(0, 1 - d / 260) * 40}px)`;
    }));
    giant.addEventListener('mouseleave', () => gs.forEach(s => s.style.transform = ''));
  }
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- SPLIT TEXT ---------- */
  const splitWords = (el, cls, inner) => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = cls;
            if (inner) { const wi = document.createElement('span'); wi.className = inner; wi.textContent = part; w.appendChild(wi); }
            else w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches('svg')) walk(n);
      });
    };
    walk(el);
  };
  $$('[data-split]').forEach(el => {
    splitWords(el, 'w', 'wi');
    $$('.wi', el).forEach((wi, i) => wi.style.transitionDelay = (i * 0.05) + 's');
  });
  const hlEls = $$('[data-highlight]');
  hlEls.forEach(el => splitWords(el, 'hw'));

  /* ---------- COUNTERS ---------- */
  const counted = new WeakSet();
  const countUp = el => {
    if (counted.has(el)) return; counted.add(el);
    const target = +el.dataset.count, t0 = performance.now(), d = 1800;
    const step = now => {
      const t = clamp((now - t0) / d, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- READY ---------- */
  const goReady = () => {
    body.classList.remove('is-loading');
    setTimeout(() => {
      body.classList.add('ready');
      $$('.hero__stats [data-count]').forEach(countUp);
    }, 200);
  };

  /* ---------- PRELOADER / PAGE TRANSITION ---------- */
  const pt = $('#pt'), loader = $('#loader');
  const fromNav = html.classList.contains('pt-in');
  const firstVisit = !ss.get('visited');
  const revealPage = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      html.classList.remove('pt-in');
      pt.classList.add('reveal');
      goReady();
      setTimeout(() => pt.classList.remove('reveal'), 1100);
    }));
  };
  if (fromNav || !firstVisit || !loader) {
    if (loader) loader.remove();
    ss.del('pt');
    revealPage();
  } else {
    const num = $('#loadNum'), bar = $('#loadBar');
    const start = performance.now(), dur = reduce ? 200 : 1800;
    const tick = now => {
      const t = clamp((now - start) / dur, 0, 1);
      const p = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      num.textContent = p; bar.style.transform = `scaleX(${p / 100})`;
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(() => {
        ss.set('visited', '1');
        loader.classList.add('done');
        goReady();
        setTimeout(() => loader.remove(), 1300);
      }, 250);
    };
    requestAnimationFrame(tick);
  }
  // Seiten-Namen für die Übergangs-Animation
  const PAGE_NAMES = {
    'index.html': ['Startseite', 'Smile <span class="serif">Umzug</span>'],
    'privatumzug.html': ['Leistung', 'Privat<span class="serif">umzug</span>'],
    'ueber-uns.html': ['Das sind wir', 'Über <span class="serif">uns</span>'],
    'offerte.html': ['In 3 Schritten', '<span class="serif">Offerte</span>'],
    'kontakt.html': ['Schreiben Sie uns', 'Kon<span class="serif">takt</span>']
  };
  const ptLabel = $('#ptLabel');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(tel|mailto|https?):/.test(href)) return;
    const [file, hash] = href.split('#');
    const current = location.pathname.split('/').pop() || 'index.html';
    if (file === current || file === '') {
      if (hash) { e.preventDefault(); const t = document.getElementById(hash); if (t) t.scrollIntoView({behavior: 'smooth'}); body.classList.remove('menu-open'); }
      return;
    }
    if (!PAGE_NAMES[file]) return;
    e.preventDefault();
    body.classList.remove('menu-open');
    const [sm, big] = PAGE_NAMES[file];
    ptLabel.innerHTML = `<small>${sm}</small><span>${big}</span>`;
    pt.classList.add('cover');
    ss.set('pt', '1');
    setTimeout(() => { location.href = href; }, reduce ? 50 : 900);
  });
  addEventListener('pageshow', e => { if (e.persisted) { pt.classList.remove('cover'); html.classList.remove('pt-in'); } });

  /* ---------- REVEAL ON SCROLL ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -8% 0px' });
  $$('[data-split],[data-reveal],.meter').forEach(el => io.observe(el));

  /* ---------- CURSOR ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth > 900;
  const blob = $('#cBlob'), cdot = $('#cDot'), clabel = $('#cLabel'), clabelTxt = $('#cLabelTxt');
  const trail = $('#cTrail'), tctx = trail.getContext('2d');
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, idle = 99, press = 1, ps = 1;
  const pts = Array.from({length: 22}, () => ({x: mx, y: my}));
  const sizeTrail = () => { const d = devicePixelRatio || 1; trail.width = innerWidth * d; trail.height = innerHeight * d; tctx.setTransform(d,0,0,d,0,0); };
  if (fine) {
    html.classList.add('has-cursor');
    sizeTrail(); addEventListener('resize', sizeTrail);
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; idle = 0; cdot.style.transform = `translate(${mx}px,${my}px)`; });
    document.addEventListener('mouseleave', () => blob.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => blob.classList.remove('is-hidden'));
    addEventListener('mousedown', e => {
      const r = document.createElement('span'); r.className = 'c-ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      body.appendChild(r); setTimeout(() => r.remove(), 800);
          press = .7;
    });
    addEventListener('mouseup', () => press = 1);
    const setState = (cls, label) => {
      blob.classList.remove('is-link', 'is-text', 'is-label');
      if (cls) blob.classList.add(cls);
      if (label) { clabelTxt.textContent = label; clabel.classList.add('show'); } else clabel.classList.remove('show');
    };
    document.addEventListener('mouseover', e => {
      const t = e.target;
      const lab = t.closest('[data-cursor]');
      if (lab) return setState('is-label', lab.dataset.cursor);
      if (t.closest('a,button,label,input,textarea,select,.xcard')) return setState('is-link');
      if (t.closest('h1,h2,.svc__t,.footer__giant,.region-row,.step__n,.scard h3,.vrow h3,.hl-text')) return setState('is-text');
      setState(null);
    });
  }
  const drawCursor = () => {
    if (!fine) return;
    cx = lerp(cx, mx, .18); cy = lerp(cy, my, .18);
    ps = lerp(ps, press, .25);
    blob.style.transform = `translate(${cx}px,${cy}px) scale(${ps})`;
    clabel.style.left = cx + 'px'; clabel.style.top = cy + 'px';
    pts[0].x = lerp(pts[0].x, mx, .5); pts[0].y = lerp(pts[0].y, my, .5);
    for (let i = 1; i < pts.length; i++) { pts[i].x = lerp(pts[i].x, pts[i-1].x, .42); pts[i].y = lerp(pts[i].y, pts[i-1].y, .42); }
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    idle++;
    const fade = clamp(1 - (idle - 20) / 30, 0, 1);
    if (fade > 0) {
      tctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const k = 1 - i / pts.length;
        tctx.beginPath();
        tctx.moveTo(pts[i-1].x, pts[i-1].y); tctx.lineTo(pts[i].x, pts[i].y);
        tctx.strokeStyle = `rgba(227,52,42,${(k * .85 * fade).toFixed(3)})`;
        tctx.lineWidth = k * 7;
        tctx.stroke();
      }
    }
  };

  /* ---------- MAGNETIC ---------- */
  if (!isTouch) $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * .25}px,${y * .35}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  /* ---------- SERVICE HOVER CARD (home) ---------- */
  const sf = $('#svcFloat'), sfi = $('#svcFloatInner'), svcList = $('#svcList');
  let fx = 0, fy = 0;
  if (sf && svcList) {
    const svcs = $$('.svc', svcList);
    sfi.innerHTML = svcs.map(s => `<div class="svc-float__card" style="background:${s.dataset.color}"><svg viewBox="0 0 48 48"><use href="#${s.dataset.icon}"/></svg><b>${s.dataset.label}</b></div>`).join('');
    svcs.forEach((s, i) => s.addEventListener('mouseenter', () => { sf.classList.add('show'); sfi.style.transform = `translateY(${-i * 360}px)`; }));
    svcList.addEventListener('mouseleave', () => sf.classList.remove('show'));
  }

  /* ---------- FEATURE SPOTLIGHT ---------- */
  $$('.feat').forEach(f => f.addEventListener('mouseenter', e => {
    const r = f.getBoundingClientRect();
    f.style.setProperty('--x', (e.clientX - r.left) + 'px'); f.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }));
  $$('.feat').forEach(f => f.addEventListener('mouseleave', e => {
    const r = f.getBoundingClientRect();
    f.style.setProperty('--x', (e.clientX - r.left) + 'px'); f.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }));

  /* ---------- HEADER / MENU ---------- */
  const header = $('#header');
  let lastY = scrollY;
  $('#burger').addEventListener('click', () => body.classList.toggle('menu-open'));

  /* ---------- TABS (home) ---------- */
  const tabBtns = $$('.tab-btn'), panels = $$('.panel');
  tabBtns.forEach(b => b.addEventListener('click', () => {
    tabBtns.forEach(x => x.classList.remove('active'));
    panels.forEach(x => x.classList.remove('active'));
    b.classList.add('active'); panels[+b.dataset.tab].classList.add('active');
  }));

  /* ---------- FAQ ---------- */
  $$('.qa__q').forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement, open = item.classList.contains('open');
    $$('.qa').forEach(x => x.classList.remove('open'));
    if (!open) item.classList.add('open');
  }));

  /* ---------- PACK TOGGLE (privatumzug) ---------- */
  $$('.toggle').forEach(tg => {
    const btns = $$('button', tg), knob = $('.knob', tg);
    const scope = tg.closest('section');
    const set = i => {
      btns.forEach((b, j) => b.classList.toggle('on', i === j));
      knob.style.width = btns[i].offsetWidth + 'px';
      knob.style.transform = `translateX(${btns[i].offsetLeft - 6}px)`;
      $$('.tpanel', scope).forEach((p, j) => p.classList.toggle('on', i === j));
      const st = $('.boxes-visual .stack', scope), who = $('.boxes-visual .who span', scope);
      if (st) buildBoxes(st, i === 0 ? 'self' : 'team');
      if (who) who.textContent = i === 0 ? 'Sie packen – wir transportieren' : 'Wir erledigen alles';
    };
    btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
    requestAnimationFrame(() => set(0));
    addEventListener('resize', () => set(btns.findIndex(b => b.classList.contains('on'))));
  });

  /* ---------- EXPAND CARDS (über uns) ---------- */
  $$('.xcards').forEach(wrap => {
    const cards = $$('.xcard', wrap);
    const act = c => { cards.forEach(x => x.classList.toggle('active', x === c)); };
    cards.forEach(c => { c.addEventListener('mouseenter', () => !isTouch && act(c)); c.addEventListener('click', () => act(c)); });
  });

  /* ---------- ROUTE ANIMATION (privatumzug) ---------- */
  const rPath = $('#routePath'), rTruck = $('#routeTruck'), rDraw = $('#routeDraw');
  let routeLen = 0, routeT0 = performance.now();
  if (rPath) { routeLen = rPath.getTotalLength(); rDraw.style.strokeDasharray = routeLen; }
  const drawRoute = now => {
    if (!rPath) return;
    const cycle = 6000, t = ((now - routeT0) % (cycle + 1200)) / cycle;
    const p = clamp(t, 0, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const L = e * routeLen, pt1 = rPath.getPointAtLength(L), pt2 = rPath.getPointAtLength(Math.min(routeLen, L + 1));
    const ang = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180 / Math.PI;
    const flip = Math.abs(ang) > 90;
    rTruck.setAttribute('transform', `translate(${pt1.x},${pt1.y}) rotate(${flip ? ang + 180 : ang}) scale(${flip ? -1 : 1},1)`);
    rDraw.style.strokeDashoffset = routeLen - L;
  };

  /* ---------- STACKING CARDS ---------- */
  const scards = $$('.scard');
  const drawStack = () => {
    scards.forEach((c, i) => {
      const n = scards[i + 1];
      if (!n) return;
      const a = c.getBoundingClientRect(), b = n.getBoundingClientRect();
      const p = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      c.style.transform = `scale(${1 - p * .06})`;
      c.style.filter = `brightness(${1 - p * .35})`;
    });
  };

  /* ---------- TIMELINE ---------- */
  const tl = $('.tl'), tlFill = $('.tl__fill'), tlItems = $$('.tl__item');
  const drawTl = () => {
    if (!tl) return;
    const r = tl.getBoundingClientRect(), mark = innerHeight * .6;
    tlFill.style.height = clamp((mark - r.top) / r.height, 0, 1) * 100 + '%';
    tlItems.forEach(it => it.classList.toggle('on', it.getBoundingClientRect().top + 40 < mark));
  };

  /* ---------- HIGHLIGHT TEXT ---------- */
  const drawHl = () => {
    hlEls.forEach(el => {
      const r = el.getBoundingClientRect(), words = el._w || (el._w = $$('.hw', el));
      const start = innerHeight * .85, end = innerHeight * .35;
      const p = clamp((start - r.top) / (r.height + start - end), 0, 1);
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    });
  };

  /* ---------- OFFERTE FORM ---------- */
  const oform = $('#oform');
  if (oform) {
    const steps = $$('.ostep', oform), lis = $$('.osteps li'), bar = $('.obar i');
    let cur = 0;
    const show = (i, back) => {
      steps.forEach((s, j) => { s.classList.toggle('on', i === j); s.classList.toggle('back', !!back && i === j); });
      lis.forEach((l, j) => { l.classList.toggle('on', j === i); l.classList.toggle('done', j < i); });
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      cur = i;
      const top = $('.oq__main').getBoundingClientRect().top + scrollY - 20;
      if (scrollY > top) scrollTo({top, behavior: 'smooth'});
    };
    const validate = step => {
      let ok = true;
      $$('[data-req]', step).forEach(f => {
        const inp = $$('input,textarea,select', f);
        const filled = inp.some(x => (x.type === 'radio' || x.type === 'checkbox') ? x.checked : x.value.trim() !== '');
        f.classList.toggle('err', !filled);
        if (!filled) ok = false;
      });
      return ok;
    };
    $$('[data-next]', oform).forEach(b => b.addEventListener('click', () => { if (validate(steps[cur])) show(cur + 1); }));
    $$('[data-prev]', oform).forEach(b => b.addEventListener('click', () => show(cur - 1, true)));
    $$('input,textarea', oform).forEach(i => i.addEventListener('input', () => i.closest('.fld') && i.closest('.fld').classList.remove('err')));
    // Datumsfelder je nach Service
    const dateMap = {'Umzug': ['umzug'], 'Reinigung': ['reinigung'], 'Umzug & Reinigung': ['umzug', 'reinigung'], 'Räumung & Entsorgung': ['raeumung']};
    $$('input[name=service]', oform).forEach(r => r.addEventListener('change', () => {
      r.closest('.fld').classList.remove('err');
      $$('.dates .fld', oform).forEach(f => f.classList.toggle('show', dateMap[r.value].includes(f.dataset.date)));
    }));
    // Zimmer-Stepper
    const out = $('#roomsOut'), viz = $('#roomsViz'), hidden = $('#rooms');
    let rooms = 3.5;
    const renderRooms = () => {
      out.innerHTML = `${String(rooms).replace('.', ',')}<small>Zimmer</small>`;
      hidden.value = rooms;
      viz.innerHTML = Array.from({length: Math.floor(rooms)}, () => '<span></span>').join('') + (rooms % 1 ? '<span class="half"></span>' : '');
    };
    $('#roomsMinus').addEventListener('click', () => { rooms = Math.max(1, rooms - .5); renderRooms(); });
    $('#roomsPlus').addEventListener('click', () => { rooms = Math.min(10, rooms + .5); renderRooms(); });
    renderRooms();
    oform.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(steps[cur])) return;
      steps.forEach(s => s.classList.remove('on'));
      $('.obar').style.display = 'none';
      lis.forEach(l => { l.classList.remove('on'); l.classList.add('done'); });
      $('#osuccess').classList.add('on');
      confetti();
    });
  }
  function confetti() {
    if (reduce) return;
    const c = document.createElement('div'); c.className = 'confetti';
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.className = ['', 'r', 'b', '', 'r'][i % 5];
      s.style.left = Math.random() * 100 + '%';
      s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      s.style.animationDuration = (2.2 + Math.random() * 2) + 's';
      s.style.animationDelay = (Math.random() * .6) + 's';
      const k = .6 + Math.random() * .8; s.style.width = 22 * k + 'px'; s.style.height = 18 * k + 'px';
      c.appendChild(s);
    }
    body.appendChild(c); setTimeout(() => c.remove(), 5000);
  }

  /* ---------- KONTAKT FORM + COPY ---------- */
  const kform = $('#kform');
  if (kform) kform.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[data-req]', kform).forEach(f => {
      const inp = $('input,textarea', f);
      const filled = inp.type === 'checkbox' ? inp.checked : inp.value.trim() !== '' && (inp.type !== 'email' || /.+@.+\..+/.test(inp.value));
      f.classList.toggle('err', !filled); if (!filled) ok = false;
    });
    if (!ok) return;
    kform.style.display = 'none'; $('#ksuccess').classList.add('on'); confetti();
  });
  const toast = $('#toast');
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) {}
    if (toast) { $('span', toast).textContent = 'Kopiert: ' + b.dataset.copy; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
  }));

  /* ---------- MAIN LOOP ---------- */
  const track = $('#track'), proc = $('#ablauf.process'), fill = $('#routeFill'), truck = $('#truck'), route = $('#route');
  const dots = $$('.route__dot'), marquees = $$('[data-skew]'), pars = $$('[data-par]');
  let rx = 0, ry = 0, prevScroll = scrollY, vel = 0, lastTruck = 0;

  const loop = now => {
    drawCursor();
    if (sf) { fx = lerp(fx, mx, .12); fy = lerp(fy, my, .12); sf.style.left = fx + 'px'; sf.style.top = fy + 'px'; }

    if (heroStack) {
      const tx = (mx / innerWidth - .5), ty = (my / innerHeight - .5);
      rx = lerp(rx, -18 - ty * 14, .06); ry = lerp(ry, -38 + tx * 30, .06);
      const heroOut = clamp(scrollY / innerHeight, 0, 1);
      heroStack.style.transform = `rotateX(${rx}deg) rotateY(${ry + heroOut * 40}deg) translateY(${heroOut * -60}px)`;
    }
    pars.forEach(el => el.style.transform = `translateY(${scrollY * +el.dataset.par}px)`);

    const y = scrollY;
    header.classList.toggle('scrolled', y > 40);
    if (!body.classList.contains('menu-open')) header.classList.toggle('hidden', y > lastY && y > 300);
    lastY = y;

    vel = lerp(vel, y - prevScroll, .1); prevScroll = y;
    const sk = clamp(vel * .06, -3, 3);
    marquees.forEach(m => m.style.setProperty('--skew', sk.toFixed(2)));

    if (proc && innerWidth > 900) {
      const r = proc.getBoundingClientRect();
      const total = proc.offsetHeight - innerHeight;
      const prog = clamp(-r.top / total, 0, 1);
      track.style.transform = `translate3d(${-prog * (track.scrollWidth - innerWidth)}px,0,0)`;
      fill.style.width = (prog * 100) + '%';
      truck.style.transform = `translateX(${prog * route.offsetWidth}px)`;
      truck.classList.toggle('moving', Math.abs(prog - lastTruck) > 0.0005);
      lastTruck = prog;
      dots.forEach((d, i) => d.classList.toggle('on', prog >= i / 3 - 0.01));
    }
    drawRoute(now);
    if (scards.length && innerWidth > 900) drawStack();
    drawTl();
    drawHl();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
