/* Interactive demos. Each DEMOS[name](host) builds its own UI inside host. */
const LET = 'ABCDEFGH';
const ball = (i, cls = '') => el('div', { class: 'ball ' + cls, style: { background: COLORS[i % COLORS.length] } }, LET[i]);
function counterEl(parent) { const c = el('span', { class: 'counter' }); parent.append(c); return c; }
function setCount(c, i, total, label = 'вариант') { c.innerHTML = `${label} <b>${fmt(i)}</b> из ${fmt(total)}`; }
function playBtn(parent, player, start) {
  const b = button(parent, '▶ Запустить', () => (player.running ? player.stop() : start()), 'or');
  player.onstate = (on) => (b.textContent = on ? '❚❚ Пауза' : '▶ Запустить');
  return b;
}

/* ---------- 1. Combination lock: arrangements with repetition ---------- */
function lockDemo(host, opts = {}) {
  let n = opts.n || 10, k = opts.k || 3, code = [], idx = 0;
  const f = frame(host, opts.title || 'Кодовый замок: каждое колёсико — снова все n символов');
  const lock = el('div', { class: 'lock' });
  const eq = el('div', { class: 'big-eq' });
  const list = el('div', { class: 'mini-list' });
  f.body.append(el('div', { class: 'stage' }, lock), eq, list);
  const pl = new Player();
  const cnt = counterEl(f.controls);
  const sym = (d) => (n <= 10 ? String(d) : LET[d]);
  function draw(ticked = []) {
    lock.innerHTML = '';
    code.forEach((d, i) => lock.append(el('div', { class: 'wheel' + (ticked.includes(i) ? ' tick' : '') }, sym(d))));
    const total = n ** k;
    setCount(cnt, idx + 1, total, 'код');
    eq.innerHTML = `${Array(k).fill(`<span class="hl">${n}</span>`).join(' · ')} = ${n}<sup>${k}</sup> = <span class="hl">${fmt(total)}</span>`;
  }
  function reset() {
    pl.stop(); code = Array(k).fill(0); idx = 0; list.innerHTML = '';
    if (n ** k <= 100) list.append(el('div', { class: 'mini cur mono' }, code.join('')));
    draw();
  }
  function step() {
    const total = n ** k;
    if (idx >= total - 1) return false;
    const ticked = [];
    for (let i = k - 1; i >= 0; i--) { ticked.push(i); code[i]++; if (code[i] < n) break; code[i] = 0; }
    idx++;
    if (total <= 100) { list.querySelector('.cur')?.classList.remove('cur'); list.append(el('div', { class: 'mini cur mono' }, code.map(sym).join(''))); list.scrollTop = list.scrollHeight; }
    draw(ticked);
    return true;
  }
  playBtn(f.controls, pl, () => pl.run(step, () => (n ** k > 300 ? 25 : n ** k > 60 ? 120 : 420)));
  button(f.controls, 'Шаг', () => { pl.stop(); step(); }, 'ghost');
  button(f.controls, 'Сброс', reset, 'ghost');
  slider(f.controls, 'символов n', 2, 10, n, (v) => { n = v; reset(); });
  slider(f.controls, 'колёсиков k', 1, 5, k, (v) => { k = v; reset(); });
  f.controls.append(cnt);
  reset();
  if (opts.autoplay) setTimeout(() => pl.run(step, 160), 600);
}
DEMOS.lock = (h) => lockDemo(h, { n: 3, k: 3 });
DEMOS.heroLock = (h) => lockDemo(h, { n: 10, k: 3, autoplay: true, title: 'Сколько кодов у замка? Смотрите, как растёт счётчик' });

