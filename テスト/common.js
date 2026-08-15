// ============================================================
// テストの共通部分
//
// screen.html を「ブラウザなしで」動かすための偽物のDOMを用意する。
// 5つのテストが同じ準備をしていたので、ここ1か所にまとめた（二重管理の解消）。
// ============================================================

const fs = require("fs");
const vm = require("vm");
const path = require("path");

// テストフォルダの1つ上に screen.html がある
const HTML = path.join(__dirname, "..", "screen.html");

// screen.html から <script> の中身（JavaScript）だけを取り出す
function readScript() {
  const src = fs.readFileSync(HTML, "utf8");
  return src.split("<script>")[1].split("</script>")[0];
}

// テストコードの前に必ず貼りつける小道具
const PRELUDE = `
  function ok(cond, msg){
    if (!cond) { ngCount = ngCount + 1; }
    console.log("   " + (cond ? "OK " : "★NG") + " " + msg);
  }
  function section(title){ console.log(""); console.log("■ " + title); }
  function fingersUp(n){ return (handHTML(n).match(/finger up/g) || []).length; }
  function buttonStates(){
    return ["btn-rr","btn-rl","btn-lr","btn-ll"]
      .map(id => el(id).disabled ? "無効" : "有効").join(" ");
  }
`;

// screen.html を動かしたうえで、続けて testCode を実行する。
//
// document は本物ではなく、下で作る偽物を渡す。
// screen.html 側のコードは「本物か偽物か」を区別できないので、そのまま動く。
// あとから el("board").innerHTML を覗けば、画面に何を書き込んだかが全部読める。
function runGame(testCode, extra) {
  const els = {};
  const el = id => (els[id] = els[id] || {
    innerHTML: "",
    textContent: "",
    disabled: false,
    className: "",
  });

  // 予約されたタイマー（CPUの「少し待ってから打つ」で使われる）
  const timers = [];

  const sandbox = Object.assign({
    document: { getElementById: el },   // ← 偽物のDOM
    console: console,
    el: el,
    ngCount: 0,      // ok() が失敗を数える場所
    result: null,    // テスト側から値を持ち帰りたいときに使う

    // setTimeout も Node の vm には無いので用意する。
    // ただし本物のように「待つ」のではなく、予約を溜めておくだけにする。
    // テストでは runTimers() で好きなタイミングに発火できる＝待ち時間ゼロで確かめられる
    setTimeout: function (fn, ms) { timers.push(fn); return timers.length; },
    runTimers: function () {
      let n = 0;
      while (timers.length > 0) { timers.shift()(); n++; }
      return n;
    },
    pendingTimers: function () { return timers.length; },
    clearTimers: function () { timers.length = 0; },
  }, extra || {});

  vm.runInNewContext(PRELUDE + readScript() + "\n" + testCode, sandbox);
  return sandbox;
}

// 結果をまとめて表示する。NGがあれば終了コード1（run-all.js が失敗を検知できる）
function finish(sandbox) {
  const ng = sandbox.ngCount || 0;
  console.log("");
  if (ng === 0) {
    console.log("  → 全部OK");
  } else {
    console.log("  → ★NGが " + ng + " 件");
    process.exitCode = 1;
  }
  return ng;
}

module.exports = { HTML, readScript, runGame, finish };
