// Jalankan: node test.js
const assert = require('assert');
const { LEVELS, makeQuestion, PER_LEVEL } = require('./game.js');
const digits = n => String(n).length;
// [digit a, digit b] per level (level 1 = hitung benda)
const SHAPE = [null, [1, 1], [1, 1], [1, 1], [2, 1], [2, 1], [2, 2], [2, 2]];

LEVELS.forEach((L, lv) => {
  for (let r = 0; r < 1000; r++) for (let i = 0; i < PER_LEVEL; i++) {
    const q = makeQuestion(lv, i);
    assert(q.answer >= 0, `L${lv + 1} negatif`);
    assert(q.answer <= 99, `L${lv + 1} > 99`);
    assert.strictEqual(q.choices.length, 4);
    assert.strictEqual(new Set(q.choices).size, 4);
    assert(q.choices.includes(q.answer));
    assert(q.choices.every(c => c >= 0));
    if (lv === 0) { assert(q.count >= 1 && q.count <= 10); continue; }
    assert.strictEqual(q.answer, q.op === '+' ? q.a + q.b : q.a - q.b);
    assert(q.b >= 1, `L${lv + 1} b=0`);
    assert.deepStrictEqual([digits(q.a), digits(q.b)], SHAPE[lv], `L${lv + 1} ${q.a}${q.op}${q.b}`);
    if (lv === 1) assert(q.answer <= 10);
    if (i < 5 && lv >= 4) { // tanpa simpan/pinjam
      const oa = q.a % 10, ob = q.b % 10;
      assert(q.op === '+' ? oa + ob <= 9 : oa >= ob, `L${lv + 1} soal awal harus tanpa simpan/pinjam: ${q.a}${q.op}${q.b}`);
    }
  }
});
console.log('OK: semua level lulus');
