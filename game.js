// ===== Generator soal (dipakai juga oleh test.js) =====
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[rnd(0, arr.length - 1)];
const EMOJI = ['🍓', '🌸', '🦋', '🧁', '🎀', '🌷', '🍭', '⭐', '🐰', '👑'];
const PER_LEVEL = 10;

// i = nomor soal (0..9). Separuh akhir level 5-8 boleh menyimpan/meminjam.
function add(a, b, pic) { return { a, b, op: '+', answer: a + b, pic }; }
function sub(a, b, pic) { return { a, b, op: '-', answer: a - b, pic }; }

const LEVELS = [
  { name: 'Mengenal Angka', icon: '🌸', gen: () => { const n = rnd(1, 10); return { count: n, answer: n, pic: true }; } },
  { name: 'Tambah Bergambar', icon: '🍓', gen: () => { const a = rnd(1, 9); return add(a, rnd(1, 10 - a), true); } },
  { name: 'Tambah 1 Angka', icon: '🦋', gen: () => add(rnd(1, 9), rnd(1, 9), false) },
  { name: 'Kurang 1 Angka', icon: '🧁', gen: i => { const a = rnd(2, 9); return sub(a, rnd(1, a), i < 5); } },
  { name: 'Puluhan + Satuan', icon: '🎀', gen: i => {
      if (i >= 5) return add(rnd(10, 89), rnd(1, 9));
      const o = rnd(0, 8); return add(10 * rnd(1, 8) + o, rnd(1, 9 - o));
    } },
  { name: 'Puluhan − Satuan', icon: '🌷', gen: i => {
      if (i >= 5) return sub(rnd(10, 99), rnd(1, 9));
      const o = rnd(1, 9); return sub(10 * rnd(1, 9) + o, rnd(1, o));
    } },
  { name: 'Puluhan + Puluhan', icon: '🍭', gen: i => {
      if (i >= 5) { const a = rnd(10, 89); return add(a, rnd(10, 99 - a)); }
      const ta = rnd(1, 8), oa = rnd(0, 9);
      return add(10 * ta + oa, 10 * rnd(1, 9 - ta) + rnd(0, 9 - oa));
    } },
  { name: 'Puluhan − Puluhan', icon: '👑', gen: i => {
      if (i >= 5) { const a = rnd(20, 99); return sub(a, rnd(10, a - 1)); }
      const ta = rnd(1, 9), oa = rnd(0, 9);
      return sub(10 * ta + oa, 10 * rnd(1, ta) + rnd(0, oa));
    } },
];

function makeQuestion(level, i) {
  const q = LEVELS[level].gen(i);
  q.emoji = pick(EMOJI);
  const offs = q.answer < 10 ? [1, 2, 3] : [1, 2, 10];
  const set = new Set([q.answer]);
  while (set.size < 4) {
    const c = q.answer + pick(offs) * pick([-1, 1]);
    if (c >= 0) set.add(c);
  }
  q.choices = [...set].sort(() => Math.random() - 0.5);
  q.say = q.count ? 'Ada berapa gambar?' : `${q.a} ${q.op === '+' ? 'tambah' : 'kurang'} ${q.b}, sama dengan berapa?`;
  return q;
}

if (typeof module !== 'undefined') module.exports = { LEVELS, makeQuestion, PER_LEVEL };

