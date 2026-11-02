// ============================================================
// テストの共通部分
//
// screen.html を「ブラウザなしで」動かすための偽物のDOMを用意する。
// どのテストも同じ準備をするので、ここ1か所にまとめている。
//
// 2026-11-02：シンプル版（タイトル・あそびかた・たいせんの3画面、手を押してたたく）に作り直したので、
// 偽物のDOMも作り直した。前の版のテストは git のコミット 0f6ca35 にある。
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
  var finished = null;   // テストの終わり（async の結果）。テスト側で入れる
  function ok(cond, msg){
    if (!cond) { ngCount = ngCount + 1; }
    console.log("   " + (cond ? "OK " : "★NG") + " " + msg);
  }
  function section(title){ console.log(""); console.log("■ " + title); }
  // 予約されたタイマーを全部動かし、続きの処理（await のあと）も最後まで走らせる。
  // たたく → 揺れる → 手番が変わる → CPU が考えて打つ、までを待ち時間ゼロで進める
  async function settle(){
    for (let i = 0; i < 300; i++) { await null; if (pendingTimers() > 0) runTimers(); }
  }
`;

// 偽物の部品。screen.html が使うものだけ、何もしない形で持たせる
function makeEl(id) {
  return {
    id: id, innerHTML: "", textContent: "", hidden: false, disabled: false, className: "", style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 0, height: 0 }; },
    animate() {}, append() {}, appendChild() {}, remove() {},
  };
}

// screen.html を動かすための入れ物（document・window・location・history・setTimeout の偽物）を作る
function makeSandbox(extra) {
  const els = {};
  const el = id => (els[id] = els[id] || makeEl(id));
  const timers = [];
  const location = { hash: "", pathname: "/screen.html", search: "" };
  const history = {
    state: null,
    // アドレスの # だけ覚える（画面の切りかえは # で決まる）
    pushState(state, title, url) { this.state = state; const i = url.indexOf("#"); location.hash = i >= 0 ? url.slice(i) : ""; },
    back() { backCount++; },
  };
  let backCount = 0;
  return Object.assign({
    document: {
      getElementById: el,
      querySelectorAll: () => [],
      createElement: () => makeEl(),
      body: makeEl("body"),
      execCommand() {},
    },
    window: { addEventListener() {}, scrollTo() {} },
    navigator: {},
    location: location,
    history: history,
    backCount: () => backCount,
    console: console,
    el: el,
    ngCount: 0,      // ok() が失敗を数える場所

    // setTimeout も Node の vm には無いので用意する。
    // 本物のように「待つ」のではなく、予約を溜めておくだけにする。
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
}

// screen.html を動かしたうえで、続けて testCode を実行する。
// document は本物ではなく、上で作る偽物を渡す。screen.html 側は「本物か偽物か」を区別できないので、そのまま動く。
// あとから el("board").innerHTML を覗けば、画面に何を書き込んだかが全部読める。
function runGame(testCode, extra) {
  const sandbox = makeSandbox(extra);
  vm.runInNewContext(PRELUDE + readScript() + "\n" + testCode, sandbox);
  return sandbox;
}

// 結果をまとめて表示する。NGがあれば終了コード1（run-all.js が失敗を検知できる）
// テストが async のときは、終わるのを待ってから数える
async function finish(sandbox) {
  if (sandbox.finished) await sandbox.finished;
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

module.exports = { HTML, readScript, makeSandbox, runGame, finish };
