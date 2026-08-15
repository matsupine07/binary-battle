// ============================================================
// シミュレーションの共通部分
//
// テスト（test*.js）は「今のゲームが正しく動くか」を調べるもの。
// シミュレーション（sim*.js）は「ルールを変えたらどうなるか」を調べるもの。
//
// ルールを変えて試したいので、screen.html 本体ではなく“作り直したコピー”を動かす。
// そのぶん、本物と同じ計算になっているかを最初に必ず確かめる（verify）。
// ============================================================

const vm = require("vm");
const { readScript } = require("./common");

// screen.html の本物の attack を取り出す（二進数モード＝上限31の状態）
function realAttack() {
  let fn = null;
  const els = {};
  const el = id => (els[id] = els[id] || {
    innerHTML: "", textContent: "", disabled: false, className: "",
  });
  vm.runInNewContext(readScript() + "\nsave(attack);", {
    document: { getElementById: el },
    console: console,
    save: f => (fn = f),
  });
  return fn;
}

// ★これが一番大事な一手★
// シミュレーターの計算が本物と1つでも違うと、
// 「シミュレーターのバグ」を「ゲームの性質」だと勘違いしてしまう。
// 全パターン突き合わせて、0件でなければその場で止める。
function verify() {
  const real = realAttack();
  const sim = (a, b) => (a + b > 31 ? a + b - 31 : a + b);
  let mismatch = 0;
  for (let a = 1; a <= 30; a++) {
    for (let b = 1; b <= 30; b++) {
      if (sim(a, b) !== real(a, b)) mismatch++;
    }
  }
  console.log("■ シミュレーターの検証");
  console.log("   screen.html の本物の attack と、全900通りで突き合わせ");
  console.log("   不一致: " + mismatch + " 件");
  if (mismatch > 0) {
    console.log("   ★一致しないので中止します");
    process.exit(1);
  }
  console.log("");
}

// ---- 1回ぶんの対局 --------------------------------------------------
//
//   max      … 死亡ライン（31＝二進数モード、5＝元ゲーム）
//   split    … 分割ルールを使うか
//   strategy … "random"（初心者）／"greedy"（殺せるなら殺す）／"smart"（＋狙える形を作る分割を優先）
//   cap      … 打ち切り手数。無限ループする対局があるので必須
//
function playGame(opts) {
  const max = opts.max;
  const split = opts.split || false;
  const strategy = opts.strategy || "random";
  const cap = opts.cap || 10000;

  const attack = (a, b) => (a + b > max ? a + b - max : a + b);
  const dead = v => v === max;

  let atk = { right: 1, left: 1 };
  let def = { right: 1, left: 1 };
  let turns = 0, splits = 0;

  while (turns < cap) {
    // ① 打てる手を全部並べる
    const moves = [];
    for (const my of ["right", "left"]) {
      for (const your of ["right", "left"]) {
        if (!dead(atk[my]) && !dead(def[your])) moves.push({ type: "attack", my, your });
      }
    }
    // 分割：両手とも生きているときだけ。合計は保つ。両手とも 1〜max-1。
    // 「今と同じ」「左右を入れ替えただけ」は盤面が実質変わらない＝パスになるので禁止
    if (split && !dead(atk.right) && !dead(atk.left)) {
      const S = atk.right + atk.left;
      for (let nr = 1; nr <= S - 1; nr++) {
        const nl = S - nr;
        if (nl < 1 || nr > max - 1 || nl > max - 1) continue;
        if (nr === atk.right && nl === atk.left) continue;
        if (nr === atk.left && nl === atk.right) continue;
        moves.push({ type: "split", nr, nl });
      }
    }

    // ② その中から1つ選ぶ
    let pick = null;
    if (strategy !== "random") {
      pick = moves.find(m => m.type === "attack" && attack(atk[m.my], def[m.your]) === max);
    }
    if (!pick && strategy === "smart") {
      const targets = ["right", "left"].filter(s => !dead(def[s])).map(s => def[s]);
      const good = moves.filter(m => m.type === "split"
        && [m.nr, m.nl].some(h => targets.some(d => attack(h, d) === max)));
      if (good.length) pick = good[Math.floor(Math.random() * good.length)];
    }
    if (!pick) pick = moves[Math.floor(Math.random() * moves.length)];

    // ③ 盤面を更新
    if (pick.type === "attack") def[pick.your] = attack(atk[pick.my], def[pick.your]);
    else { atk.right = pick.nr; atk.left = pick.nl; splits++; }
    turns++;

    // ④ 終了判定 → 手番交代
    if (dead(def.right) && dead(def.left)) return { turns, splits, decided: true };
    const t = atk; atk = def; def = t;
  }
  return { turns, splits, decided: false };   // 打ち切りに達した＝決着せず
}

// ---- まとめて回して集計する ------------------------------------------
function runMany(opts) {
  const games = opts.games || 20000;
  const decided = [];
  let totalTurns = 0, totalSplits = 0;

  for (let i = 0; i < games; i++) {
    const r = playGame(opts);
    totalTurns += r.turns;
    totalSplits += r.splits;
    if (r.decided) decided.push(r.turns);
  }

  decided.sort((a, b) => a - b);
  const at = p => decided[Math.floor(decided.length * p)];

  return {
    games: games,
    rate: decided.length / games,
    // 平均だけでなく中央値・上位5%も出す。
    // 平均は「ごく一部のすごく長い対局」に引っ張られるため
    avg: decided.length ? decided.reduce((s, v) => s + v, 0) / decided.length : 0,
    med: at(0.5),
    p95: at(0.95),
    longest: decided[decided.length - 1],
    splitRatio: totalTurns ? totalSplits / totalTurns : 0,
  };
}

// 1行に整形して表示する
function line(label, r, showSplit) {
  let s = "  " + label.padEnd(26)
    + " 決着率 " + (r.rate * 100).toFixed(2).padStart(7) + "%"
    + "   平均 " + r.avg.toFixed(1).padStart(6) + "手"
    + "   中央値 " + String(r.med === undefined ? "-" : r.med).padStart(4) + "手"
    + "   上位5% " + String(r.p95 === undefined ? "-" : r.p95).padStart(4) + "手〜";
  if (showSplit) s += "   分割 " + (r.splitRatio * 100).toFixed(1).padStart(5) + "%";
  console.log(s);
}

module.exports = { verify, playGame, runMany, line };