// ===== Tampilan & alur game (hanya di browser) =====
if (typeof document !== 'undefined') {
  const $ = s => document.querySelector(s);
  const KEY = 'berhitung-stars';
  let stars = [];
  try { stars = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(stars)); } catch (e) {} };

  // --- suara ---
  let ac;
  function tone(freqs, type = 'sine', dur = 0.15) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, k) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + k * dur;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.8);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur * 2);
      });
    } catch (e) {}
  }
  const ding = () => tone([523, 659, 784, 1047], 'triangle', 0.1);
  const oops = () => tone([330, 262], 'sine', 0.2);
  function speak(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID'; u.rate = 0.9; u.pitch = 1.2;
    const v = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith('id'));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function confetti() {
    for (let k = 0; k < 24; k++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      d.textContent = pick(['🌸', '⭐', '💖', '✨', '🎀', '🦋']);
      d.style.left = rnd(0, 95) + 'vw';
      d.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 2000);
    }
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.hidden = s.id !== id);
  }

  // --- peta level ---
  function home() {
    const grid = $('#levels');
    grid.innerHTML = '';
    LEVELS.forEach((L, n) => {
      const open = n === 0 || stars[n - 1] > 0;
      const b = document.createElement('button');
      b.className = 'level' + (open ? '' : ' locked');
      b.innerHTML = `<span class="lv-icon">${open ? L.icon : '🔒'}</span>
        <span class="lv-num">Level ${n + 1}</span><span class="lv-name">${L.name}</span>
        <span class="lv-stars">${'⭐'.repeat(stars[n] || 0)}${'☆'.repeat(3 - (stars[n] || 0))}</span>`;
      b.onclick = () => open ? start(n) : (oops(), speak('Selesaikan level sebelumnya dulu ya'));
      grid.appendChild(b);
    });
    show('home');
  }

  // --- permainan ---
  let level, idx, wrong, q, busy;
  function start(n) { level = n; idx = 0; wrong = 0; show('game'); next(); }

  function picHTML(n, emoji, cls = '') {
    return `<span class="pics ${cls}">${Array.from({ length: n }, () => `<span>${emoji}</span>`).join('')}</span>`;
  }

  function next() {
    if (idx >= PER_LEVEL) return finish();
    q = makeQuestion(level, idx);
    busy = false;
    $('#progress').innerHTML = Array.from({ length: PER_LEVEL }, (_, k) =>
      `<span class="${k < idx ? 'done' : k === idx ? 'now' : ''}"></span>`).join('');
    let html;
    if (q.count) html = `<div class="ask">Ada berapa?</div>${picHTML(q.count, q.emoji, 'big')}`;
    else {
      const sym = q.op === '+' ? '+' : '−';
      html = `<div class="sum">${q.a} ${sym} ${q.b} = <span class="qm">?</span></div>`;
      if (q.pic && q.op === '+') html += `<div class="picrow">${picHTML(q.a, q.emoji)}<b>+</b>${picHTML(q.b, q.emoji)}</div>`;
      if (q.pic && q.op === '-') html += `<div class="picrow"><span class="pics">${
        Array.from({ length: q.a }, (_, k) => `<span class="${k >= q.a - q.b ? 'gone' : ''}">${q.emoji}</span>`).join('')}</span></div>`;
    }
    $('#question').innerHTML = html;
    $('#bubble').textContent = pick(['Ayo hitung! 💕', 'Kamu pasti bisa! ✨', 'Pilih jawabannya ya 🌸']);
    const box = $('#choices');
    box.innerHTML = '';
    q.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'choice'; b.textContent = c;
      b.onclick = () => answer(b, c);
      box.appendChild(b);
    });
    speak(q.say);
  }

  function answer(btn, c) {
    if (busy) return;
    if (c === q.answer) {
      busy = true;
      btn.classList.add('right');
      const p = pick(['Hebat!', 'Pintar sekali!', 'Betul!', 'Luar biasa!', 'Keren!']);
      $('#bubble').textContent = p + ' 🎉';
      const qm = $('.qm'); if (qm) qm.textContent = q.answer;
      ding(); confetti(); speak(p);
      idx++;
      setTimeout(next, 1600);
    } else {
      wrong++;
      btn.classList.add('wrong'); btn.disabled = true;
      $('#bubble').textContent = 'Coba lagi ya 💗';
      oops(); speak('Coba lagi ya');
    }
  }

  function finish() {
    const s = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
    stars[level] = Math.max(stars[level] || 0, s);
    save();
    $('#result-stars').textContent = '⭐'.repeat(s);
    $('#result-text').textContent = s === 3 ? 'Sempurna! Kamu hebat sekali!' : s === 2 ? 'Bagus sekali!' : 'Kamu berhasil! Ayo latihan lagi!';
    $('#btn-next').hidden = level + 1 >= LEVELS.length;
    show('result');
    ding(); confetti(); setTimeout(confetti, 600);
    speak($('#result-text').textContent);
  }

  $('#btn-back').onclick = home;
  $('#btn-speak').onclick = () => speak(q.say);
  $('#btn-again').onclick = () => start(level);
  $('#btn-next').onclick = () => start(level + 1);
  $('#btn-home').onclick = home;
  $('#btn-reset').onclick = () => {
    if (confirm('Hapus semua bintang dan mulai dari awal?')) { stars = []; save(); home(); }
  };
  if (window.speechSynthesis) speechSynthesis.getVoices(); // muat daftar suara lebih awal
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  home();
}