/* ---------- 2. Decision tree: rule of product / sum ---------- */
DEMOS.tree = (host) => {
  const SOUPS = ['Борщ', 'Щи', 'Уха', 'Лагман'], SAL = ['Оливье', 'Цезарь', 'Винегрет', 'Греческий'];
  let m = 3, n = 2, mode = 'and', hi = -1;
  const f = frame(host, 'Дерево выбора: обед из первого и второго');
  const svgBox = el('div', { style: { overflowX: 'auto' } });
  const eq = el('div', { class: 'big-eq' });
  f.body.append(svgBox, eq);
  const pl = new Player();
  const cnt = counterEl(f.controls);
  function draw() {
    const leaves = mode === 'and' ? m * n : m + n;
    const W = 760, rowH = 34, H = Math.max(leaves * rowH + 30, 160);
    const x0 = 40, x1 = 280, x2 = 520;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:auto">`;
    const rootY = H / 2;
    s += `<circle cx="${x0}" cy="${rootY}" r="14" fill="#1E2A44"/><text x="${x0}" y="${rootY + 32}" text-anchor="middle" font-size="13" fill="#4A5568">старт</text>`;
    if (mode === 'and') {
      for (let i = 0; i < m; i++) {
        const yMid = 15 + (i * n + n / 2) * rowH;
        const onPath = hi >= 0 && Math.floor(hi / n) === i;
        s += `<path d="M${x0} ${rootY} C ${x0 + 120} ${rootY}, ${x1 - 120} ${yMid}, ${x1} ${yMid}" stroke="${onPath ? '#B84A12' : '#9AA3B5'}" stroke-width="${onPath ? 4 : 2}" fill="none"/>`;
        for (let j = 0; j < n; j++) {
          const id = i * n + j, y = 15 + (id + 0.5) * rowH, on = id === hi, done = hi >= id;
          s += `<path d="M${x1} ${yMid} C ${x1 + 100} ${yMid}, ${x2 - 100} ${y}, ${x2} ${y}" stroke="${on ? '#B84A12' : '#C9CFDB'}" stroke-width="${on ? 4 : 2}" fill="none"/>`;
          s += `<rect x="${x2}" y="${y - 13}" width="220" height="26" rx="13" fill="${on ? '#B84A12' : done ? '#FCE3D3' : '#F7F5EF'}" stroke="#E2DED3"/>`;
          s += `<text x="${x2 + 12}" y="${y + 5}" font-size="14" font-weight="700" fill="${on ? '#fff' : '#1E2A44'}">${id + 1}. ${SOUPS[i]} + ${SAL[j]}</text>`;
        }
        s += `<rect x="${x1 - 56}" y="${yMid - 15}" width="112" height="30" rx="15" fill="#DCE6FA" stroke="#2D5BBF"/><text x="${x1}" y="${yMid + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1E2A44">${SOUPS[i]}</text>`;
      }
      eq.innerHTML = `<span class="hl">${m}</span> первых · <span class="hl">${n}</span> вторых = <span class="hl">${m * n}</span> обедов`;
      setCount(cnt, Math.max(hi + 1, 0), m * n, 'обед');
    } else {
      const items = [...SOUPS.slice(0, m).map((t) => [t, 'первое']), ...SAL.slice(0, n).map((t) => [t, 'второе'])];
      items.forEach(([t, g], id) => {
        const y = 15 + (id + 0.5) * rowH, on = id === hi;
        s += `<path d="M${x0} ${rootY} C ${x0 + 160} ${rootY}, ${x1 - 60} ${y}, ${x1 + 60} ${y}" stroke="${on ? '#B84A12' : '#C9CFDB'}" stroke-width="${on ? 4 : 2}" fill="none"/>`;
        s += `<rect x="${x1 + 60}" y="${y - 13}" width="250" height="26" rx="13" fill="${on ? '#B84A12' : g === 'первое' ? '#DCE6FA' : '#FCE3D3'}"/>`;
        s += `<text x="${x1 + 72}" y="${y + 5}" font-size="14" font-weight="700" fill="${on ? '#fff' : '#1E2A44'}">${id + 1}. ${t} (${g})</text>`;
      });
      eq.innerHTML = `<span class="hl">${m}</span> первых + <span class="hl">${n}</span> вторых = <span class="hl">${m + n}</span> способов взять одно блюдо`;
      setCount(cnt, Math.max(hi + 1, 0), m + n, 'вариант');
    }
    svgBox.innerHTML = s + '</svg>';
  }
  const total = () => (mode === 'and' ? m * n : m + n);
  const reset = () => { pl.stop(); hi = -1; draw(); };
  playBtn(f.controls, pl, () => { if (hi >= total() - 1) hi = -1; pl.run(() => { hi++; draw(); return hi < total() - 1; }, 650); });
  const modeBtn = button(f.controls, 'Режим: «и» (умножение)', () => { mode = mode === 'and' ? 'or' : 'and'; modeBtn.textContent = mode === 'and' ? 'Режим: «и» (умножение)' : 'Режим: «или» (сложение)'; reset(); }, 'ghost');
  slider(f.controls, 'первых', 1, 4, m, (v) => { m = v; reset(); });
  slider(f.controls, 'вторых', 1, 4, n, (v) => { n = v; reset(); });
  f.controls.append(cnt);
  draw();
};

