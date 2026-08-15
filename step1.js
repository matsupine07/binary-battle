// 二進数バトル STEP 1：数字だけの最小版
// 課題1（2026-07-19 pine作・完成）：ゲームの開始状態を作って表示する

let person1 = {name:"A",right:1,left:1};
let person2 = {name:"B",right:1,left:1};
console.log(person1.name+"右手:"+person1.right)
console.log(person1.name+"左手:"+person1.left)
console.log(person2.name+"右手:"+person2.right)
console.log(person2.name+"左手:"+person2.left)

// 課題2（2026-07-19 pine作・完成）：攻撃を計算する関数 attack
// 攻撃する手の数 a と 攻撃される手の数 b を受け取り、合計を返す。
// 31を超えたら31を引く（早期リターンで先に特殊ケースを処理）。
function attack(a,b){
  if (a+b >31){return a+b-31}
  return a+b
}

// 課題3（2026-07-19 pine作・完成）：死亡判定。手の値が31なら死亡（true）。
// 比較 a===31 自体が true/false になるので、それをそのまま返す。
function isDead(a){return a===31}

// 課題4（2026-07-19 pine作・完成）：プレイヤーpの両手が両方死んでいたら負け（true）。
// isDead を右手・左手それぞれに使い、&&（かつ）でつなぐ。
// p は仮の箱。isLoser(person1) と呼ぶと p の中身が person1 になり、使い回せる。
function isLoser(p){return isDead(p.right) && isDead(p.left)}

// 課題5（2026-07-19 pine作・完成）：盤面表示を関数化。プレイヤー2人を受け取り4行表示。
// p1,p2 は仮の箱なので、中では person1 ではなく p1/p2 で呼ぶ（使い回せる）。返り値なし。
// 【2026-07-19 更新（STEP 2）】数字だけでなく、立っている指も表示するようにした。
// handToFingers(p1.right) は関数の返り値をその場で文字列連結の材料にしている
// （わざわざ変数に入れなくてよい）。表示例：A右手:13（薬指中指親指）
function showBoard(p1,p2){
  console.log(p1.name+"右手:"+p1.right+"（"+handToFingers(p1.right)+"）")
  console.log(p1.name+"左手:"+p1.left+"（"+handToFingers(p1.left)+"）")
  console.log(p2.name+"右手:"+p2.right+"（"+handToFingers(p2.right)+"）")
  console.log(p2.name+"左手:"+p2.left+"（"+handToFingers(p2.left)+"）")
}

// 課題6（2026-07-19 pine作・完成）：1回の攻撃を実際に盤面へ反映する（関数化前の1行練習）。
// 右辺が先に計算され（attack(3,2)=5）、その結果で左辺を上書きする。
// person1.right = 3
// person2.left = 2
// person2.left = attack(person1.right, person2.left)  → person2.left が 5 になる

// 課題7（2026-07-19 pine作・完成）：1手を処理する関数。
//
// 受け取る3つの箱は、中身の種類が全部ちがう：
//   attackerHand = 攻撃する手の「数値」（例 3）
//   target       = 攻撃される「プレイヤーそのもの」（例 person2）
//   targetHand   = どっちの手かを示す「文字」（例 "left"）
//
// target[targetHand] は角かっこ＝targetHandの「中身」(right/left)で手を選ぶ（ドットだと文字そのまま探して失敗）。
//
// 同じ target[targetHand] が2回出てくるが役割が違う（貯金通帳と同じ）：
//   = の左 … 書き込む場所（住所）
//   = の右 … 今の値を読む（中身）
// 右辺が先に計算されるので、attack には上書き前の今の手の数が渡る。
//
// 例：playTurn(3, person2, "left") で person2の左手が2のとき
//   person2["left"] = attack(3, 2) → 5 が代入される
// 例：attack(16,15)=31 は「31より大きい」ではないので31のまま → isDead(31) が true で手が死ぬ
// 【2026-07-19 更新】死んだ手のルールを実装（ガード節）。
// 修正前は死んだ手(31)を攻撃できてしまい、attack(1,31)=32→31引いて1 で復活するバグがあった。
//
// ガード節＝不正な状態を先に弾いて追い返す門番。
// ここでの return は「値を返す」ではなく「この関数をここで終わりにする」用途。
// 弾かれると最後の攻撃処理にたどり着かないので、攻撃が中止される。
//
// 注意：isDead に渡すのは targetHand（"left"という文字）ではなく
// target[targetHand]（その手の数値）。文字と31を比べても永遠にfalseになり、
// ガードが素通りしてしまうため。
function playTurn(attackerHand, target, targetHand){
  if (isDead(attackerHand)) {
    console.log("その手は死んでいるので攻撃できません")
    return
  }
  if (isDead(target[targetHand])) {
    console.log("その手は死んでいるので攻撃できません")
    return
  }
  target[targetHand] = attack(attackerHand, target[targetHand])
}

// 課題8（2026-07-19 pine実行・成功）：初めて全部品を連携させて動かした。
// ブラウザのコンソール(F12)で実行 → Bの左手が 1 → 2 に更新されるのを確認。
// （showBoard は返り値なしのため、コンソール最終行に undefined と出るがエラーではない）
// showBoard(person1, person2)
// playTurn(person1.right, person2, "left")
// showBoard(person1, person2)

