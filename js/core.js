/* Router, shared helpers, task checking */
window.DEMOS = window.DEMOS || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const COLORS = ['#2D5BBF', '#B84A12', '#2E7D5B', '#7A3FB0', '#0F7C8C', '#C0392B', '#8A6D1F', '#D35490', '#3E4C6E', '#5C8A2E'];
const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const A = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
const C = (n, k) => (k < 0 || k > n ? 0 : Math.round(A(n, k) / fact(k)));
const fmt = (x) => x.toLocaleString('ru-RU').replace(/ /g, ' ');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
}
function tex(target) {
  if (window.renderMathInElement) renderMathInElement(target, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
}
function katexStr(s) { return window.katex ? katex.renderToString(s, { throwOnError: false }) : s; }

/* Demo frame: header, body, controls */
function frame(host, title) {
  host.innerHTML = '';
  const head = el('div', { class: 'demo-head' }, el('span', { class: 't' }, title));
  const body = el('div', { class: 'demo-body' });
  const controls = el('div', { class: 'controls' });
  host.append(head, body, controls);
  return { head, body, controls };
}
function slider(parent, label, min, max, val, onchange) {
  const out = el('output', {}, String(val));
  const inp = el('input', { type: 'range', min, max, value: val });
  inp.addEventListener('input', () => { out.textContent = inp.value; onchange(+inp.value); });
  parent.append(el('label', {}, label, inp, out));
  return inp;
}
function button(parent, text, onclick, cls = '') {
  const b = el('button', { class: 'btn ' + cls, onclick }, text);
  parent.append(b);
  return b;
}
/* A cancellable play loop: each demo owns one Player */
class Player {
  constructor() { this.token = 0; this.running = false; }
  stop() { this.token++; this.running = false; this.onstate && this.onstate(false); }
  async run(stepFn, delay) {
    this.stop(); const t = this.token; this.running = true; this.onstate && this.onstate(true);
    while (this.token === t) {
      const more = await stepFn();
      if (!more || this.token !== t) break;
      await sleep(typeof delay === 'function' ? delay() : delay);
    }
    if (this.token === t) { this.running = false; this.onstate && this.onstate(false); }
  }
}

/* Tasks: inject answer row */
function initTasks(root) {
  $$('.task[data-answer]', root).forEach((t) => {
    if (t.dataset.ready) return; t.dataset.ready = 1;
    const inp = el('input', { inputmode: 'numeric', placeholder: 'Ваш ответ', 'aria-label': 'Ответ' });
    const v = el('span', { class: 'verdict' });
    const check = () => {
      const val = inp.value.replace(/[\s  ]/g, '').replace(',', '.');
      if (!val) { v.textContent = ''; return; }
      const ok = Number(val) === Number(t.dataset.answer);
      v.className = 'verdict ' + (ok ? 'ok' : 'no');
      v.textContent = ok ? 'Верно!' : 'Пока нет — попробуйте ещё или откройте решение';
    };
    inp.addEventListener('keydown', (e) => e.key === 'Enter' && check());
    const row = el('div', { class: 'answer-row' }, inp, el('button', { class: 'btn', onclick: check }, 'Проверить'), v);
    const det = $('details', t);
    det ? t.insertBefore(row, det) : t.append(row);
  });
}

/* Router */
const mounted = new Set();
function show(page) {
  const pages = $$('.page');
  const target = pages.find((p) => p.dataset.page === page) || pages[0];
  pages.forEach((p) => p.classList.toggle('on', p === target));
  $$('.nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#/' + target.dataset.page));
  $$('[data-demo]', target).forEach((d) => {
    if (mounted.has(d)) return; mounted.add(d);
    const fn = window.DEMOS[d.dataset.demo];
    if (fn) { try { fn(d); tex(d); } catch (e) { console.error(d.dataset.demo, e); } }
  });
  if (target.dataset.page === 'trainer' && window.initTrainer && !mounted.has('trainer')) { mounted.add('trainer'); window.initTrainer($('#trainer')); }
  initTasks(target);
  $('#side').classList.remove('open');
  window.scrollTo({ top: 0 });
  document.title = (target.querySelector('h1')?.textContent || 'Комбинаторика') + ' — комбинаторика с анимациями';
}
function route() { show((location.hash.match(/^#\/(\w+)/) || [])[1] || 'home'); }
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  $('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('open'));
  const go = () => { tex(document.body); route(); };
  if (window.renderMathInElement) go(); else window.addEventListener('load', go);
});