/* ---------- 3. Permutations: balls reorder ---------- */
function nextPerm(a) {
  let i = a.length - 2; while (i >= 0 && a[i] >= a[i + 1]) i--;
  if (i < 0) return false;
  let j = a.length - 1; while (a[j] <= a[i]) j--;
  [a[i], a[j]] = [a[j], a[i]];
  for (let l = i + 1, r = a.length - 1; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]];
  return true;
}
DEMOS.perm = (host) => {
  let n = 4, p = [], idx = 0;
  const f = frame(host, 'Переставляем n разных шариков всеми способами');
  const row = el('div', { style: { position: 'relative', height: '70px', margin: '10px auto' } });
  const slots = el('div', { class: 'stage', style: { minHeight: '120px', gap: '14px' } });
  const eq = el('div', { class: 'big-eq' });
  const list = el('div', { class: 'mini-list' });
  f.body.append(row, eq, list);
  const pl = new Player();
  const cnt = counterEl(f.controls);
  let balls = [];
  function build() {
    row.innerHTML = ''; row.style.width = n * 66 + 'px';
    balls = Array.from({ length: n }, (_, i) => { const b = ball(i); b.style.position = 'absolute'; b.style.left = '0'; row.append(b); return b; });
  }
  function place() { p.forEach((v, pos) => (balls[v].style.transform = `translateX(${pos * 66}px)`)); }
  function addMini() {
    list.querySelector('.cur')?.classList.remove('cur');
    list.append(el('div', { class: 'mini cur' }, p.map((v) => ball(v, 'sm'))));
    list.scrollTop = list.scrollHeight;
  }
  function eqText(shown = n) {
    const parts = []; for (let i = n; i >= 1; i--) parts.push(n - i < shown ? `<span class="hl">${i}</span>` : i);
    eq.innerHTML = `P<sub>${n}</sub> = ${parts.join(' · ')} = ${n}! = <span class="hl">${fmt(fact(n))}</span>`;
  }
  function reset() { pl.stop(); p = [...Array(n).keys()]; idx = 0; list.innerHTML = ''; build(); place(); addMini(); eqText(); setCount(cnt, 1, fact(n), 'перестановка'); }
  function step() { if (!nextPerm(p)) return false; idx++; place(); addMini(); setCount(cnt, idx + 1, fact(n), 'перестановка'); return idx < fact(n) - 1; }
  playBtn(f.controls, pl, () => { if (idx >= fact(n) - 1) reset(); pl.run(step, 700); });
  button(f.controls, 'Шаг', () => { pl.stop(); step(); }, 'ghost');
  button(f.controls, 'Почему n! ?', async () => {
    pl.stop(); slots.innerHTML = ''; if (!slots.parentNode) f.body.insertBefore(slots, eq);
    for (let i = 0; i < n; i++) {
      slots.append(el('div', { class: 'slot filled' }, el('span', { class: 'ch' }, String(n - i)), el('span', { class: 'lab' }, `${i + 1}-е место`), ball(i, 'sm')));
      if (i < n - 1) slots.append(el('span', { class: 'op' }, '·'));
      eqText(i + 1); await sleep(650);
    }
  }, 'ghost');
  slider(f.controls, 'шариков n', 1, 5, n, (v) => { n = v; slots.remove(); reset(); });
  f.controls.append(cnt);
  reset();
};

