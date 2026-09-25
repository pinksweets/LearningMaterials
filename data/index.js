/* ============================================================
   単元データの集約 — 旧 index.html の <script> 読み込み順を維持する。
   新しい data ファイルを追加したら、ここに import を1行足すこと。
============================================================ */
import * as s1 from "./s1_versailles.js";
import * as s2 from "./s2_asia.js";
import * as s3 from "./s3_eastasia.js";
import * as m1 from "./m1_suushiki.js";
import * as m2 from "./m2_shuugou.js";
import * as m3 from "./m3_nijikansuu.js";
import * as e1 from "./e1_harmony_wordorder.js";
import * as e2 from "./e2_harmony_tense.js";
import * as b1 from "./b1_visual_metabolism.js";
import * as b2 from "./b2_visual_enzymes.js";
import * as ec1 from "./ec1_denki_kairo1.js";
import * as ma1 from "./ma1_suugaku_a.js";
import * as lb1 from "./lb1_leap_basic.js";
import * as lb2 from "./lb2_leap_basic.js";
import * as lb3 from "./lb3_leap_basic.js";
import * as lb4 from "./lb4_leap_basic.js";
import * as lb5 from "./lb5_leap_basic.js";
import * as lbq from "./lbq_leap_basic.js";
import * as sep from "./sep_english.js";

import * as sep15 from "./sep15_english.js";
import * as sep16Ja from "./sep16_japanese.js";
import * as sep16Ma from "./sep16_math.js";
import * as sep16En from "./sep16_english.js";
import * as njz from "./njz_nijikansuu_zero.js";
import * as ecz from "./ecz_denki_kairo_zero.js";
import * as ch1 from "./ch1_midterm.js";

const MODULES = [s1, s2, s3, m1, m2, m3, e1, e2, b1, b2, ec1, ma1, lb1, lb2, lb3, lb4, lb5, lbq, sep, sep15, sep16Ja, sep16Ma, sep16En, njz, ecz, ch1];

/* 全単元（登録順） */
export const units = MODULES.flatMap(m => m.units);
/* HQ.registerCards による共有カード（現在は全ファイル未使用＝常に空） */
export const sharedCards = MODULES.flatMap(m => m.cards);