// 課題10〜11（2026-07-19 動作確認済み）：繰り返しで自動対戦させる。
//
// while版は無限ループになるので不採用：
//   while (!isLoser(person2)) { ... } は左手しか攻撃しないため、
//   右手が1のまま生き続けて isLoser が永遠に false → 止まらない。
//   さらに左手が31になった後も attack(1,31)=32→31引いて1 と復活してしまう
//   （「死んだ手は攻撃対象にできない」が未実装のため）。
//
// for版なら「最大10回」で必ず終わるので安全（安全装置）。
// break はループそのものを抜ける命令（continue は今回の周だけスキップ）。
// 決着後も攻撃を続けないために break が必要。
//
// person1 = {name:"A",right:1,left:1};   ← リセットしてから実行
// person2 = {name:"B",right:1,left:1};
// for (let i = 0; i < 10; i++) {
//   playTurn(person1.right, person2, "left")
//   showBoard(person1, person2)
//   if (isLoser(person2)) {
//     console.log("Bの負け")
//     break
//   }
// }

// 課題12（2026-07-19 動作確認済み）：手番交代。AとBが交互に攻撃する。
//
// attacker / defender という変数で「今の攻撃者・防御者」を持ち、1手ごとに入れ替える。
// attacker には person1 の「コピー」ではなく person1 そのものが入る（あだ名のようなもの）。
// playTurn を具体名でなく attacker/defender で書くので、誰の番かで自動的に相手が変わる。
//
// 入れ替え（スワップ）に temp が必要な理由：
//   temp = temporary（一時的な）の略。ゲームのルールとは無関係な、使い捨ての作業台。
//   temp なしで attacker = defender; defender = attacker; と書くと、
//   1行目で attacker に入っていた person1 が上書きされて消え、両方 person2 になる事故になる。
//   コップの水を入れ替えるとき、空のコップに一度避難させるのと同じ。
//
// person1 = {name:"A",right:1,left:1};
// person2 = {name:"B",right:1,left:1};
// let attacker = person1;
// let defender = person2;
// for (let i = 0; i < 20; i++) {
//   console.log("--- " + attacker.name + "の番 ---");
//   playTurn(attacker.right, defender, "left");
//   showBoard(person1, person2);
//   if (isLoser(defender)) {
//     console.log(defender.name + "の負け");
//     break;
//   }
//   let temp = attacker;
//   attacker = defender;
//   defender = temp;
// }

// ===== STEP 2（2026-07-19 動作確認済み）：数値を指の形に変換する =====
//
// 親指1 / 人差し指2 / 中指4 / 薬指8 / 小指16。どの数も指の組み合わせで一意に表せる（二進数の性質）。
// 例：13 = 8+4+1 → 薬指・中指・親指／20 = 16+4 → 小指・中指／31 = 全部の指（＝死亡の値）
//
// やり方は「大きい指から順に、引けるなら引く」。人間が暗算する手順そのまま。
// fingers は「配列の中にオブジェクト」という形（記事33の配列＋記事34のオブジェクトの組み合わせ）。
// fingers[i].value は 角かっこ（i番目を取り出す）＋ドット（その中のvalue）の合わせ技。
// rest は残り。20なら 20→4→0 と減り、ちょうど0になる＝ぴったり表現できた証拠。
// なお n=0 のときは空文字が返る（今のルールでは起きないケース）。
function handToFingers(n){
  const fingers = [
    {name:"小指", value:16},
    {name:"薬指", value:8},
    {name:"中指", value:4},
    {name:"人差し指", value:2},
    {name:"親指", value:1}
  ];
  let rest = n;
  let result = "";
  for (let i = 0; i < fingers.length; i++) {
    if (rest >= fingers[i].value) {
      result = result + fingers[i].name;
      rest = rest - fingers[i].value;
    }
  }
  return result;
}

// ===== STEP 1 続き（2026-07-19 動作確認済み）：手をランダムに選ぶ =====
//
// Math.random() … 0以上1未満のランダムな小数を返す（フローチャットの makeId でも使われていた）
// * 2           … 0.0〜1.999 になる
// Math.floor()  … 小数点以下を切り捨て（floor=床）。結果は 0 か 1
// hands[...]    … 出た0か1を配列の添字として使う。0→"right"、1→"left"
// 例：0.83 → 1.66 → 1 → hands[1] → "left"
function randomHand(){
  const hands = ["right", "left"];
  return hands[Math.floor(Math.random() * 2)];
}

// ===== 完成版の対戦ループ（2026-07-19 動作確認済み）=====
//
// attacker[myHand] … 角かっこで、ランダムに決まった手（"right"/"left"）を選ぶ。
//                    前は attacker.right 固定だったので永遠に決着しなかった。
// for 100回        … ランダムだと決着まで手数がかかるため20→100に。100回で必ず止まる（安全装置）。
// 決着がつかない場合は「〜の勝ち」が出ないまま100周して終わる（引き分けメッセージは未実装）。
//
// person1 = {name:"A",right:1,left:1};
// person2 = {name:"B",right:1,left:1};
// let attacker = person1;
// let defender = person2;
// for (let i = 0; i < 100; i++) {
//   const myHand = randomHand();
//   const yourHand = randomHand();
//   console.log("--- " + attacker.name + "の番 ---");
//   playTurn(attacker[myHand], defender, yourHand);
//   showBoard(person1, person2);
//   if (isLoser(defender)) {
//     console.log(defender.name + "の負け！ " + attacker.name + "の勝ち！");
//     break;
//   }
//   const temp = attacker;
//   attacker = defender;
//   defender = temp;
// }

// 課題9（2026-07-19 pine作・完成）：攻撃後に勝敗を判定する。
// isLoser は「呼ぶ」必要がある（かっこなしの isLoser だと関数そのものを指し、常に真になる静かなバグ）。
// かっこは内側から順に閉じる： if ( isLoser( person2 ) ) {
// playTurn(person1.right, person2, "left")
// if (isLoser(person2)){
//   console.log("Bの負け")
// }