/* ---------- 4. Arrangements: podium ---------- */
DEMOS.podium = (host) => {
  let n = 5, k = 3, cur = [], idx = 0;
  const f = frame(host, 'Пьедестал: k мест для n участников, порядок важен');
  const pool = el('div', { class: 'stage', style: { minHeight: '70px' } });
  const pod = el('div', { class: 'stage', style: { minHeight: '140px', gap: '14px', alignItems: 'flex-end' } });
  const eq = el('div', { class: 'big-eq' });
  const list = el('div', { class: 'mini-list' });
  f.body.append(el('p', { style: { textAlign: 'center', color: '#4A5568', margin: 0 } }, 'Участники'), pool, pod, eq, list);
  const pl = new Player(); const cnt = counterEl(f.controls);
  const heights = [110, 90, 76, 64];
  function draw() {
    pool.innerHTML = '';
    for (let i = 0; i < n; i++) { const b = ball(i); if (cur.includes(i)) b.style.opacity = '.18'; pool.append(b); }
    pod.innerHTML = '';
    for (let j = 0; j < k; j++) {
      const s = el('div', { class: 'slot filled', style: { height: heights[j] + 'px', alignItems: 'start', paddingTop: '8px' } },
        el('span', { class: 'ch' }, String(n - j)), el('span', { class: 'lab' }, `${j + 1}-е место`));
      if (cur[j] != null) s.append(ball(cur[j], 'sm'));
      pod.append(s);
    }
    const parts = Array.from({ length: k }, (_, j) => `<span class="hl">${n - j}</span>`);
    eq.innerHTML = `A<sub>${n}</sub><sup>${k}</sup> = ${parts.join(' · ')} = <span class="hl">${fmt(A(n, k))}</span>`;
    setCount(cnt, idx + 1, A(n, k));
  }
  function first() { cur = [...Array(k).keys()]; }
  function next() { // lexicographic next arrangement of k distinct from n
    for (let pos = k - 1; pos >= 0; pos--) {
      const used = new Set(cur.slice(0, pos));
      for (let v = cur[pos] + 1; v < n; v++) {
        if (used.has(v)) continue;
        const nxt = cur.slice(0, pos).concat(v); const u2 = new Set(nxt);
        for (let q = 0; nxt.length < k && q < n; q++) if (!u2.has(q)) { nxt.push(q); u2.add(q); }
        cur = nxt; return true;
      }
    }
    return false;
  }
  function addMini() { if (A(n, k) > 210) return; list.querySelector('.cur')?.classList.remove('cur'); list.append(el('div', { class: 'mini cur' }, cur.map((v) => ball(v, 'sm')))); list.scrollTop = list.scrollHeight; }
  function reset() { pl.stop(); first(); idx = 0; list.innerHTML = ''; addMini(); draw(); }
  function step() { if (!next()) return false; idx++; addMini(); draw(); return idx < A(n, k) - 1; }
  playBtn(f.controls, pl, () => { if (idx >= A(n, k) - 1) reset(); pl.run(step, () => (A(n, k) > 100 ? 160 : 600)); });
  button(f.controls, 'Шаг', () => { pl.stop(); step(); }, 'ghost');
  const kS = slider(f.controls, 'мест k', 1, 4, k, (v) => { k = Math.min(v, n); reset(); });
  slider(f.controls, 'участников n', 2, 7, n, (v) => { n = v; if (k > n) { k = n; kS.value = k; kS.nextSibling.textContent = k; } reset(); });
  f.controls.append(cnt);
  reset();
};

/* ---------- 5. Combinations: merge arrangements into sets ---------- */
DEMOS.merge = (host) => {
  let n = 4, k = 2, phase = 0;
  const f = frame(host, 'Почему делим на k! : склеиваем одинаковые наборы');
  const stage = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } });
  const eq = el('div', { class: 'big-eq' });
  f.body.append(stage, eq);
  function arrangements() { const out = []; const rec = (cur) => { if (cur.length === k) return out.push(cur.slice()); for (let i = 0; i < n; i++) if (!cur.includes(i)) { cur.push(i); rec(cur); cur.pop(); } }; rec([]); return out; }
  function draw() {
    stage.innerHTML = '';
    const arr = arrangements();
    if (phase === 0) {
      const wrap = el('div', { class: 'mini-list', style: { maxHeight: 'none' } });
      arr.forEach((a) => wrap.append(el('div', { class: 'mini' }, a.map((v) => ball(v, 'sm')))));
      stage.append(wrap);
      eq.innerHTML = `Размещений (порядок важен): A<sub>${n}</sub><sup>${k}</sup> = <span class="hl">${A(n, k)}</span>`;
      btn.textContent = '① Сгруппировать по составу';
    } else {
      const groups = {}; arr.forEach((a) => { const key = a.slice().sort().join(''); (groups[key] = groups[key] || []).push(a); });
      Object.values(groups).forEach((g, gi) => {
        const r = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', animation: `pop .3s ease ${gi * 0.05}s both` } });
        if (phase === 1) g.forEach((a) => r.append(el('div', { class: 'mini' }, a.map((v) => ball(v, 'sm')))));
        else r.append(el('div', { class: 'mini cur' }, '{', g[0].slice().sort().map((v) => ball(v, 'sm')), '}'), el('span', { style: { color: '#4A5568', fontWeight: 700 } }, `← было ${g.length} = ${k}! порядков`));
        stage.append(r);
      });
      eq.innerHTML = phase === 1
        ? `В каждой строке один и тот же набор в <span class="hl">${k}! = ${fact(k)}</span> порядках`
        : `C<sub>${n}</sub><sup>${k}</sup> = A<sub>${n}</sub><sup>${k}</sup> : ${k}! = ${A(n, k)} : ${fact(k)} = <span class="hl">${C(n, k)}</span> наборов`;
      btn.textContent = phase === 1 ? '② Склеить в наборы' : '↺ Начать заново';
    }
  }
  const btn = button(f.controls, '', () => { phase = (phase + 1) % 3; draw(); }, 'or');
  slider(f.controls, 'элементов n', 3, 5, n, (v) => { n = v; phase = 0; draw(); });
  slider(f.controls, 'выбираем k', 2, 3, k, (v) => { k = v; phase = 0; draw(); });
  draw();
};

