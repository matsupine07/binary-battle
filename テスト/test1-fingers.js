// ============================================================
// テスト1：指の絵
//
// 1〜30 のどの数でも、
//   ・絵の中で立っている指
//   ・黄色く光る札（16・8・4・2・1）
//   ・数字の下の足し算の式
// が、二進数の桁とそろっているか。31 はたおれた手の絵になるか。
//
// 手の絵は pineさんが Piskel で描いた「指が全部立った手」1枚から作っている。
// 絵を描き直して指の場所（FINGERS）がずれると、ここで見つかる。
// ============================================================

const { runGame, finish } = require("./common");

const sandbox = runGame(`
  // 絵の中で、その指が立っているか：指の列の「関節より3段上」に、手の色（pineさんの絵の色）があるか
  const skin = new Set(Object.values(HAND_PAL));
  function raisedInArt(v, f) {
    const g = handGrid(v, false), y = f.base - 3 - BOX.y;
    for (let x = f.x0 - BOX.x; x <= f.x1 - BOX.x; x++) if (skin.has(g[y][x])) return true;
    return false;
  }
  const lit = v => (handHTML(v).match(/class="on"/g) || []).length;

  section("1〜30：絵・札・足し算が、二進数の桁とそろっている");
  const bad = [];
  for (let v = 1; v <= 30; v++) {
    const bits = FINGERS.filter(f => v & f.bit).map(f => f.bit);
    const art = FINGERS.filter(f => raisedInArt(v, f)).map(f => f.bit);
    const sum = bits.length > 1 ? bits.join("＋") : "";
    if (art.join() !== bits.join() || lit(v) !== bits.length || sumText(v) !== sum) bad.push(v);
  }
  ok(bad.length === 0, "30通り全部そろっている" + (bad.length ? "（ずれ：" + bad.join("・") + "）" : ""));

  section("目で見て分かる例");
  ok(sumText(13) === "8＋4＋1", "13 は 8＋4＋1");
  ok(lit(13) === 3, "13 は札が3つ光る");
  ok(sumText(16) === "", "16 は指1本なので、式を出さない");
  ok(lit(1) === 1 && raisedInArt(1, FINGERS[4]), "1 は親指だけ");

  section("折れた指の場所には、空っぽの枠（市松もよう）");
  ok(handGrid(1, false).flat().includes("#4a5380"), "1（親指だけ）のとき、枠がある");
  ok(!handGrid(31, false).flat().includes("#4a5380"), "全部の指が立っているときは、枠が無い");

  section("31：たおれた手");
  const colors = new Set(handGrid(31, true).flat().filter(Boolean));
  ok(![...colors].some(c => skin.has(c)), "手の色が残っていない（灰色になった）");
  ok(colors.has("#f4f4f4"), "包帯の白がある");
  ok(lit(31) === 0, "たおれた手の札は光らない");
  ok(sumText(31) === "たおれた", "式のかわりに「たおれた」");
`);

finish(sandbox);
