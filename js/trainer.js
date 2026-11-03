/* Trainer: random problems of every type with checking and worked solutions */
(function () {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const GEN = {
    rules: { name: 'Правила «и» / «или»', make() {
      if (Math.random() < 0.6) {
        const a = R(2, 6), b = R(2, 6), c = R(2, 5);
        return { text: `В магазине ${a} моделей футболок, ${b} моделей брюк и ${c} моделей кепок. Сколькими способами можно купить комплект «футболка + брюки + кепка»?`,
          answer: a * b * c, sol: `Три выбора подряд («и») — умножаем: $${a}\\cdot${b}\\cdot${c}=${a * b * c}$.` };
      }
      const a = R(3, 12), b = R(3, 12), c = R(2, 9);
      return { text: `На полке ${a} детективов, ${b} романов и ${c} сборников стихов (все книги разные). Сколькими способами можно выбрать одну книгу?`,
        answer: a + b + c, sol: `Берём либо детектив, либо роман, либо стихи («или») — складываем: $${a}+${b}+${c}=${a + b + c}$.` };
    } },
    perm: { name: 'Перестановки', make() {
      const n = R(3, 8);
      const t = pick([`Сколькими способами можно рассадить ${n} гостей на ${n} стульев в ряд?`, `Сколькими способами можно поставить в очередь ${n} человек?`, `Сколько различных расписаний можно составить из ${n} разных уроков на один день (все уроки по одному разу)?`]);
      return { text: t, answer: fact(n), sol: `Расставляем все ${n} элементов, порядок важен: $P_{${n}}=${n}!=${fmt(fact(n))}$.` };
    } },
    arr: { name: 'Размещения', make() {
      const n = R(5, 12), k = R(2, 3);
      const t = k === 3 ? `В финале ${n} спортсменов. Сколькими способами могут распределиться золотая, серебряная и бронзовая медали?`
        : `В классе ${n} учеников. Сколькими способами можно выбрать старосту и его заместителя?`;
      const f = Array.from({ length: k }, (_, i) => n - i).join('\\cdot');
      return { text: t, answer: A(n, k), sol: `Выбираем ${k} из ${n}, места (роли) различны — порядок важен, повторов нет: $A_{${n}}^{${k}}=${f}=${A(n, k)}$.` };
    } },
    comb: { name: 'Сочетания', make() {
      if (Math.random() < 0.4) {
        const n = R(5, 14);
        return { text: `В шахматном турнире ${n} участников, каждый играет с каждым по одной партии. Сколько всего партий?`, answer: C(n, 2), sol: `Партия — пара игроков без порядка: $C_{${n}}^2=\\dfrac{${n}\\cdot${n - 1}}{2}=${C(n, 2)}$.` };
      }
      const n = R(6, 12), k = R(2, 4);
      return { text: `Из ${n} учеников нужно выбрать ${k} для дежурства. Сколькими способами это можно сделать?`, answer: C(n, k),
        sol: `Роли у дежурных одинаковые — порядок не важен: $C_{${n}}^{${k}}=\\dfrac{${n}!}{${k}!\\,${n - k}!}=${C(n, k)}$.` };
    } },
    arrrep: { name: 'Размещения с повторениями', make() {
      const v = R(0, 3);
      if (v === 0) { const k = R(3, 8); return { text: `Монету бросают ${k} раз и записывают последовательность «орёл / решка». Сколько разных последовательностей?`, answer: 2 ** k, sol: `На каждом из ${k} бросков 2 исхода: $\\overline{A}_2^{${k}}=2^{${k}}=${2 ** k}$.` }; }
      if (v === 1) { const n = R(2, 6), k = R(2, 5); return { text: `Сколько ${k}-значных кодов можно составить из цифр 1, …, ${n}, если цифры могут повторяться?`, answer: n ** k, sol: `${k} мест, на каждом ${n} вариантов: $${n}^{${k}}=${fmt(n ** k)}$.` }; }
      if (v === 2) { const n = R(2, 4), k = R(3, 6); return { text: `${k} пассажиров садятся в поезд из ${n} вагонов. Сколькими способами они могут распределиться по вагонам?`, answer: n ** k, sol: `Каждый из ${k} пассажиров выбирает 1 из ${n} вагонов: $${n}^{${k}}=${fmt(n ** k)}$ (а не $${k}^{${n}}$!).` }; }
      const n = R(3, 5), k = R(3, 5); return { text: `На табло ${k} лампочек, каждая может гореть одним из ${n} цветов. Сколько разных сигналов?`, answer: n ** k, sol: `$${n}^{${k}}=${fmt(n ** k)}$.` };
    } },
    permrep: { name: 'Перестановки с повторениями', make() {
      if (Math.random() < 0.35) {
        const a = R(2, 4), b = R(2, 5);
        return { text: `Сколькими способами можно расположить в ряд ${a} красных и ${b} синих одинаковых флажков?`, answer: C(a + b, a), sol: `$P_{${a + b}}(${a},${b})=\\dfrac{${a + b}!}{${a}!\\,${b}!}=${C(a + b, a)}$.` };
      }
      const w = pick(['ПАПКА', 'МАМА', 'КОЛОКОЛ', 'БАРАБАН', 'АНАНАС', 'ПАРАБОЛА', 'АЛГЕБРА', 'ГЕОМЕТРИЯ', 'ТЕОРЕМА', 'КАРАНДАШ', 'МОЛОКО']);
      const cnt = {}; [...w].forEach((c) => (cnt[c] = (cnt[c] || 0) + 1));
      let ans = fact(w.length); Object.values(cnt).forEach((v) => (ans /= fact(v))); ans = Math.round(ans);
      const rep = Object.entries(cnt).filter(([, v]) => v > 1);
      const den = rep.map(([, v]) => `${v}!`).join('\\,') || '1';
      return { text: `Сколько различных буквосочетаний можно получить, переставляя буквы слова «${w}»?`, answer: ans,
        sol: `${w.length} букв; повторяются: ${rep.map(([c, v]) => `«${c}» — ${v} раза`).join(', ')}. $\\dfrac{${w.length}!}{${den}}=${fmt(ans)}$.` };
    } },
    combrep: { name: 'Сочетания с повторениями', make() {
      const [pl, item] = pick([['пирожные', 'пирожных'], ['булочки', 'булочек'], ['воздушные шары', 'шаров'], ['тетради', 'тетрадей']]);
      const n = R(3, 5), k = R(5, 8);
      return { text: `В магазине продаются ${pl} ${n} видов (предметы одного вида одинаковые). Сколькими способами можно купить ${k} ${item}?`, answer: C(n + k - 1, k),
        sol: `Порядок не важен, виды повторяются: $\\overline{C}_{${n}}^{${k}}=C_{${n + k - 1}}^{${k}}=\\dfrac{${n + k - 1}!}{${k}!\\,${n - 1}!}=${fmt(C(n + k - 1, k))}$ (${k} шариков и ${n - 1} перегородки).` };
    } },
  };

  window.initTrainer = function (host) {
    let on = new Set(Object.keys(GEN)), cur = null, ok = 0, tries = 0, answered = false;
    try { const s = JSON.parse(localStorage.getItem('komb-score') || '{}'); ok = s.ok || 0; tries = s.tries || 0; } catch (e) {}
    const save = () => { try { localStorage.setItem('komb-score', JSON.stringify({ ok, tries })); } catch (e) {} };
    const top = el('div', { class: 'trainer-top' });
    const score = el('span', { class: 'score' });
    const card = el('div', { class: 'tr-card' });
    host.append(top, card);
    Object.entries(GEN).forEach(([k, g]) => {
      const c = el('button', { class: 'chip on', onclick: () => { if (on.has(k) && on.size > 1) on.delete(k); else on.add(k); c.classList.toggle('on', on.has(k)); } }, g.name);
      top.append(c);
    });
    top.append(score);
    const upd = () => (score.innerHTML = `Верно: <b>${ok}</b> из ${tries}`);
    function next() {
      const key = pick([...on]); cur = { key, ...GEN[key].make() }; answered = false;
      card.innerHTML = '';
      const typeEl = el('div', { class: 'type' }, 'Тип задачи скрыт — определите сам');
      const inp = el('input', { inputmode: 'numeric', placeholder: 'Ответ' });
      const v = el('span', { class: 'verdict' });
      const sol = el('div', { style: { display: 'none', marginTop: '14px', padding: '14px 16px', background: '#DCE6FA', borderRadius: '14px' } });
      const check = () => {
        const val = inp.value.replace(/[\s  ]/g, '');
        if (!val) return;
        const good = Number(val) === cur.answer;
        if (!answered) { tries++; if (good) ok++; answered = true; save(); upd(); }
        v.className = 'verdict ' + (good ? 'ok' : 'no');
        v.textContent = good ? 'Верно!' : `Неверно. Правильный ответ: ${fmt(cur.answer)}`;
        showSol();
      };
      const showSol = () => { typeEl.textContent = GEN[cur.key].name; sol.style.display = 'block'; sol.innerHTML = '<b>Решение.</b> ' + cur.sol; tex(sol); };
      inp.addEventListener('keydown', (e) => e.key === 'Enter' && check());
      card.append(typeEl, el('div', { class: 'text' }, cur.text),
        el('div', { class: 'answer-row' }, inp, el('button', { class: 'btn', onclick: check }, 'Проверить'),
          el('button', { class: 'btn ghost', onclick: showSol }, 'Показать решение'), el('button', { class: 'btn or', onclick: next }, 'Следующая →'), v), sol);
      inp.focus({ preventScroll: true });
    }
    upd(); next();
  };
})();