/* ---------- 6. Pascal triangle ---------- */
DEMOS.pascal = (host) => {
  const f = frame(host, 'Треугольник Паскаля: нажмите на любое число');
  const tri = el('div', { class: 'pascal' }); const eq = el('div', { class: 'big-eq' });
  f.body.append(tri, eq); f.controls.remove();
  const N = 9, cells = [];
  for (let r = 0; r <= N; r++) {
    const row = el('div', { class: 'row' }); cells[r] = [];
    for (let c = 0; c <= r; c++) { const d = el('div', { class: 'c', onclick: () => pick(r, c) }, String(C(r, c))); cells[r][c] = d; row.append(d); }
    tri.append(row);
  }
  function pick(r, c) {
    $$('.c', tri).forEach((d) => d.classList.remove('sel', 'par'));
    cells[r][c].classList.add('sel');
    let s = `C<sub>${r}</sub><sup>${c}</sup> = ${r}! : (${c}! · ${r - c}!) = <span class="hl">${C(r, c)}</span>`;
    if (r > 0 && c > 0 && c < r) {
      cells[r - 1][c - 1].classList.add('par'); cells[r - 1][c].classList.add('par');
      s += `<br><span style="font-size:20px">= C<sub>${r - 1}</sub><sup>${c - 1}</sup> + C<sub>${r - 1}</sub><sup>${c}</sup> = ${C(r - 1, c - 1)} + ${C(r - 1, c)}</span>`;
    }
    eq.innerHTML = s;
  }
  pick(5, 2);
};

/* ---------- 7. Lift: n floors, k passengers ---------- */
DEMOS.lift = (host) => {
  let n = 8, k = 5;
  const f = frame(host, 'Лифт: каждый пассажир выбирает этаж (k = пассажиры, n = этажи)');
  const box = el('div', { style: { position: 'relative', margin: 'auto', maxWidth: '560px', background: '#FBFAF6', border: '1px solid #E2DED3', borderRadius: '16px', overflow: 'hidden' } });
  const eq = el('div', { class: 'big-eq' });
  f.body.append(box, eq);
  const pl = new Player(); let dots = [];
  function build() {
    box.innerHTML = ''; box.style.height = n * 46 + 'px';
    for (let i = 0; i < n; i++) box.append(el('div', { style: { position: 'absolute', left: 0, right: 0, top: i * 46 + 'px', height: '46px', borderBottom: '1px solid #E2DED3', display: 'flex', alignItems: 'center', paddingLeft: '14px', fontWeight: 800, color: '#4A5568' } }, `${n + 1 - i} эт.`));
    box.append(el('div', { style: { position: 'absolute', left: '76px', top: 0, bottom: 0, width: '5px', background: '#1E2A44' } }));
    dots = Array.from({ length: k }, (_, j) => { const d = ball(j, 'sm'); d.textContent = j + 1; Object.assign(d.style, { position: 'absolute', left: '0', top: '0', transition: 'transform .6s cubic-bezier(.3,1.2,.5,1)' }); box.append(d); return d; });
    eq.innerHTML = `${Array(k).fill(`<span class="hl">${n}</span>`).join(' · ')} = ${n}<sup>${k}</sup> = <span class="hl">${fmt(n ** k)}</span> способов выйти`;
  }
  function shuffle() {
    const cnt = {};
    dots.forEach((d, j) => { const fl = Math.floor(Math.random() * n); const c = cnt[fl] = (cnt[fl] || 0) + 1; d.style.transform = `translate(${100 + (c - 1) * 38}px, ${fl * 46 + 8}px)`; });
    return true;
  }
  playBtn(f.controls, pl, () => pl.run(shuffle, 1300));
  button(f.controls, 'Новый вариант', () => { pl.stop(); shuffle(); }, 'ghost');
  slider(f.controls, 'этажей n', 2, 8, n, (v) => { n = v; build(); shuffle(); });
  slider(f.controls, 'пассажиров k', 1, 6, k, (v) => { k = v; build(); shuffle(); });
  build(); setTimeout(shuffle, 50);
};

/* ---------- 8. Word anagrams: permutations with repetition ---------- */
DEMOS.word = (host) => {
  let word = 'ПАПКА', letters = [], perm = [], idx = 0, total = 1;
  const f = frame(host, 'Анаграммы: одинаковые буквы можно менять местами — слово не меняется');
  const input = el('input', { value: word, maxlength: 12, style: { font: '700 20px Rubik', padding: '8px 12px', borderRadius: '12px', border: '2px solid #E2DED3', width: '200px', textTransform: 'uppercase' } });
  const tiles = el('div', { style: { position: 'relative', height: '64px', margin: '14px auto' } });
  const note = el('div', { style: { textAlign: 'center', minHeight: '26px', fontWeight: 700, color: '#2E7D5B' } });
  const eq = el('div', { class: 'big-eq' });
  const list = el('div', { class: 'mini-list' });
  f.body.append(el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' } }, el('b', {}, 'Слово:'), input), tiles, note, eq, list);
  const pl = new Player(); const cnt = counterEl(f.controls);
  let tileEls = [], colorOf = {};
  function setup() {
    pl.stop();
    word = (input.value || 'ПАПКА').toUpperCase().replace(/[^A-ZА-ЯЁ0-9]/g, '').slice(0, 12) || 'ПАПКА';
    letters = [...word];
    const counts = {}; letters.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
    colorOf = {}; Object.keys(counts).forEach((c, i) => (colorOf[c] = COLORS[i % COLORS.length]));
    const seen = {};
    tiles.innerHTML = ''; tiles.style.width = letters.length * 56 + 'px';
    tileEls = letters.map((c) => { seen[c] = (seen[c] || 0) + 1; const t = el('div', { class: 'tile', style: { background: colorOf[c], position: 'absolute', left: 0 } }, c); if (counts[c] > 1) t.append(el('sub', {}, String(seen[c]))); tiles.append(t); return t; });
    perm = letters.map((_, i) => i); place();
    total = fact(letters.length); Object.values(counts).forEach((v) => (total /= fact(v))); total = Math.round(total);
    const den = Object.entries(counts).filter(([, v]) => v > 1).map(([c, v]) => `${v}!`).join(' · ') || '1';
    const parts = Object.entries(counts).map(([c, v]) => `${c} — ${v}`).join(', ');
    eq.innerHTML = `<div style="font-size:17px;color:#4A5568;font-weight:600">${letters.length} букв: ${parts}</div>${letters.length}! : (${den}) = ${fmt(fact(letters.length))} : ${fmt(fact(letters.length) / total)} = <span class="hl">${fmt(total)}</span> слов`;
    sorted = letters.slice().sort(); idx = 0; list.innerHTML = '';
    if (letters.length <= 10) addMini(sorted.join(''));
    setCount(cnt, 1, total, 'слово'); note.textContent = '';
  }
  function place() { perm.forEach((ti, pos) => (tileEls[ti].style.transform = `translateX(${pos * 56}px)`)); }
  let sorted = [];
  function addMini(w) { if (total > 3000) return; list.querySelector('.cur')?.classList.remove('cur'); list.append(el('div', { class: 'mini cur mono', style: { fontWeight: 800 } }, w)); list.scrollTop = list.scrollHeight; }
  function step() {
    if (letters.length > 10 || !nextPerm(sorted)) return false;
    idx++; addMini(sorted.join('')); setCount(cnt, idx + 1, total, 'слово');
    // move tiles to spell the new word, matching equal letters in order
    const pools = {}; letters.forEach((c, i) => (pools[c] = pools[c] || []).push(i));
    const used = {}; perm = sorted.map((c) => pools[c][(used[c] = (used[c] || 0) + 1) - 1]); place();
    return idx < total - 1;
  }
  playBtn(f.controls, pl, () => { if (idx >= total - 1) setup(); pl.run(step, () => (total > 200 ? 140 : 700)); });
  button(f.controls, 'Поменять одинаковые', () => {
    pl.stop();
    const byLetter = {}; perm.forEach((ti, pos) => (byLetter[letters[ti]] = byLetter[letters[ti]] || []).push(pos));
    const dup = Object.values(byLetter).find((p) => p.length > 1);
    if (!dup) { note.style.color = '#B84A12'; note.textContent = 'В этом слове все буквы разные — тогда ответ просто n!'; return; }
    const [a, b] = dup; [perm[a], perm[b]] = [perm[b], perm[a]]; place();
    note.style.color = '#2E7D5B'; note.textContent = 'Индексы поменялись, а слово осталось тем же! Поэтому делим на факториалы.';
  }, 'ghost');
  button(f.controls, 'Применить слово', setup, 'ghost');
  input.addEventListener('keydown', (e) => e.key === 'Enter' && setup());
  f.controls.append(cnt);
  setup();
};

/* ---------- 9. Stars and bars: combinations with repetition ---------- */
DEMOS.stars = (host) => {
  const NAMES = ['Корзиночка', 'Наполеон', 'Песочное', 'Эклер', 'Картошка'];
  let n = 4, k = 7, cnts = [], idx = 0, total = 0;
  const f = frame(host, 'Пирожные, шарики и перегородки');
  const shop = el('div', { class: 'shop' });
  const status = el('div', { style: { textAlign: 'center', fontWeight: 700, marginTop: '10px' } });
  const code = el('div', { class: 'code' });
  const digits = el('div', { class: 'mono', style: { textAlign: 'center', fontSize: '22px', fontWeight: 800, marginTop: '6px' } });
  const eq = el('div', { class: 'big-eq' });
  f.body.append(shop, status, code, digits, eq);
  const pl = new Player(); const cnt = counterEl(f.controls);
  function draw() {
    shop.innerHTML = '';
    cnts.forEach((c, i) => {
      const stack = el('div', { class: 'stack' }); for (let j = 0; j < c; j++) stack.append(el('div', { class: 'cake', style: { background: COLORS[i] } }));
      shop.append(el('div', { class: 'shelf' }, el('div', { class: 'name', style: { color: COLORS[i] } }, NAMES[i]), stack, el('div', { style: { fontFamily: 'Rubik', fontWeight: 700, fontSize: '20px' } }, String(c)),
        el('div', { class: 'pm' }, el('button', { onclick: () => { pl.stop(); if (cnts[i] > 0) { cnts[i]--; draw(); } } }, '−'), el('button', { onclick: () => { pl.stop(); const s = cnts.reduce((a, b) => a + b, 0); if (s < k) { cnts[i]++; draw(); } } }, '+'))));
    });
    const s = cnts.reduce((a, b) => a + b, 0);
    status.innerHTML = s === k ? `Набрано <b style="color:#2E7D5B">${s} из ${k}</b> — это одна из покупок` : `Набрано ${s} из ${k} — добавьте ещё ${k - s}`;
    code.innerHTML = ''; let dg = '';
    cnts.forEach((c, i) => { for (let j = 0; j < c; j++) { code.append(el('div', { class: 's', style: { background: COLORS[i] } }, '●')); dg += '1'; } if (i < n - 1) { code.append(el('div', { class: 'b' })); dg += '|'; } });
    digits.textContent = dg;
    total = C(n + k - 1, k);
    eq.innerHTML = `${k} шариков + ${n - 1} перегородки = ${n + k - 1} мест → C<sub>${n + k - 1}</sub><sup>${k}</sup> = <span class="hl">${fmt(total)}</span> покупок`;
    setCount(cnt, idx + 1, total, 'покупка');
  }
  function first() { cnts = Array(n).fill(0); cnts[0] = k; idx = 0; }
  function next() { // next weak composition in lexicographic-descending order
    let i = n - 2; while (i >= 0 && cnts[i] === 0) i--;
    if (i < 0) return false;
    cnts[i]--; const rest = cnts.slice(i + 1).reduce((a, b) => a + b, 0) + 1;
    for (let j = i + 1; j < n; j++) cnts[j] = 0; cnts[i + 1] = rest; return true;
  }
  playBtn(f.controls, pl, () => { if (idx >= total - 1) first(); pl.run(() => { if (!next()) return false; idx++; draw(); return idx < total - 1; }, () => (total > 80 ? 180 : 700)); });
  button(f.controls, 'Шаг', () => { pl.stop(); if (next()) { idx++; draw(); } }, 'ghost');
  button(f.controls, 'Очистить и собрать самому', () => { pl.stop(); cnts = Array(n).fill(0); draw(); }, 'ghost');
  slider(f.controls, 'видов n', 2, 5, n, (v) => { n = v; pl.stop(); first(); draw(); });
  slider(f.controls, 'пирожных k', 1, 9, k, (v) => { k = v; pl.stop(); first(); draw(); });
  f.controls.append(cnt);
  first(); draw();
};

/* ---------- 10. Formula chooser ---------- */
DEMOS.chooser = (host) => {
  const f = frame(host, 'Три вопроса к задаче'); f.controls.remove();
  const left = el('div'); const res = el('div', { class: 'result' });
  f.body.append(el('div', { class: 'chooser' }, left, res));
  const st = {};
  const Q = [
    { id: 'order', ask: '1. Важен ли порядок? (места, роли, позиции цифр)', opts: [['yes', 'Да, важен'], ['no', 'Нет, важен только состав']] },
    { id: 'rep', ask: '2. Может ли один и тот же элемент встретиться несколько раз?', opts: [['yes', 'Да'], ['no', 'Нет']] },
    { id: 'all', ask: '3. Используются все элементы?', show: () => st.order === 'yes' && st.rep === 'no', opts: [['yes', 'Да, расставляем все'], ['no', 'Нет, выбираем часть']] },
    { id: 'word', ask: '3. Заранее известно, сколько раз встречается каждый элемент (как буквы в слове)?', show: () => st.order === 'yes' && st.rep === 'yes', opts: [['yes', 'Да, состав задан'], ['no', 'Нет, каждое место выбирается свободно']] },
  ];
  const R = {
    P: ['Перестановки', 'P_n=n!', 'Сколькими способами расставить 5 книг на полке? $5!=120$.', 'perm'],
    A: ['Размещения', 'A_n^k=\\dfrac{n!}{(n-k)!}', 'Староста и заместитель из 10 учеников: $10\\cdot9=90$.', 'arr'],
    C: ['Сочетания', 'C_n^k=\\dfrac{n!}{k!\\,(n-k)!}', 'Выбрать 3 из 7 учеников на олимпиаду: $C_7^3=35$.', 'comb'],
    Ar: ['Размещения с повторениями', '\\overline{A}_n^k=n^k', 'PIN-код из 4 цифр: $10^4=10\\,000$.', 'arrrep'],
    Pr: ['Перестановки с повторениями', 'P_n(n_1,\\dots,n_k)=\\dfrac{n!}{n_1!\\cdots n_k!}', 'Анаграммы слова «ПАПКА»: $\\dfrac{5!}{2!\\,2!}=30$.', 'permrep'],
    Cr: ['Сочетания с повторениями', '\\overline{C}_n^k=C_{n+k-1}^k', 'Купить 7 пирожных 4 видов: $C_{10}^7=120$.', 'combrep'],
  };
  function result() {
    if (st.order === 'no' && st.rep === 'no') return 'C';
    if (st.order === 'no' && st.rep === 'yes') return 'Cr';
    if (st.order === 'yes' && st.rep === 'no' && st.all) return st.all === 'yes' ? 'P' : 'A';
    if (st.order === 'yes' && st.rep === 'yes' && st.word) return st.word === 'yes' ? 'Pr' : 'Ar';
    return null;
  }
  function draw() {
    left.innerHTML = '';
    Q.forEach((q, qi) => {
      if (q.show && !q.show()) return;
      const prevDone = qi === 0 || (qi === 1 && st.order) || qi > 1;
      const box = el('div', { class: 'q' + (prevDone ? '' : ' dim') }, el('div', { class: 'ask' }, q.ask));
      const opts = el('div', { class: 'opts' });
      q.opts.forEach(([v, t]) => opts.append(el('button', { class: st[q.id] === v ? 'on' : '', onclick: () => { st[q.id] = v; if (q.id === 'order' || q.id === 'rep') { delete st.all; delete st.word; } draw(); } }, t)));
      box.append(opts); left.append(box);
    });
    left.append(el('button', { class: 'btn ghost', onclick: () => { Object.keys(st).forEach((k) => delete st[k]); draw(); } }, 'Начать заново'));
    const r = result();
    res.innerHTML = '';
    if (!r) { res.append(el('div', { class: 'name' }, 'Ответьте на вопросы'), el('p', {}, 'Подсказка: «порядок важен», если от перестановки выбранных элементов получается другой результат (другое число, другое распределение ролей).')); return; }
    const [name, formula, ex, page] = R[r];
    res.append(el('div', { class: 'name' }, name), el('div', { html: katexStr('\\displaystyle ' + formula), style: { fontSize: '26px', margin: '14px 0' } }), el('p', { html: ex }), el('a', { href: '#/' + page, style: { color: '#F2B33D', fontWeight: 800 } }, 'Открыть тему с анимацией →'));
    tex(res);
  }
  draw();
};
