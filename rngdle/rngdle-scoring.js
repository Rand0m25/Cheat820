/* rngdle-scoring.js - self-contained port of RNGdle scoring (auto-generated). */
(function(){
'use strict';

var NT = {};

function _hlz(e){return e.length>1&&'0'===e[0]}
function _hmd(e){return e.some(e=>e.length>=2)}
function _isc(e){let t=[...e].sort((e,t)=>e-t);for(let e=1;e<t.length;e++)if(t[e]-t[e-1]!=1)return!1;return!0}
function _runSeed(e,t,i,r,a,s){let n=[r],o=[t],c=t+i,d=[e.slice(t,t+i)];for(let t=1;t<s;t++){let i=r+t*a;if(i<0)return null;let s=i.toString();if(c+s.length>e.length)return null;let l=e.slice(c,c+s.length);if(l!==s)return null;n.push(i),o.push(c),d.push(l),c+=s.length}return _hmd(d)?{numbers:n,splits:o,start:t,end:c}:null}
function _nadjScan(e,t,i){if(t<2)return null;for(let r=1;r<=e.length-i-(t-1);r++){let a=e.slice(i,i+r);if(_hlz(a))continue;let s=parseInt(a,10),n=_runSeed(e,i,r,s,1,t);if(n)return n;let o=_runSeed(e,i,r,s,-1,t);if(o)return o}return null}

  NT.isPrime = function(e){if(e<=1)return!1;if(e<=3)return!0;if(e%2==0||e%3==0)return!1;let t=Math.sqrt(e);for(let i=5;i<=t;i+=6)if(e%i==0||e%(i+2)==0)return!1;return!0};
  NT.sumDigits = function(e){let t=0,i=e;for(;i>0;)t+=i%10,i=Math.floor(i/10);return t};
  NT.isPalindrome = function(e){let t=e.length,i=Math.floor(t/2);for(let r=0;r<i;r++)if(e[r]!==e[t-1-r])return!1;return!0};
  NT.hasSequence = function(e,t,i=!0){if(e.length<t||t<=0)return!1;for(let r=0;r<=e.length-t;r++){let a=e.charCodeAt(r);if(i){let i=!0;for(let s=1;s<t;s++)if(e.charCodeAt(r+s)!==a+s){i=!1;break}if(i)return!0}else{let i=e.charCodeAt(r+1)-a;if(1===i||-1===i){let s=!0;for(let n=1;n<t;n++)if(e.charCodeAt(r+n)!==a+n*i){s=!1;break}if(s)return!0}}}return!1};
  NT.isSquare = function(e){if(e<0)return!1;let t=Math.sqrt(e);return t===Math.floor(t)};
  NT.isCube = function(e){if(e<0)return!1;let t=Math.round(Math.cbrt(e));return t*t*t===e};
  NT.isPerfectPower = function(e,t){return!(e<0)&&(0===e||1===e||Math.pow(Math.round(Math.pow(e,1/t)),t)===e)};
  NT.isFibonacci = function(e){if(e<0)return!1;return NT.isSquare(5*e*e+4)||NT.isSquare(5*e*e-4)};
  NT.isPronic = function(e){if(e<0)return!1;let t=(-1+Math.sqrt(1+4*e))/2;return t===Math.floor(t)};
  NT.getDigitCounts = function(e){let t=new Map;for(let i of e)t.set(i,(t.get(i)??0)+1);return t};
  NT.productDigits = function(e){let t=1,i=e;if(0===e)return 0;for(;i>0;){let e=i%10;if(0===e)return 0;t*=e,i=Math.floor(i/10)}return t};
  NT.isBinaryOnly = function(e){return/^[01]+$/.test(e)};
  NT.isHarshad = function(e){if(0===e)return!1;let t=NT.sumDigits(e);return 0!==t&&e%t==0};
  NT.areDigitsContiguous = function(e,t,i){let r=t.repeat(i);return e.includes(r)};
  NT.hasEvenSpacing = function(e){if(e.length<2)return!1;let t=e.split('').map(e=>parseInt(e,10)),i=t[1]-t[0];for(let e=2;e<t.length;e++)if(t[e]-t[e-1]!==i)return!1;return!0};
  NT.isOrderedSequence = function(e){if(e.length<2)return!0;let t=!0,i=!0;for(let r=1;r<e.length;r++)e[r]>=e[r-1]&&(i=!1),e[r]<=e[r-1]&&(t=!1);return t||i};
  NT.findConsecutivePairExact = function(e){for(let t=1;t<e.length;t++){let i=e.slice(0,t),r=e.slice(t);if(_hlz(i)||_hlz(r)||!_hmd([i,r]))continue;let a=parseInt(i,10),s=parseInt(r,10);if(1===Math.abs(a-s))return{numbers:[a,s],splits:[0,t]}}return null};
  NT.findConsecutiveTripleExact = function(e){for(let t=1;t<e.length-1;t++)for(let i=t+1;i<e.length;i++){let r=[e.slice(0,t),e.slice(t,i),e.slice(i)];if(r.some(e=>_hlz(e))||!_hmd(r))continue;let a=r.map(e=>parseInt(e,10));if(_isc(a))return{numbers:a,splits:[0,t,i]}}return null};
  NT.findConsecutiveQuadExact = function(e){for(let t=1;t<e.length-2;t++)for(let i=t+1;i<e.length-1;i++)for(let r=i+1;r<e.length;r++){let a=[e.slice(0,t),e.slice(t,i),e.slice(i,r),e.slice(r)];if(a.some(e=>_hlz(e))||!_hmd(a))continue;let s=a.map(e=>parseInt(e,10));if(_isc(s))return{numbers:s,splits:[0,t,i,r]}}return null};
  NT.findConsecutivePairAdjacent = function(e){for(let t=0;t<e.length;t++)for(let i=1;i<=e.length-t-1;i++){let r=e.slice(t,t+i);if(_hlz(r))continue;let a=parseInt(r,10);for(let s of[a+1,a-1]){if(s<0)continue;let n=s.toString(),o=t+i+n.length;if(o>e.length)continue;let c=e.slice(t+i,o);if(c===n&&_hmd([r,c])){if(0===t&&o===e.length)continue;return{numbers:[a,s],splits:[t,t+i],start:t}}}}return null};
  NT.findConsecutivePairNearby = function(e){let t=[];for(let i=0;i<e.length;i++)for(let r=1;r<=e.length-i;r++){let a=e.slice(i,i+r);_hlz(a)||t.push({value:parseInt(a,10),start:i,end:i+r,str:a})}for(let e=0;e<t.length;e++)for(let i=e+1;i<t.length;i++){let r=t[e],a=t[i];if(1===Math.abs(r.value-a.value)&&_hmd([r.str,a.str])&&(!(r.end>a.start)&&!(a.end>r.start)||r.end<=a.start||a.end<=r.start)&&r.end!==a.start&&a.end!==r.start)return{a:r,b:a}}return null};
  NT.findConsecutiveNAdjacent = function(e,t){for(let i=0;i<e.length;i++){let r=_nadjScan(e,t,i);if(r){if(0===r.start&&r.end===e.length)continue;return r}}return null};
  NT.isScrambledSequence = function(e,t){if(e.length<t)return!1;let i=e.split('').map(Number).sort((e,t)=>e-t);for(let e=1;e<i.length;e++)if(i[e]!==i[e-1]+1)return!1;return!0};


var RARITY_THRESHOLDS = {common:1e3,uncommon:1e4,rare:1e5,epic:1e6,anomaly:1e7};
function rarityForScore(score){
  if(score>=RARITY_THRESHOLDS.anomaly)return 'anomaly';
  if(score>=RARITY_THRESHOLDS.epic)return 'epic';
  if(score>=RARITY_THRESHOLDS.rare)return 'rare';
  if(score>=RARITY_THRESHOLDS.uncommon)return 'uncommon';
  if(score>=RARITY_THRESHOLDS.common)return 'common';
  return 'trash';
}


var BADGE_DEFINITIONS = [
  {id:"PRIME",label:"Prime Number",description:"Divisible only by 1 and itself.",emoji:"\ud83d\udc8e",family:null,score:Number("1274"),probability:"7.8%",check:(e,i)=>NT.isPrime(e)},
  {id:"PALINDROME",label:"Palindrome",description:"Reads the same forwards and backwards.",emoji:"\ud83e\ude9e",family:null,score:Number("50025"),probability:"0.20%",check:(e,i)=>NT.isPalindrome(i)},
  {id:"HEAVY",label:"Heavy",description:"The sum of its digits exceeds 45.",emoji:"\ud83e\uddf1",family:null,score:Number("33300"),probability:"0.30%",check:(e,i)=>NT.sumDigits(e)>45},
  {id:"VOID",label:"Void",description:"Contains no zeros.",emoji:"\ud83d\udd73\ufe0f",family:null,score:Number("167"),probability:"59.8%",check:(e,t)=>!t.includes("0")},
  {id:"NICE",label:"Nice",description:"Contains the number 69.",emoji:"\ud83d\ude0f",family:"NICE",score:Number("2024"),probability:"4.9%",check:(e,i)=>i.includes('69')},
  {id:"NICE_EXACT",label:"Exact Nice",description:"Exactly \"69\".",emoji:"\ud83d\ude0f",family:"NICE",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='69'},
  {id:"EVEN",label:"Even",description:"Divisible by 2.",emoji:"\u2696\ufe0f",family:null,score:Number("200"),probability:"50.0%",check:(e,t)=>e%2==0},
  {id:"ODD",label:"Odd",description:"Not divisible by 2.",emoji:"\ud83e\udd84",family:null,score:Number("200"),probability:"50.0%",check:(e,t)=>e%2==1},
  {id:"FEATHER",label:"Feather",description:"The sum of its digits is less than 15.",emoji:"\ud83e\udeb6",family:null,score:Number("2667"),probability:"3.8%",check:(e,i)=>15>NT.sumDigits(e)},
  {id:"CLEAN",label:"Clean",description:"Ends in a zero.",emoji:"\ud83e\uddfc",family:null,score:Number("1e3"),probability:"10.0%",check:(e,t)=>t.endsWith("0")},
  {id:"SEMI_CLEAN",label:"Semi-Clean",description:"Ends in a 5.",emoji:"\ud83e\uddf9",family:null,score:Number("1e3"),probability:"10.0%",check:(e,t)=>t.endsWith("5")},
  {id:"CENTURY",label:"Century",description:"Ends in double zeros.",emoji:"\ud83d\udcaf",family:null,score:Number("1e4"),probability:"1.00%",check:(e,t)=>t.endsWith("00")},
  {id:"MILLENNIUM",label:"Millennium",description:"Ends in triple zeros.",emoji:"\ud83d\uddd3\ufe0f",family:null,score:Number("1e5"),probability:"0.10%",check:(e,t)=>t.endsWith("000")},
  {id:"DOZEN",label:"Dozen",description:"Divisible by 12.",emoji:"\ud83c\udf69",family:null,score:Number("1200"),probability:"8.3%",check:(e,t)=>e>0&&e%12==0},
  {id:"LUCKY_SEVEN_DIV",label:"Lucky Seven (Divisible)",description:"Divisible by 7.",emoji:"\ud83c\udfb0",family:null,score:Number("700"),probability:"14.3%",check:(e,t)=>e>0&&e%7==0},
  {id:"ELEVEN",label:"Eleven",description:"Divisible by 11.",emoji:"\ud83d\udd5a",family:null,score:Number("1100"),probability:"9.1%",check:(e,t)=>e>0&&e%11==0},
  {id:"GROUNDED",label:"Grounded",description:"The first digit is smaller than the last.",emoji:"\u2693",family:null,score:Number("250"),probability:"40.0%",check:(e,t)=>{if(t.length<2)return!1;let i=t[0],r=t[t.length-1];return!!i&&!!r&&i<r}},
  {id:"LIFTOFF",label:"Liftoff",description:"The first digit is larger than the last.",emoji:"\ud83d\ude80",family:null,score:Number("200"),probability:"50.0%",check:(e,t)=>{if(t.length<2)return!1;let i=t[0],r=t[t.length-1];return!!i&&!!r&&i>r}},
  {id:"EQUILIBRIUM",label:"Equilibrium",description:"The first and last digits are identical.",emoji:"\ud83e\uddd8",family:"EQUILIBRIUM",score:Number("1e3"),probability:"10.0%",check:(e,t)=>{if(t.length<2)return!1;let i=t[0],r=t[t.length-1];return!!i&&!!r&&i===r}},
  {id:"TURTLE",label:"Turtle",description:"All consecutive digits differ by at most 1.",emoji:"\ud83d\udc22",family:"PROGRESSION",score:Number("36049"),probability:"0.28%",check:(e,t)=>{if(t.length<2)return!1;for(let e=1;e<t.length;e++)if(Math.abs(parseInt(t[e],10)-parseInt(t[e-1],10))>1)return!1;return!0}},
  {id:"FIREFLY",label:"Firefly",description:"One unique digit among identical others.",emoji:"\ud83e\udeb2",family:"DUALITY",score:Number("82237"),probability:"0.12%",check:(e,t)=>{if(t.length<4)return!1;let i=new Map;for(let e of t)i.set(e,(i.get(e)??0)+1);if(2!==i.size)return!1;let r=[...i.values()];return 1===r[0]||1===r[1]}},
  {id:"ECHO",label:"Echo",description:"The first half repeats as the second half.",emoji:"\ud83d\udce3",family:null,score:Number("100100"),probability:"0.10%",check:(e,t)=>{if(t.length<2||t.length%2!=0)return!1;let i=t.length/2;return t.slice(0,i)===t.slice(i)}},
  {id:"SANDWICH",label:"Sandwich",description:"First and last digits match, with at least one different digit between them.",emoji:"\ud83e\udd6a",family:"EQUILIBRIUM",score:Number("1e3"),probability:"10.0%",check:(e,t)=>{if(t.length<3)return!1;let i=t[0],r=t[t.length-1];if(!i||!r||i!==r)return!1;for(let e=1;e<t.length-1;e++)if(t[e]!==i)return!0;return!1}},
  {id:"BOOKENDS",label:"Bookends",description:"The first two digits match the last two.",emoji:"\ud83d\udcda",family:"BOOKENDS",score:Number("10010"),probability:"1.00%",check:(e,t)=>!(t.length<4)&&t.slice(0,2)===t.slice(-2)},
  {id:"ASCENSION",label:"Ascension",description:"Every digit is strictly larger than the previous.",emoji:"\ud83d\udcc8",family:"MONOTONIC",score:Number("219298"),probability:"0.05%",check:(e,t)=>{if(t.length<2)return!1;for(let e=1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||i<=r)return!1}return!0}},
  {id:"DECAY",label:"Decay",description:"Every digit is strictly smaller than the previous.",emoji:"\ud83d\udcc9",family:"MONOTONIC",score:Number("119474"),probability:"0.08%",check:(e,t)=>{if(t.length<2)return!1;for(let e=1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||i>=r)return!1}return!0}},
  {id:"CASCADE",label:"Cascade",description:"Every digit increases by exactly 1 from the previous.",emoji:"\ud83c\udf0a",family:"PROGRESSION",score:Number("3333337"),probability:"0.0030%",check:(e,t)=>{if(t.length<2)return!1;for(let e=1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||parseInt(i,10)!==parseInt(r,10)+1)return!1}return!0}},
  {id:"WATERFALL",label:"Waterfall",description:"Every digit decreases by exactly 1 from the previous.",emoji:"\ud83d\udebf",family:"PROGRESSION",score:Number("2857146"),probability:"0.0035%",check:(e,t)=>{if(t.length<2)return!1;for(let e=1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||parseInt(i,10)!==parseInt(r,10)-1)return!1}return!0}},
  {id:"MOUNTAIN",label:"Mountain",description:"Digits ascend to a peak and then descend.",emoji:"\ud83c\udfd4\ufe0f",family:"PEAK",score:Number("5885"),probability:"1.7%",check:(e,t)=>{if(t.length<3)return!1;let i=-1;for(let e=1;e<t.length-1;e++){let r=t[e],a=t[e-1],s=t[e+1];if(r&&a&&s&&r>a&&r>s){i=e;break}}if(-1===i)return!1;for(let e=1;e<=i;e++){let i=t[e],r=t[e-1];if(!i||!r||i<=r)return!1}for(let e=i+1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||i>=r)return!1}return!0}},
  {id:"VALLEY",label:"Valley",description:"Digits descend to a trough and then ascend.",emoji:"\ud83c\udfdc\ufe0f",family:"PEAK",score:Number("4199"),probability:"2.4%",check:(e,t)=>{if(t.length<3)return!1;let i=-1;for(let e=1;e<t.length-1;e++){let r=t[e],a=t[e-1],s=t[e+1];if(r&&a&&s&&r<a&&r<s){i=e;break}}if(-1===i)return!1;for(let e=1;e<=i;e++){let i=t[e],r=t[e-1];if(!i||!r||i>=r)return!1}for(let e=i+1;e<t.length;e++){let i=t[e],r=t[e-1];if(!i||!r||i<=r)return!1}return!0}},
  {id:"HILLS",label:"Hills",description:"Digits strictly alternate between rising and falling.",emoji:"\ud83c\udfde\ufe0f",family:null,score:Number("733"),probability:"13.6%",check:(e,t)=>{if(t.length<4)return!1;for(let e=1;e<t.length;e++)if(t[e]===t[e-1])return!1;for(let e=2;e<t.length;e++){let i=parseInt(t[e-2],10),r=parseInt(t[e-1],10),a=parseInt(t[e],10),s=r-i,n=a-r;if(s>0&&n>0||s<0&&n<0)return!1}return!0}},
  {id:"MINI_ECHO",label:"Mini Echo",description:"Contains an adjacent 2-digit repeat.",emoji:"\ud83d\udd02",family:"REPEAT",score:Number("3704"),probability:"2.7%",check:(e,t)=>{if(t.length<4)return!1;for(let e=0;e<=t.length-4;e++)if(t.slice(e,e+2)===t.slice(e+2,e+4))return!0;return!1}},
  {id:"RHYME",label:"Rhyme",description:"Contains the same 2+ digit substring twice.",emoji:"\ud83c\udfb6",family:"REPEAT",score:Number("1872"),probability:"5.3%",check:(e,t)=>{if(t.length<4)return!1;for(let e=2;e<=Math.floor(t.length/2);e++)for(let i=0;i<=t.length-e;i++){let r=t.slice(i,i+e);if(-1!==t.indexOf(r,i+e))return!0}return!1}},
  {id:"CONTIGUOUS_TRIPS",label:"Contiguous Trips",description:"Three identical consecutive digits.",emoji:"\u2796",family:"CONTIGUOUS_RUN",score:Number("2784"),probability:"3.6%",check:(e,t)=>{if(t.length<3)return!1;for(let e=0;e<=t.length-3;e++){let i=t[e],r=t[e+1],a=t[e+2];if(i&&r&&a&&i===r&&i===a)return!0}return!1}},
  {id:"CONTIGUOUS_QUADS",label:"Contiguous Quads",description:"Four identical consecutive digits.",emoji:"\u2796\u2796",family:"CONTIGUOUS_RUN",score:Number("37023"),probability:"0.27%",check:(e,t)=>{if(t.length<4)return!1;for(let e=0;e<=t.length-4;e++){let i=t[e],r=t[e+1],a=t[e+2],s=t[e+3];if(i&&r&&a&&s&&i===r&&i===a&&i===s)return!0}return!1}},
  {id:"CONTIGUOUS_FIVES",label:"Contiguous Fives",description:"Five identical consecutive digits.",emoji:"\u2796\u2796\u2796",family:"CONTIGUOUS_RUN",score:Number("552487"),probability:"0.02%",check:(e,t)=>{if(t.length<5)return!1;for(let e=0;e<=t.length-5;e++){let i=t[e],r=t[e+1],a=t[e+2],s=t[e+3],n=t[e+4];if(i&&r&&a&&s&&n&&i===r&&i===a&&i===s&&i===n)return!0}return!1}},
  {id:"CONTIGUOUS_SIXES",label:"Contiguous Sixes",description:"Six identical consecutive digits.",emoji:"\u2796\u2796\u2796\u2796",family:"CONTIGUOUS_RUN",score:Number("0x98968a"),probability:"0.0010%",check:(e,t)=>{if(t.length<6)return!1;for(let e=0;e<=t.length-6;e++){let i=t[e],r=t[e+1],a=t[e+2],s=t[e+3],n=t[e+4],o=t[e+5];if(i&&r&&a&&s&&n&&o&&i===r&&i===a&&i===s&&i===n&&i===o)return!0}return!1}},
  {id:"BINARY_SOUL",label:"Binary Soul",description:"Only 0s and 1s.",emoji:"\ud83e\udd16",family:null,score:Number("1538463"),probability:"0.0065%",check:(e,i)=>NT.isBinaryOnly(i)},
  {id:"DUALITY",label:"Duality",description:"Uses exactly two different digits.",emoji:"\u262f\ufe0f",family:"DUALITY",score:Number("21654"),probability:"0.46%",check:(e,t)=>2===new Set(t).size},
  {id:"TRINITY",label:"Trinity",description:"Uses exactly three different digits.",emoji:"\u269c\ufe0f",family:null,score:Number("1265"),probability:"7.9%",check:(e,t)=>3===new Set(t).size},
  {id:"QUARTET",label:"Quartet",description:"Uses exactly four different digits.",emoji:"\ud83c\udfbb",family:null,score:Number("290"),probability:"34.5%",check:(e,t)=>4===new Set(t).size},
  {id:"HETEROGENEOUS",label:"Heterogeneous",description:"No repeated digits.",emoji:"\ud83e\udd57",family:null,score:Number("593"),probability:"16.9%",check:(e,t)=>new Set(t).size===t.length},
  {id:"HOMOGENEOUS",label:"Homogeneous",description:"All digits are the same.",emoji:"\ud83e\udd5b",family:null,score:Number("2222224"),probability:"0.0045%",check:(e,t)=>{if(t.length<2)return!1;let i=t[0];return!!i&&t.split("").every(e=>e===i)}},
  {id:"ALTERNATOR",label:"Alternator",description:"Digits strictly alternate between even and odd.",emoji:"\u26a1",family:null,score:Number("2845"),probability:"3.5%",check:(e,t)=>{if(t.length<2)return!1;let i=parseInt(t[0],10)%2==1;for(let e=0;e<t.length;e++){let r=t[e];if(!r||parseInt(r,10)%2==1!=(e%2==0===i))return!1}return!0}},
  {id:"ZIPPER",label:"Zipper",description:"Two digits alternating perfectly.",emoji:"\ud83e\udd10",family:null,score:Number("246914"),probability:"0.04%",check:(e,t)=>{if(t.length<2||2!==new Set(t).size)return!1;for(let e=1;e<t.length;e++)if(t[e]===t[e-1])return!1;return!0}},
  {id:"HOPSCOTCH",label:"Hopscotch",description:"A digit appears at every other position (2 times).",emoji:"\ud83e\udd98",family:"HOPSCOTCH",score:Number("312"),probability:"32.0%",check:(e,t)=>{if(t.length<3||new Set(t).size<2)return!1;for(let e=0;e<=t.length-3;e++){let i=t[e];if(t[e+2]===i){let r=t.length>e+4&&t[e+4]===i,a=e>=2&&t[e-2]===i;if(!r&&!a)return!0}}return!1}},
  {id:"DOUBLE_HOP",label:"Double Hop",description:"A digit appears at every other position (3 times).",emoji:"\ud83e\udd98\ud83e\udd98",family:"HOPSCOTCH",score:Number("5321"),probability:"1.9%",check:(e,t)=>{if(t.length<5||new Set(t).size<2)return!1;for(let e=0;e<=t.length-5;e++){let i=t[e];if(t[e+2]===i&&t[e+4]===i)return!0}return!1}},
  {id:"FRAMED_PAIR",label:"Framed Pair",description:"A 4-digit number where the middle two digits match each other but differ from both end digits.",emoji:"\ud83d\uddbc\ufe0f",family:"PAIRS",score:Number("137174"),probability:"0.07%",check:(e,t)=>{if(4!==t.length)return!1;let i=t[0],r=t[1],a=t[2],s=t[3];return r===a&&i!==r&&s!==r}},
  {id:"FRAMED_TRIPLE",label:"Framed Triple",description:"A triple in the middle, bookended by different digits.",emoji:"\ud83d\uddbc\ufe0f\ud83d\uddbc\ufe0f",family:"OF_A_KIND",score:Number("137174"),probability:"0.07%",check:(e,t)=>{if(5!==t.length)return!1;let i=t[0],r=t[1],a=t[2],s=t[3],n=t[4];return r===a&&a===s&&i!==r&&n!==r}},
  {id:"FRAMED_DOUBLE",label:"Framed Double",description:"Two pairs in the middle, bookended by different digits.",emoji:"\ud83d\uddbc\ufe0f\ud83d\uddbc\ufe0f\ud83d\uddbc\ufe0f",family:"PAIRS",score:Number("15242"),probability:"0.66%",check:(e,t)=>{if(6!==t.length)return!1;let i=t[0],r=t[1],a=t[2],s=t[3],n=t[4],o=t[5];return r===a&&s===n&&r!==s&&i!==r&&o!==s}},
  {id:"SQUARE",label:"2nd Power",description:"A perfect square (n\u00b2).",emoji:"\ud83d\udfe6",family:"POWER",score:Number("99900"),probability:"0.10%",check:(e,i)=>NT.isSquare(e)},
  {id:"CUBE",label:"3rd Power",description:"A perfect cube (n\u00b3).",emoji:"\ud83e\uddca",family:"POWER",score:Number("990100"),probability:"0.01%",check:(e,i)=>NT.isCube(e)},
  {id:"FOURTH_POWER",label:"4th Power",description:"A perfect fourth power (n\u2074).",emoji:"\ud83d\udce6",family:"POWER",score:Number("3125003"),probability:"0.0032%",check:(e,i)=>NT.isPerfectPower(e,4)},
  {id:"FIFTH_POWER",label:"5th Power",description:"A perfect fifth power (n\u2075).",emoji:"\ud83d\udd90\ufe0f",family:"POWER",score:Number("6250006"),probability:"0.0016%",check:(e,i)=>NT.isPerfectPower(e,5)},
  {id:"SIXTH_POWER",label:"6th Power",description:"A perfect sixth power (n\u2076).",emoji:"\ud83c\udfb2",family:"POWER",score:Number("9090918"),probability:"0.0011%",check:(e,i)=>NT.isPerfectPower(e,6)},
  {id:"SEVENTH_POWER",label:"7th Power",description:"A perfect seventh power (n\u2077).",emoji:"\ud83c\udf08",family:"POWER",score:Number("0xbebc2d"),probability:"0.0008%",check:(e,i)=>NT.isPerfectPower(e,7)},
  {id:"EIGHTH_POWER",label:"8th Power",description:"A perfect eighth power (n\u2078).",emoji:"\ud83c\udfb1",family:"POWER",score:Number("0xfe503b"),probability:"0.0006%",check:(e,i)=>NT.isPerfectPower(e,8)},
  {id:"NINTH_POWER",label:"9th Power",description:"A perfect ninth power (n\u2079).",emoji:"\u2601\ufe0f",family:"POWER",score:Number("0x1312d14"),probability:"0.0005%",check:(e,i)=>NT.isPerfectPower(e,9)},
  {id:"TENTH_POWER",label:"10th Power",description:"A perfect tenth power (n\u00b9\u2070).",emoji:"\ud83d\udd1f",family:"POWER",score:Number("0x17d7859"),probability:"0.0004%",check:(e,i)=>NT.isPerfectPower(e,10)},
  {id:"ELEVENTH_POWER",label:"11th Power",description:"A perfect eleventh power (n\u00b9\u00b9).",emoji:"\ud83d\udd5a",family:"POWER",score:Number("0x17d7859"),probability:"0.0004%",check:(e,i)=>NT.isPerfectPower(e,11)},
  {id:"THIRTEENTH_POWER",label:"13th Power",description:"A perfect thirteenth power (n\u00b9\u00b3).",emoji:"\ud83d\udc80",family:"POWER",score:Number("0x1fca077"),probability:"0.0003%",check:(e,i)=>NT.isPerfectPower(e,13)},
  {id:"SEVENTEENTH_POWER",label:"17th Power",description:"A perfect seventeenth power (n\u00b9\u2077).",emoji:"\ud83e\uddd9",family:"POWER",score:Number("0x1fca077"),probability:"0.0003%",check:(e,i)=>NT.isPerfectPower(e,17)},
  {id:"NINETEENTH_POWER",label:"19th Power",description:"A perfect nineteenth power (n\u00b9\u2079).",emoji:"\ud83c\udf11",family:"POWER",score:Number("0x1fca077"),probability:"0.0003%",check:(e,i)=>NT.isPerfectPower(e,19)},
  {id:"FIBONACCI",label:"Fibonacci Number",description:"Part of the golden ratio sequence found in nature.",emoji:"\ud83d\udc1a",family:null,score:Number("3333337"),probability:"0.0030%",check:(e,i)=>NT.isFibonacci(e)},
  {id:"POWER_OF_TWO",label:"Power of Two",description:"A power of 2 (2\u207f).",emoji:"\ud83d\udcbe",family:null,score:Number("5000005"),probability:"0.0020%",check:(e,t)=>!(e<=0)&&(e&e-1)==0},
  {id:"POWER_OF_THREE",label:"Power of Three",description:"A power of 3 (3\u207f).",emoji:"\ud83d\udd3a",family:null,score:Number("7692315"),probability:"0.0013%",check:(e,t)=>{if(e<=0)return!1;let i=1;for(;i<e;)i*=3;return i===e}},
  {id:"FACTORIAL",label:"Factorial",description:"A factorial number (n!).",emoji:"\u2757",family:null,score:Number("0xa98ad2"),probability:"0.0009%",check:(e,t)=>{if(1===e||2===e)return!0;let i=1,r=1;for(;i<e;)i*=++r;return i===e}},
  {id:"HARSHAD",label:"Harshad Number",description:"Divisible by the sum of its own digits.",emoji:"\ud83e\udd1d",family:null,score:Number("1048"),probability:"9.5%",check:(e,i)=>NT.isHarshad(e)},
  {id:"SPY",label:"Spy Number",description:"The sum of its digits equals the product of its digits.",emoji:"\ud83d\udd75\ufe0f",family:null,score:Number("1030929"),probability:"0.0097%",check:(e,i)=>1!==e&&2!==e&&NT.sumDigits(e)===NT.productDigits(e)},
  {id:"PRONIC",label:"Pronic Number",description:"The product of two consecutive integers (n * n+1).",emoji:"\ud83e\uddee",family:null,score:Number("1e5"),probability:"0.10%",check:(e,i)=>NT.isPronic(e)},
  {id:"PAIR",label:"Pair",description:"Contains a pair of matching digits.",emoji:"\ud83d\udc6f",family:"PAIRS",score:Number("120"),probability:"83.1%",check:(e,i)=>Array.from(NT.getDigitCounts(i).values()).some(e=>e>=2)},
  {id:"CONTIGUOUS_PAIR",label:"Contiguous Pair",description:"Contains a contiguous pair of matching digits.",emoji:"\ud83e\udec2",family:"PAIRS",score:Number("249"),probability:"40.2%",check:(e,i)=>{for(let[e,r]of NT.getDigitCounts(i).entries())if(r>=2&&NT.areDigitsContiguous(i,e,2))return!0;return!1}},
  {id:"TWO_PAIR",label:"Two Pair",description:"Contains two distinct pairs of matching digits.",emoji:"\ud83d\udc6f\u200d\u2640\ufe0f",family:"PAIRS",score:Number("447"),probability:"22.4%",check:(e,i)=>Array.from(NT.getDigitCounts(i).values()).filter(e=>2===e).length>=2},
  {id:"CONTIGUOUS_TWO_PAIR",label:"Contiguous Two Pair",description:"Contains two adjacent contiguous pairs.",emoji:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",family:"PAIRS",score:Number("6142"),probability:"1.6%",check:(e,i)=>{let r=NT.getDigitCounts(i),a=[];for(let[e,s]of r.entries())if(2===s&&NT.areDigitsContiguous(i,e,2)){for(let t=0;t<i.length-1;t++)if(i[t]===e&&i[t+1]===e){a.push(t);break}}if(a.length<2)return!1;a.sort((e,t)=>e-t);for(let e=0;e<a.length-1;e++)if(a[e]+2===a[e+1])return!0;return!1}},
  {id:"THREE_PAIR",label:"Three Pair",description:"Contains three distinct pairs of matching digits.",emoji:"\ud83d\udc6f\u200d\u2640\ufe0f\ud83d\udc6f",family:"PAIRS",score:Number("10288"),probability:"0.97%",check:(e,i)=>Array.from(NT.getDigitCounts(i).values()).filter(e=>2===e).length>=3},
  {id:"CONTIGUOUS_THREE_PAIR",label:"Contiguous Three Pair",description:"Contains three adjacent contiguous pairs.",emoji:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66\ud83d\udc6f",family:"PAIRS",score:Number("154321"),probability:"0.06%",check:(e,i)=>{let r=NT.getDigitCounts(i),a=[];for(let[e,s]of r.entries())if(2===s&&NT.areDigitsContiguous(i,e,2)){for(let t=0;t<i.length-1;t++)if(i[t]===e&&i[t+1]===e){a.push(t);break}}if(a.length<3)return!1;a.sort((e,t)=>e-t);for(let e=0;e<a.length-2;e++)if(a[e]+2===a[e+1]&&a[e+1]+2===a[e+2])return!0;return!1}},
  {id:"TRIPS",label:"Three of a Kind",description:"Contains three identical digits.",emoji:"\ud83c\udfb0",family:"OF_A_KIND",score:Number("724"),probability:"13.8%",check:(e,i)=>Array.from(NT.getDigitCounts(i).values()).some(e=>3===e)},
  {id:"QUADS",label:"Four of a Kind",description:"Contains four identical digits.",emoji:"\ud83c\udf40",family:"OF_A_KIND",score:Number("8436"),probability:"1.2%",check:(e,i)=>Array.from(NT.getDigitCounts(i).values()).some(e=>e>=4)},
  {id:"BOAT",label:"Full House",description:"Contains a set of three and a set of two.",emoji:"\ud83c\udfe0",family:"BOAT",score:Number("2397"),probability:"4.2%",check:(e,i)=>{let r=Array.from(NT.getDigitCounts(i).values()).sort((e,t)=>t-e),a=r.some(e=>e>=3),s=r.filter(e=>e>=2).length>=2;return a&&s}},
  {id:"CONTIGUOUS_BOAT",label:"Contiguous Full House",description:"Contains a contiguous set of three adjacent to a contiguous set of two.",emoji:"\ud83c\udff0",family:"BOAT",score:Number("30111"),probability:"0.33%",check:(e,i)=>{let r=NT.getDigitCounts(i),a=Array.from(r.values()).sort((e,t)=>t-e),s=a.some(e=>e>=3),n=a.filter(e=>e>=2).length>=2;if(!s||!n)return!1;let o=[];for(let[e,t]of r.entries())if(t>=3){for(let t=0;t<=i.length-3;t++)if(i[t]===e&&i[t+1]===e&&i[t+2]===e){let r=t+2;for(;r+1<i.length&&i[r+1]===e;)r++;o.push({digit:e,start:t,end:r}),t=r}}for(let{digit:e,start:t,end:a}of o)for(let[s,n]of r.entries())if(s!==e&&n>=2){for(let e=0;e<=i.length-2;e++)if(i[e]===s&&i[e+1]===s){let r=e,n=e+1;for(;n+1<i.length&&i[n+1]===s;)n++;if(n+1===t||a+1===r)return!0;e=n}}return!1}},
  {id:"STRAIGHT",label:"Straight",description:"Contains a sequence of 5 consecutive digits (ascending or descending).",emoji:"\ud83d\udccf",family:"STRAIGHT",score:Number("454546"),probability:"0.02%",check:(e,i)=>NT.hasSequence(i,5,!1)},
  {id:"FLUSH",label:"Flush",description:"All digits are either all even or all odd.",emoji:"\ud83c\udfa8",family:null,score:Number("2845"),probability:"3.5%",check:(e,t)=>{let i=t.split("").every(e=>parseInt(e,10)%2==0),r=t.split("").every(e=>parseInt(e,10)%2==1);return i||r}},
  {id:"STRAIGHT_FLUSH",label:"Straight Flush",description:"Contains 5 consecutive same-parity digits (02468, 13579, or their reverse).",emoji:"\ud83c\udccf",family:"STRAIGHT",score:Number("1449277"),probability:"0.0069%",check:(e,t)=>{for(let e of["02468","13579","86420","97531"])if(t.includes(e))return!0;return!1}},
  {id:"ROYAL_FLUSH",label:"Royal Flush",description:"Contains 56789 \u2014 the highest possible straight.",emoji:"\ud83d\udc51",family:"STRAIGHT",score:Number("5000005"),probability:"0.0020%",check:(e,t)=>t.includes("56789")},
  {id:"LOW_BALL",label:"Low Ball",description:"Contains only digits from 0 to 4.",emoji:"\ud83d\udcc9",family:null,score:Number("6400"),probability:"1.6%",check:(e,t)=>t.split("").every(e=>e>="0"&&e<="4")},
  {id:"HIGH_ROLLER",label:"High Roller",description:"Contains only digits from 5 to 9.",emoji:"\ud83e\udd11",family:null,score:Number("5120"),probability:"2.0%",check:(e,t)=>t.split("").every(e=>e>="5"&&e<="9")},
  {id:"SNAKE_EYES",label:"Snake Eyes",description:"Contains a single pair of ones and no other pairs.",emoji:"\ud83c\udfb2",family:null,score:Number("2121"),probability:"4.7%",check:(e,i)=>{let r=NT.getDigitCounts(i);if(2!==r.get("1"))return!1;for(let[e,t]of r)if("1"!==e&&t>=2)return!1;return!0}},
  {id:"LUCKY_7",label:"Lucky Seven",description:"Contains the number 7.",emoji:"7\ufe0f\u20e3",family:null,score:Number("213"),probability:"46.9%",check:(e,t)=>t.includes("7")},
  {id:"JACKPOT",label:"Jackpot",description:"Contains \"777\".",emoji:"\ud83d\udcb0",family:"JACKPOT",score:Number("27027"),probability:"0.37%",check:(e,t)=>t.includes("777")},
  {id:"JACKPOT_EXACT",label:"Exact Jackpot",description:"Exactly \"777\".",emoji:"\ud83d\udcb0",family:"JACKPOT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,t)=>"777"===t},
  {id:"JACKPOT_FOUR",label:"Jackpot Four",description:"Contains four 7s in a row.",emoji:"\ud83d\udcb0\ud83d\udcb0",family:"JACKPOT",score:Number("357143"),probability:"0.03%",check:(e,t)=>t.includes("7777")},
  {id:"JACKPOT_FIVE",label:"Jackpot Five",description:"Contains five 7s in a row.",emoji:"\ud83d\udcb0\ud83d\udcb0\ud83d\udcb0",family:"JACKPOT",score:Number("5263163"),probability:"0.0019%",check:(e,t)=>t.includes("77777")},
  {id:"JACKPOT_SIX",label:"Jackpot Six",description:"Contains six 7s in a row.",emoji:"\ud83c\udfe6",family:"JACKPOT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,t)=>t.includes("777777")},
  {id:"BLACKJACK",label:"Blackjack",description:"Digits sum exactly to 21.",emoji:"\u2660\ufe0f",family:null,score:Number("2521"),probability:"4.0%",check:(e,i)=>21===NT.sumDigits(e)},
  {id:"VERY_NICE",label:"Very Nice",description:"Contains \"6969\".",emoji:"\ud83e\udd75",family:"NICE",score:Number("334448"),probability:"0.03%",check:(e,i)=>i.includes('6969')},
  {id:"BOTANIST",label:"Botanist",description:"Contains \"420\".",emoji:"\ud83c\udf3f",family:"BOTANIST",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('420')},
  {id:"BOTANIST_EXACT",label:"Exact Botanist",description:"Exactly \"420\".",emoji:"\ud83c\udf3f",family:"BOTANIST",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='420'},
  {id:"DEVIL",label:"Devil",description:"Contains \"666\".",emoji:"\ud83d\ude08",family:"DEVIL",score:Number("27027"),probability:"0.37%",check:(e,i)=>i.includes('666')},
  {id:"DEVIL_EXACT",label:"Exact Devil",description:"Exactly \"666\".",emoji:"\ud83d\ude08",family:"DEVIL",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='666'},
  {id:"LEET",label:"Leet",description:"Contains \"1337\".",emoji:"\ud83d\udcbb",family:"LEET",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('1337')},
  {id:"LEET_EXACT",label:"Exact Leet",description:"Exactly \"1337\".",emoji:"\ud83d\udcbb",family:"LEET",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='1337'},
  {id:"HELL",label:"Hell",description:"Contains \"7734\" (spells HELL upside-down).",emoji:"\ud83d\udd25",family:"HELL",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('7734')},
  {id:"EXACT_HELL",label:"Exact Hell",description:"Exactly \"7734\".",emoji:"\ud83d\udc79",family:"HELL",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='7734'},
  {id:"BOOB_8008",label:"8008",description:"Contains \"8008\" (spells BOOB upside-down).",emoji:"\ud83d\udd22",family:"BOOB",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('8008')},
  {id:"BOOB_58008",label:"58008",description:"Contains \"58008\" (spells BOOBS upside-down).",emoji:"\ud83d\udd20",family:"BOOB",score:Number("5000005"),probability:"0.0020%",check:(e,i)=>i.includes('58008')},
  {id:"BOOB_80085",label:"80085",description:"Contains \"80085\" (spells BOOBS).",emoji:"\ud83c\udd71\ufe0f",family:"BOOB",score:Number("5000005"),probability:"0.0020%",check:(e,i)=>i.includes('80085')},
  {id:"EXACT_BOOB",label:"Exact Boob",description:"Exactly \"8008\" or \"58008\".",emoji:"\ud83c\udf48",family:"BOOB",score:Number("0x2faf0b2"),probability:"0.0002%",check:(e,t)=>t==="8008"||t==="58008"},
  {id:"EXACT_BOOB_80085",label:"Exact 80085",description:"Exactly \"80085\".",emoji:"\ud83d\udc8e",family:"BOOB",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='80085'},
  {id:"HELLO",label:"Hello",description:"Contains \"07734\" (spells HELLO upside-down).",emoji:"\ud83d\udc4b",family:null,score:Number("0xa98ad2"),probability:"0.0009%",check:(e,i)=>i.includes('07734')},
  {id:"MEANING",label:"Meaning of Life",description:"Contains \"42\".",emoji:"\ud83c\udf0c",family:"BOTANIST",score:Number("2024"),probability:"4.9%",check:(e,i)=>i.includes('42')},
  {id:"MEANING_EXACT",label:"Exact Meaning",description:"Exactly \"42\".",emoji:"\ud83c\udf0c",family:"BOTANIST",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='42'},
  {id:"EMERGENCY",label:"Emergency",description:"Contains \"911\".",emoji:"\ud83d\ude91",family:"EMERGENCY",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('911')},
  {id:"EMERGENCY_EXACT",label:"Exact Emergency",description:"Exactly \"911\".",emoji:"\ud83d\ude91",family:"EMERGENCY",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='911'},
  {id:"ERROR",label:"Error 404",description:"Contains \"404\".",emoji:"\ud83d\udeab",family:null,score:Number("25132"),probability:"0.40%",check:(e,i)=>i.includes('404')},
  {id:"VERY_VERY_NICE",label:"Very Very Nice",description:"Exactly \"696969\".",emoji:"\ud83d\ude0f",family:"NICE",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='696969'},
  {id:"HOTBOX",label:"Hotbox",description:"Exactly \"420420\".",emoji:"\ud83c\udf3f",family:"BOTANIST",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='420420'},
  {id:"MAYDAY",label:"Mayday",description:"Exactly \"911911\".",emoji:"\ud83d\ude91",family:"EMERGENCY",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='911911'},
  {id:"DEEPER_MEANING",label:"Deeper Meaning",description:"Contains \"4242\".",emoji:"\ud83c\udf0c",family:"MEANING",score:Number("334448"),probability:"0.03%",check:(e,i)=>i.includes('4242')},
  {id:"UNIVERSAL_ANSWER",label:"Universal Answer",description:"Exactly \"424242\".",emoji:"\ud83c\udf0c",family:"MEANING",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='424242'},
  {id:"SECRET_AGENT",label:"Secret Agent",description:"Contains \"007\".",emoji:"\ud83d\udd76\ufe0f",family:null,score:Number("34614"),probability:"0.29%",check:(e,i)=>i.includes('007')},
  {id:"BIG_BROTHER",label:"Big Brother",description:"Contains \"1984\".",emoji:"\ud83d\udc41\ufe0f",family:"BIG_BROTHER",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('1984')},
  {id:"BIG_BROTHER_EXACT",label:"Orwellian",description:"Exactly \"1984\".",emoji:"\ud83d\udc41\ufe0f",family:"BIG_BROTHER",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='1984'},
  {id:"HYDROGEN",label:"Hydrogen (1)",description:"Contains exactly one \"1\".",emoji:"\ud83d\udca7",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"1"===e).length},
  {id:"HELIUM",label:"Helium (2)",description:"Contains exactly one \"2\".",emoji:"\ud83c\udf88",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"2"===e).length},
  {id:"CARBON",label:"Carbon (6)",description:"Contains exactly one \"6\".",emoji:"\u270f\ufe0f",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"6"===e).length},
  {id:"OXYGEN",label:"Oxygen (8)",description:"Contains exactly one \"8\".",emoji:"\ud83d\udca8",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"8"===e).length},
  {id:"LITHIUM",label:"Lithium (3)",description:"Contains exactly one \"3\".",emoji:"\ud83d\udd0b",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"3"===e).length},
  {id:"BERYLLIUM",label:"Beryllium (4)",description:"Contains exactly one \"4\".",emoji:"\ud83d\udc8e",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"4"===e).length},
  {id:"BORON",label:"Boron (5)",description:"Contains exactly one \"5\".",emoji:"\ud83e\uddfc",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"5"===e).length},
  {id:"NITROGEN",label:"Nitrogen (7)",description:"Contains exactly one \"7\".",emoji:"\u2744\ufe0f",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"7"===e).length},
  {id:"FLUORINE",label:"Fluorine (9)",description:"Contains exactly one \"9\".",emoji:"\ud83e\uddb7",family:null,score:Number("282"),probability:"35.4%",check:(e,t)=>1===t.split("").filter(e=>"9"===e).length},
  {id:"GHOST",label:"Ghost",description:"Contains exactly one \"0\".",emoji:"\ud83d\udc7b",family:null,score:Number("309"),probability:"32.4%",check:(e,t)=>1===t.split("").filter(e=>"0"===e).length},
  {id:"DEEP_VOID",label:"Deep Void",description:"Contains \"00\".",emoji:"\ud83d\udd73\ufe0f",family:"VOID_DEPTH",score:Number("2784"),probability:"3.6%",check:(e,t)=>t.includes("00")},
  {id:"DEEP_VOID_THREE",label:"Deep Void (3)",description:"Contains \"000\".",emoji:"\ud83c\udf11",family:"VOID_DEPTH",score:Number("37023"),probability:"0.27%",check:(e,t)=>t.includes("000")},
  {id:"DEEP_VOID_FOUR",label:"Deep Void (4)",description:"Contains \"0000\".",emoji:"\ud83c\udf0c",family:"VOID_DEPTH",score:Number("552487"),probability:"0.02%",check:(e,t)=>t.includes("0000")},
  {id:"DEEP_VOID_FIVE",label:"Deep Void (5)",description:"Contains \"00000\".",emoji:"\u26ab",family:"VOID_DEPTH",score:Number("0x98968a"),probability:"0.0010%",check:(e,t)=>t.includes("00000")},
  {id:"SEQUENCE_3",label:"Sequence (3)",description:"Contains a sequence of 3 consecutive digits.",emoji:"\ud83d\udd22",family:"PROGRESSION",score:Number("1716"),probability:"5.8%",check:(e,i)=>NT.hasSequence(i,3,!1)},
  {id:"SEQUENCE_4",label:"Sequence (4)",description:"Contains a sequence of 4 consecutive digits.",emoji:"\ud83d\udd22",family:"PROGRESSION",score:Number("25907"),probability:"0.39%",check:(e,i)=>NT.hasSequence(i,4,!1)},
  {id:"SEQUENCE_6",label:"Sequence (6)",description:"Contains a sequence of 6 consecutive digits.",emoji:"\ud83d\udd22",family:"PROGRESSION",score:Number("0xa98ad2"),probability:"0.0009%",check:(e,i)=>NT.hasSequence(i,6,!1)},
  {id:"SCRAMBLE",label:"Scramble",description:"All digits form a consecutive sequence when sorted.",emoji:"\ud83d\udd00",family:"PROGRESSION",score:Number("22722"),probability:"0.44%",check:(e,i)=>NT.isScrambledSequence(i,2)},
  {id:"NEIGHBORS",label:"Neighbors",description:"Contains two digits that are adjacent in value.",emoji:"\ud83c\udfd8\ufe0f",family:null,score:Number("161"),probability:"62.1%",check:(e,t)=>{for(let e=0;e<t.length-1;e++){let i=t[e],r=t[e+1];if(i&&r&&1===Math.abs(parseInt(i,10)-parseInt(r,10)))return!0}return!1}},
  {id:"GAP_ONE",label:"Gap One",description:"The first and last digits differ by exactly 1.",emoji:"\u2195\ufe0f",family:null,score:Number("529"),probability:"18.9%",check:(e,t)=>{if(t.length<2)return!1;let i=t[0],r=t[t.length-1];return!!i&&!!r&&1===Math.abs(parseInt(i,10)-parseInt(r,10))}},
  {id:"ONE_DIGIT",label:"Single Digit",description:"Has exactly one digit.",emoji:"\u261d\ufe0f",family:"SINGLE_DIGIT",score:Number("0x98968a"),probability:"0.0010%",check:(e,t)=>1===t.length},
  {id:"DIGIT_ZERO",label:"Zero",description:"The number zero.",emoji:"0\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='0'},
  {id:"DIGIT_ONE",label:"One",description:"The number one.",emoji:"1\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='1'},
  {id:"DIGIT_TWO",label:"Two",description:"The number two.",emoji:"2\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='2'},
  {id:"DIGIT_THREE",label:"Three",description:"The number three.",emoji:"3\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='3'},
  {id:"DIGIT_FOUR",label:"Four",description:"The number four.",emoji:"4\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='4'},
  {id:"DIGIT_FIVE",label:"Five",description:"The number five.",emoji:"5\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='5'},
  {id:"DIGIT_SIX",label:"Six",description:"The number six.",emoji:"6\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='6'},
  {id:"DIGIT_SEVEN",label:"Seven",description:"The number seven.",emoji:"7\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='7'},
  {id:"DIGIT_EIGHT",label:"Eight",description:"The number eight.",emoji:"8\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='8'},
  {id:"DIGIT_NINE",label:"Nine",description:"The number nine.",emoji:"9\ufe0f\u20e3",family:"SINGLE_DIGIT",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='9'},
  {id:"TWO_DIGITS",label:"Two Digits",description:"Has exactly two digits.",emoji:"\u270c\ufe0f",family:null,score:Number("1111112"),probability:"0.0090%",check:(e,t)=>2===t.length},
  {id:"THREE_DIGITS",label:"Three Digits",description:"Has exactly three digits.",emoji:"\ud83e\udd1f",family:null,score:Number("111111"),probability:"0.09%",check:(e,t)=>3===t.length},
  {id:"FOUR_DIGITS",label:"Four Digits",description:"Has exactly four digits.",emoji:"\ud83c\udf40",family:null,score:Number("11111"),probability:"0.90%",check:(e,t)=>4===t.length},
  {id:"FIVE_DIGITS",label:"Five Digits",description:"Has exactly five digits.",emoji:"\ud83d\udd90\ufe0f",family:null,score:Number("1111"),probability:"9.0%",check:(e,t)=>5===t.length},
  {id:"SIX_DIGITS",label:"Six Digits",description:"Has exactly six digits.",emoji:"\ud83d\udc1d",family:null,score:Number("111"),probability:"90.0%",check:(e,t)=>6===t.length},
  {id:"DOUBLE_NINE",label:"Double Nine",description:"Ends in 99.",emoji:"\ud83c\udf88",family:"NINE_ENDING",score:Number("1e4"),probability:"1.00%",check:(e,t)=>t.endsWith("99")},
  {id:"TRIPLE_NINE",label:"Triple Nine",description:"Ends in 999.",emoji:"\ud83c\udf89",family:"NINE_ENDING",score:Number("1e5"),probability:"0.10%",check:(e,t)=>t.endsWith("999")},
  {id:"QUAD_NINE",label:"Quad Nine",description:"Ends in 9999.",emoji:"\ud83c\udf8a",family:"NINE_ENDING",score:Number("1000001"),probability:"0.0100%",check:(e,t)=>t.endsWith("9999")},
  {id:"QUINT_NINE",label:"Quint Nine",description:"Ends in 99999.",emoji:"\ud83e\udd73",family:"NINE_ENDING",score:Number("0x98968a"),probability:"0.0010%",check:(e,t)=>t.endsWith("99999")},
  {id:"EVEN_SPACING",label:"Even Spacing",description:"All digits are evenly spaced in an arithmetic sequence.",emoji:"\ud83d\udccf",family:"PROGRESSION",score:Number("862070"),probability:"0.01%",check:(e,i)=>!(i.length<3)&&NT.hasEvenSpacing(i)},
  {id:"EVEN_SPACING_ABS",label:"Even Spacing (Absolute)",description:"All digits have the same absolute spacing (e.g., \u00b12 each time).",emoji:"\ud83d\udcd0",family:"PROGRESSION",score:Number("90992"),probability:"0.11%",check:(e,t)=>{if(t.length<3)return!1;let i=t.split("").map(e=>parseInt(e,10)),r=Math.abs(i[1]-i[0]);for(let e=2;e<i.length;e++)if(Math.abs(i[e]-i[e-1])!==r)return!1;return!0}},
  {id:"MIRROR_BOOKENDS",label:"Mirror Bookends",description:"First two digits are reversed as the last two.",emoji:"\ud83d\udcd6",family:"BOOKENDS",score:Number("10010"),probability:"1.00%",check:(e,t)=>{if(t.length<4)return!1;let i=t[0],r=t[1],a=t[t.length-2],s=t[t.length-1];return!!i&&!!r&&!!a&&!!s&&i===s&&r===a}},
  {id:"PAIRED_BOOKENDS",label:"Paired Bookends",description:"Starts with a pair and ends with a different pair.",emoji:"\ud83d\udc50",family:"BOOKENDS",score:Number("11122"),probability:"0.90%",check:(e,t)=>{if(t.length<4)return!1;let i=t[0],r=t[1],a=t[t.length-2],s=t[t.length-1];return!!i&&!!r&&!!a&&!!s&&i===r&&a===s&&i!==a}},
  {id:"DIVISIBLE_BY_THREE",label:"Divisible by Three",description:"Every digit is divisible by 3.",emoji:"\ud83d\udd3a",family:null,score:Number("24414"),probability:"0.41%",check:(e,t)=>t.split("").every(e=>parseInt(e,10)%3==0)},
  {id:"BALANCED",label:"Balanced",description:"Sum of first half of digits equals sum of second half.",emoji:"\u2696\ufe0f",family:null,score:Number("1959"),probability:"5.1%",check:(e,t)=>{if(t.length<2||t.length%2!=0)return!1;let i=t.length/2,r=t.slice(0,i),a=t.slice(i);return r.split("").reduce((e,t)=>e+parseInt(t,10),0)===a.split("").reduce((e,t)=>e+parseInt(t,10),0)}},
  {id:"STROBOGRAMMATIC",label:"Strobogrammatic",description:"Looks the same when rotated 180 degrees.",emoji:"\ud83d\ude43",family:null,score:Number("502513"),probability:"0.02%",check:(e,t)=>{let i={0:"0",1:"1",6:"9",8:"8",9:"6"};for(let e of t)if(!(e in i))return!1;return t.split("").reverse().map(e=>i[e]).join("")===t}},
  {id:"PI_CONTAINS_3",label:"Pi Slice (3)",description:"Contains \"314\".",emoji:"\ud83e\udd67",family:"PI",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('314')},
  {id:"PI_CONTAINS_4",label:"Pi Slice (4)",description:"Contains \"3141\".",emoji:"\ud83e\udd67",family:"PI",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('3141')},
  {id:"PI_CONTAINS_5",label:"Pi Slice (5)",description:"Contains \"31415\".",emoji:"\ud83e\udd67",family:"PI",score:Number("5000005"),probability:"0.0020%",check:(e,i)=>i.includes('31415')},
  {id:"PI",label:"Pi",description:"Exactly \u03c0 (314, 3141, 31415, or 314159).",emoji:"\ud83e\udd67",family:"PI",score:Number("0x17d7859"),probability:"0.0004%",check:(e,t)=>"314"===t||"3141"===t||"31415"===t||"314159"===t},
  {id:"E_CONTAINS_3",label:"E Slice (3)",description:"Contains \"271\".",emoji:"\ud83d\udcc8",family:"E",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('271')},
  {id:"E_CONTAINS_4",label:"E Slice (4)",description:"Contains \"2718\".",emoji:"\ud83d\udcc8",family:"E",score:Number("333334"),probability:"0.03%",check:(e,i)=>i.includes('2718')},
  {id:"E_CONTAINS_5",label:"E Slice (5)",description:"Contains \"27182\".",emoji:"\ud83d\udcc8",family:"E",score:Number("5000005"),probability:"0.0020%",check:(e,i)=>i.includes('27182')},
  {id:"E",label:"Euler's Number",description:"The number e (271, 2718, 27182, or 271828).",emoji:"\ud83d\udcc8",family:"E",score:Number("0x17d7859"),probability:"0.0004%",check:(e,t)=>"271"===t||"2718"===t||"27182"===t||"271828"===t},
  {id:"SEMI_CENTURY",label:"Semi-Century",description:"Ends in \"50\".",emoji:"\ud83d\uddd3\ufe0f",family:null,score:Number("1e4"),probability:"1.00%",check:(e,t)=>t.endsWith("50")},
  {id:"SEMI_MILLENNIUM",label:"Semi-Millennium",description:"Ends in \"500\".",emoji:"\ud83d\udcdc",family:null,score:Number("1e5"),probability:"0.10%",check:(e,t)=>t.endsWith("500")},
  {id:"SEMI_EPOCH",label:"Semi-Epoch",description:"Ends in \"5000\".",emoji:"\ud83d\uddff",family:null,score:Number("1000001"),probability:"0.0100%",check:(e,t)=>t.endsWith("5000")},
  {id:"TREE_FIDDY",label:"Tree Fiddy",description:"Contains \"350\" (the Loch Ness Monster\\'s request).",emoji:"\ud83e\udd95",family:"TREE_FIDDY",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('350')},
  {id:"TREE_FIDDY_EXACT",label:"Exact Tree Fiddy",description:"Exactly \"350\".",emoji:"\ud83e\udd95",family:"TREE_FIDDY",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='350'},
  {id:"SIXTY_SEVEN",label:"Six-Seven",description:"Contains \"67\".",emoji:"\ud83e\udee0",family:"SIXTY_SEVEN",score:Number("2024"),probability:"4.9%",check:(e,i)=>i.includes('67')},
  {id:"SIXTY_SEVEN_EXACT",label:"Exact Six-Seven",description:"Exactly \"67\".",emoji:"\ud83e\udee0",family:"SIXTY_SEVEN",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='67'},
  {id:"EIGHTY_SIX",label:"Eighty-Six",description:"Contains \"86\" (restaurant slang for \"out of\").",emoji:"\ud83c\udf7d\ufe0f",family:"EIGHTY_SIX",score:Number("2024"),probability:"4.9%",check:(e,i)=>i.includes('86')},
  {id:"EIGHTY_SIX_EXACT",label:"Exact Eighty-Six",description:"Exactly \"86\".",emoji:"\ud83c\udf7d\ufe0f",family:"EIGHTY_SIX",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='86'},
  {id:"ORIENTATION",label:"Orientation",description:"Contains \"101\" (intro course number).",emoji:"\ud83e\udded",family:"ORIENTATION",score:Number("25132"),probability:"0.40%",check:(e,i)=>i.includes('101')},
  {id:"ORIENTATION_EXACT",label:"Exact Orientation",description:"Exactly \"101\".",emoji:"\ud83e\udded",family:"ORIENTATION",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='101'},
  {id:"CALENDAR",label:"Calendar",description:"Contains \"365\" (days in a year).",emoji:"\ud83d\udcc5",family:"CALENDAR",score:Number("25006"),probability:"0.40%",check:(e,i)=>i.includes('365')},
  {id:"CALENDAR_EXACT",label:"Exact Calendar",description:"Exactly \"365\".",emoji:"\ud83d\udcc5",family:"CALENDAR",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='365'},
  {id:"SIXTY_SEVEN_DOUBLE",label:"6767",description:"Contains \"6767\".",emoji:"\ud83e\udee0",family:"SIXTY_SEVEN",score:Number("334448"),probability:"0.03%",check:(e,i)=>i.includes('6767')},
  {id:"BRAINROT",label:"Brainrot",description:"Exactly \"676767\".",emoji:"\ud83e\udee0",family:"SIXTY_SEVEN",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='676767'},
  {id:"GROUNDHOG_DAY",label:"Groundhog Day",description:"Exactly \"365365\".",emoji:"\ud83d\udcc5",family:"CALENDAR",score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='365365'},
  {id:"COLOSSAL",label:"Colossal",description:"A number greater than 999,000.",emoji:"\ud83e\udea8",family:null,score:Number("1e5"),probability:"0.10%",check:(e,t)=>e>999e3},
  {id:"ONE_MILLION",label:"One Million",description:"The number one million.",emoji:"\ud83d\udc10",family:null,score:Number("0x5f5e164"),probability:"1.00e-4%",check:(e,i)=>i==='1000000'},
  {id:"CONSEC_QUAD_EXACT",label:"4 Consecutive Numbers",description:"The entire number splits into four consecutive integers in order.",emoji:"\u26d3\ufe0f",family:"CONSECUTIVE",score:Number("0x17d7859"),probability:"0.0004%",check:(e,i)=>{let r=NT.findConsecutiveQuadExact(i);return!!r&&NT.isOrderedSequence(r.numbers)}},
  {id:"CONSEC_QUAD_SCRAMBLED",label:"4 Consecutive Numbers (Scrambled)",description:"The entire number splits into four consecutive integers, but not in order.",emoji:"\ud83d\udd00",family:"CONSECUTIVE",score:Number("2272730"),probability:"0.0044%",check:(e,i)=>{let r=NT.findConsecutiveQuadExact(i);return!!r&&!NT.isOrderedSequence(r.numbers)}},
  {id:"CONSEC_QUAD_CONTAINS",label:"4 Consecutive Numbers (Contains)",description:"Contains four adjacent consecutive integers.",emoji:"\ud83d\udd17",family:"CONSECUTIVE",score:Number("2631582"),probability:"0.0038%",check:(e,i)=>null!==NT.findConsecutiveNAdjacent(i,4)},
  {id:"CONSEC_TRIPLE_EXACT",label:"3 Consecutive Numbers",description:"The entire number splits into three consecutive integers in order.",emoji:"\u26d3\ufe0f",family:"CONSECUTIVE",score:Number("555556"),probability:"0.02%",check:(e,i)=>{let r=NT.findConsecutiveTripleExact(i);return!!r&&NT.isOrderedSequence(r.numbers)}},
  {id:"CONSEC_TRIPLE_SCRAMBLED",label:"3 Consecutive Numbers (Scrambled)",description:"The entire number splits into three consecutive integers, but not in order.",emoji:"\ud83d\udd00",family:"CONSECUTIVE",score:Number("277778"),probability:"0.04%",check:(e,i)=>{let r=NT.findConsecutiveTripleExact(i);return!!r&&!NT.isOrderedSequence(r.numbers)}},
  {id:"CONSEC_TRIPLE_CONTAINS",label:"3 Consecutive Numbers (Contains)",description:"Contains three adjacent consecutive integers.",emoji:"\ud83d\udd17",family:"CONSECUTIVE",score:Number("157978"),probability:"0.06%",check:(e,i)=>null!==NT.findConsecutiveNAdjacent(i,3)},
  {id:"CONSEC_PAIR_EXACT",label:"2 Consecutive Numbers",description:"The entire number splits into two consecutive integers.",emoji:"\ud83d\udd17",family:"CONSECUTIVE",score:Number("50505"),probability:"0.20%",check:(e,i)=>null!==NT.findConsecutivePairExact(i)},
  {id:"CONSEC_PAIR_ADJACENT",label:"2 Consecutive Numbers (Contains)",description:"Contains two adjacent substrings that are consecutive integers.",emoji:"\ud83d\udd17",family:"CONSECUTIVE",score:Number("1659"),probability:"6.0%",check:(e,i)=>null!==NT.findConsecutivePairAdjacent(i)},
  {id:"CONSEC_PAIR_NEARBY",label:"2 Consecutive Numbers (Nearby)",description:"Contains two non-adjacent substrings that are consecutive integers.",emoji:"\ud83d\udd17",family:"CONSECUTIVE",score:Number("1575"),probability:"6.3%",check:(e,i)=>null!==NT.findConsecutivePairNearby(i)}
];

var TEST_VECTORS = [
  {id:"PRIME",match:[2,3,5,7,11,13,17,97,101,997],reject:[0,1,4,6,8,9,10,100,1e3,1e6]},
  {id:"PALINDROME",match:[0,1,11,121,1221,12321,123321,999999],reject:[10,12,123,1234,12345,1e5]},
  {id:"HEAVY",match:[999999,999989,989999,888888,799999],reject:[0,1,10,100,1e3,1e4]},
  {id:"VOID",match:[1,11,123,999,12345,987654],reject:[0,10,100,1e3,1e4,1e5,1e6]},
  {id:"NICE",match:[69,169,690,6969,123694,696969],reject:[0,1,68,70,96,679,689]},
  {id:"NICE_EXACT",match:[69,69,69],reject:[690,169,6,9,696]},
  {id:"EVEN",match:[0,2,4,10,100,1e3],reject:[1,3,5,11,101,999]},
  {id:"ODD",match:[1,3,5,11,101,999],reject:[0,2,4,10,100,1e3]},
  {id:"FEATHER",match:[0,1,10,100,1e3,1e4],reject:[99,999,9999,99999,888888]},
  {id:"CLEAN",match:[0,10,100,1e3,12340],reject:[1,11,101,1001,12345]},
  {id:"SEMI_CLEAN",match:[5,15,25,105,12345],reject:[0,10,50,100,12340]},
  {id:"CENTURY",match:[100,200,300,1e3,12300],reject:[10,99,101,1001,12340]},
  {id:"MILLENNIUM",match:[1e3,2e3,1e4,123e3],reject:[100,999,1001,10001]},
  {id:"DOZEN",match:[12,24,36,144,1200],reject:[0,1,11,13,100]},
  {id:"LUCKY_SEVEN_DIV",match:[7,14,21,49,700],reject:[0,1,6,8,15,100]},
  {id:"ELEVEN",match:[11,22,33,121,1100],reject:[0,1,10,12,100]},
  {id:"GROUNDED",match:[12,19,102,1234,15678],reject:[21,91,201,4321,87654]},
  {id:"LIFTOFF",match:[21,91,201,4321,87654],reject:[12,19,102,1234,15678]},
  {id:"EQUILIBRIUM",match:[11,101,1221,12321,989],reject:[10,12,123,1234,9876]},
  {id:"TURTLE",match:[11,112233,123321,12321,445566,12,99],reject:[13,135,19,2468,192]},
  {id:"FIREFLY",match:[1112,1121,1211,2111,111151,999929,33383],reject:[12,123,1122,1111,111,112233,11]},
  {id:"ECHO",match:[11,1212,123123,99,0x1cbe8ef240],reject:[1,12,123,1234,12345]},
  {id:"SANDWICH",match:[101,858,12321,90109],reject:[111,11,123,1234]},
  {id:"BOOKENDS",match:[1212,123412,999999,121212],reject:[123,1234,12345,121]},
  {id:"ASCENSION",match:[12,123,1234,13579,12389],reject:[11,121,1232,4321,12321]},
  {id:"DECAY",match:[21,321,4321,97531,98210],reject:[11,121,1232,1234,12321]},
  {id:"CASCADE",match:[12,123,1234,12345,23456],reject:[13,124,1357,11,121]},
  {id:"WATERFALL",match:[21,321,4321,54321,98765],reject:[31,421,9753,11,121]},
  {id:"MOUNTAIN",match:[131,1341,12391,12981,1354],reject:[1239,931,123,321,111,1212]},
  {id:"VALLEY",match:[313,3129,93129,98123,5014],reject:[931,123,321,111,1212]},
  {id:"HILLS",match:[3728,19281,38291,5836,291837],reject:[123,321,1234,4321,1111,131,12321,12]},
  {id:"MINI_ECHO",match:[1212,5151,515192,812124,3434,996767],reject:[123,1234,12345,917717,1213]},
  {id:"RHYME",match:[917717,123412,5151,121234,1212,112112],reject:[123,1234,12345,123456,1023]},
  {id:"CONTIGUOUS_TRIPS",match:[111,1e3,777,12223,99945],reject:[0,1,11,12,1212]},
  {id:"CONTIGUOUS_QUADS",match:[1111,1e4,7777,122223,999945],reject:[111,1e3,12,1212]},
  {id:"CONTIGUOUS_FIVES",match:[11111,1e5,77777,122222],reject:[1111,1e4,12,1212]},
  {id:"CONTIGUOUS_SIXES",match:[111111,1e6,777777,999999],reject:[11111,1e5,12,1212]},
  {id:"BINARY_SOUL",match:[0,1,10,11,101,1011],reject:[2,12,123,102,1012]},
  {id:"DUALITY",match:[12,0xab3882,1212,112211,10],reject:[1,123,111,1234]},
  {id:"TRINITY",match:[123,112233,12312,11223,789],reject:[1,11,12,1234,111]},
  {id:"QUARTET",match:[1234,0xbc4ff2,0x42e576cb,4321],reject:[123,12345,111,1111]},
  {id:"HETEROGENEOUS",match:[1,12,123,1234,12345],reject:[11,112,1223,12321]},
  {id:"HOMOGENEOUS",match:[11,111,222,7777,999999],reject:[0,1,12,121,1223]},
  {id:"ALTERNATOR",match:[12,121,1212,123,3456,21,2345,8989,654,8383],reject:[11,22,1,1213]},
  {id:"ZIPPER",match:[12,121,5757,89898,1010],reject:[1,11,123,1231,111,1111]},
  {id:"HOPSCOTCH",match:[1213,3141,2324,5152,533121],reject:[1234,121212,934303,11,1111,12131,51525]},
  {id:"DOUBLE_HOP",match:[12131,934303,121212,313233,515253],reject:[1213,1234,12345,111,11111,111111]},
  {id:"FRAMED_PAIR",match:[1221,5665,3443,8998,2332,1223],reject:[1111,1121,2211,12345,122,2221,2222]},
  {id:"FRAMED_TRIPLE",match:[12221,34443,56665,78887,90009,12223],reject:[11111,12211,22212,122221,1222,2221,22222]},
  {id:"FRAMED_DOUBLE",match:[522009,133447,244558,366770,122334],reject:[111111,112233,122211,123456,222222,122244]},
  {id:"SQUARE",match:[0,1,4,9,16,144,1e4],reject:[2,3,5,10,50,1e3]},
  {id:"CUBE",match:[0,1,8,27,64,1e3],reject:[2,3,5,10,100,999]},
  {id:"FOURTH_POWER",match:[0,1,16,81,256,625],reject:[2,8,15,100,1e3]},
  {id:"FIFTH_POWER",match:[0,1,32,243,3125,7776],reject:[2,8,31,100,1e3]},
  {id:"SIXTH_POWER",match:[0,1,64,729,15625],reject:[2,8,63,100,1e3]},
  {id:"SEVENTH_POWER",match:[0,1,128,2187,16384],reject:[2,8,127,100,1e3]},
  {id:"EIGHTH_POWER",match:[0,1,256,6561],reject:[2,8,255,100,1e3]},
  {id:"NINTH_POWER",match:[0,1,512,19683],reject:[2,8,511,100,1e3]},
  {id:"TENTH_POWER",match:[0,1,1024,59049],reject:[2,8,1023,100,1e3]},
  {id:"ELEVENTH_POWER",match:[0,1,2048,177147],reject:[2,10,100,2047,2049]},
  {id:"THIRTEENTH_POWER",match:[0,1,8192],reject:[2,8191,8193]},
  {id:"SEVENTEENTH_POWER",match:[0,1,131072],reject:[2,131071,131073]},
  {id:"NINETEENTH_POWER",match:[0,1,524288],reject:[2,524287,524289]},
  {id:"FIBONACCI",match:[0,1,2,3,5,8,13,144],reject:[4,6,7,9,10,11,100]},
  {id:"POWER_OF_TWO",match:[1,2,4,8,16,32,64,128,256,512,1024],reject:[0,3,5,6,7,9,10,100,1e3]},
  {id:"POWER_OF_THREE",match:[1,3,9,27,81,243,729,2187,6561,19683,59049],reject:[0,2,4,5,6,10,100,1e3]},
  {id:"FACTORIAL",match:[1,2,6,24,120,720,5040,40320,362880],reject:[0,3,4,5,7,25,121,1e3]},
  {id:"HARSHAD",match:[1,12,18,100,102,108],reject:[0,11,13,17,101,103]},
  {id:"SPY",match:[0,22,123,132,213,312],reject:[1,2,11,23,100,999]},
  {id:"PRONIC",match:[0,2,6,12,20,30,42],reject:[1,3,5,10,15,25,100]},
  {id:"PAIR",match:[11,121,1223,334,1122,11223,3344,111,1111],reject:[1,12,123,1234,12345,123456]},
  {id:"CONTIGUOUS_PAIR",match:[11,1123,18827,3445,111,1112],reject:[121,18287,1,123]},
  {id:"TWO_PAIR",match:[1122,112233,1212,334455],reject:[11,111,123,1112]},
  {id:"CONTIGUOUS_TWO_PAIR",match:[1122,114455,112233,4499],reject:[1212,1221,121221,11,111,441599]},
  {id:"THREE_PAIR",match:[112233,115335,123123,334455],reject:[1122,11,111,123,1112,111222]},
  {id:"CONTIGUOUS_THREE_PAIR",match:[112233,114455,335566],reject:[115335,123123,1122,11,111,1212]},
  {id:"TRIPS",match:[111,1112,7773,12211],reject:[11,1122,12,1234]},
  {id:"QUADS",match:[1111,11112,77779,888889],reject:[111,1122,11223,12345]},
  {id:"BOAT",match:[11222,33322,777755,0xa9b639],reject:[111,1122,1234,11111]},
  {id:"CONTIGUOUS_BOAT",match:[11222,844400,333114,888771,22888,88822,88222,22288,222888],reject:[840044,11322,1234,111,888177]},
  {id:"STRAIGHT",match:[12345,23456,56789,123456,98765,65432,198765,54321],reject:[1234,12346,13579]},
  {id:"FLUSH",match:[0,2,24,468,1357,9999],reject:[12,23,123,1234]},
  {id:"STRAIGHT_FLUSH",match:[13579,135790,102468,202468,1135790,97531,86420,197531],reject:[12345,23456,56789,1234,2467,1357,2468]},
  {id:"ROYAL_FLUSH",match:[56789,567890,156789],reject:[5678,67890,12345,6789]},
  {id:"LOW_BALL",match:[0,1,12,1234,4444],reject:[5,15,567,9999]},
  {id:"HIGH_ROLLER",match:[5,56,789,9999,56789],reject:[4,45,1234,12345]},
  {id:"SNAKE_EYES",match:[11,110,211,3011],reject:[1,1122,111,1212,1101,12311,11122,112211,211223]},
  {id:"LUCKY_7",match:[7,17,70,777,12378],reject:[0,1,12,123,6890]},
  {id:"JACKPOT",match:[777,7770,1777,77789,123777],reject:[7,77,7788,12345]},
  {id:"JACKPOT_EXACT",match:[777,777,777],reject:[7770,1777,77,7,7777]},
  {id:"JACKPOT_FOUR",match:[7777,77770,17777,777789],reject:[777,7770,7788,12345]},
  {id:"JACKPOT_FIVE",match:[77777,777770,177777],reject:[7777,77770,777,12345]},
  {id:"JACKPOT_SIX",match:[777777,1777777,7777770],reject:[77777,777770,7777,12345]},
  {id:"BLACKJACK",match:[993,777,966,399,489],reject:[0,999,888,7776,12345]},
  {id:"VERY_NICE",match:[6969,69690,16969,696969],reject:[69,696,6996,66999]},
  {id:"BOTANIST",match:[420,4200,1420,42069],reject:[42,402,421,12345]},
  {id:"BOTANIST_EXACT",match:[420,420,420],reject:[4200,1420,42,402,421]},
  {id:"DEVIL",match:[666,6660,1666,66667],reject:[66,6,667,12345]},
  {id:"DEVIL_EXACT",match:[666,666,666],reject:[6660,1666,66,6,6666]},
  {id:"LEET",match:[1337,13370,11337,133700],reject:[1,13,133,1336,1338]},
  {id:"LEET_EXACT",match:[1337,1337,1337],reject:[13370,11337,133,1336,13377]},
  {id:"HELL",match:[7734,77340,17734,773456],reject:[773,7730,7735,8008]},
  {id:"EXACT_HELL",match:[7734,7734,7734],reject:[77340,17734,773456,773,7735]},
  {id:"BOOB_8008",match:[8008,80080,18008,80081,58008,80085],reject:[800,8e3,808,7734,8080]},
  {id:"BOOB_58008",match:[58008,580081,158008,580080],reject:[5800,7734,80085,8080]},
  {id:"BOOB_80085",match:[80085,800850,180085,800851],reject:[7734,58008,8085,8008]},
  {id:"EXACT_BOOB",match:[8008,58008,8008],reject:[80080,18008,580081,800,8e3,5800,80085]},
  {id:"EXACT_BOOB_80085",match:[80085,80085,80085],reject:[800850,180085,8008,58008]},
  {id:"HELLO",match:[107734,207734,1007734],reject:[7734,773,7730,7735,17734,8008]},
  {id:"MEANING",match:[42,420,1420,4242],reject:[4,24,124,4321]},
  {id:"MEANING_EXACT",match:[42,42,42],reject:[420,142,4,2,421]},
  {id:"EMERGENCY",match:[911,9110,1911,91100],reject:[91,119,912,12345]},
  {id:"EMERGENCY_EXACT",match:[911,911,911],reject:[9110,1911,91,9,9111]},
  {id:"ERROR",match:[404,4040,1404,40404],reject:[40,44,440,4004]},
  {id:"VERY_VERY_NICE",match:[696969,696969,696969],reject:[69696,6969690,6969,69]},
  {id:"HOTBOX",match:[420420,420420,420420],reject:[42042,4204200,420,4200]},
  {id:"MAYDAY",match:[911911,911911,911911],reject:[91191,9119110,911,9110]},
  {id:"DEEPER_MEANING",match:[4242,42420,14242,424242],reject:[42,420,4224,12345]},
  {id:"UNIVERSAL_ANSWER",match:[424242,424242,424242],reject:[42424,4242420,4242,42]},
  {id:"SECRET_AGENT",match:[10070,200700,500071,100700],reject:[7,70,700,12345,17]},
  {id:"BIG_BROTHER",match:[1984,19840,119842,198400],reject:[198,1894,1985,12345]},
  {id:"BIG_BROTHER_EXACT",match:[1984,1984,1984],reject:[19840,119842,198,1985]},
  {id:"HYDROGEN",match:[1,10,102,2031,56719],reject:[0,11,111,121,1001]},
  {id:"HELIUM",match:[2,20,123,4205,67829],reject:[0,22,222,2002,12342]},
  {id:"CARBON",match:[6,60,16,1234567,689],reject:[0,66,666,6060,1266]},
  {id:"OXYGEN",match:[8,80,18,0x75bcd15,56798],reject:[0,88,888,8080,1288]},
  {id:"LITHIUM",match:[3,30,123,4305,67839],reject:[0,33,333,3003,12343]},
  {id:"BERYLLIUM",match:[4,40,124,5406,67849],reject:[0,44,444,4004,12344]},
  {id:"BORON",match:[5,50,125,6507,67859],reject:[0,55,555,5005,123455]},
  {id:"NITROGEN",match:[7,70,127,8709,56789],reject:[0,77,777,7007,12377]},
  {id:"FLUORINE",match:[9,90,129,1089,567890],reject:[0,99,999,9009,12399]},
  {id:"GHOST",match:[0,10,102,2031,567809],reject:[1,100,1e3,10001,12345]},
  {id:"DEEP_VOID",match:[100,1e3,10001,12300],reject:[0,10,101,1010,12345]},
  {id:"DEEP_VOID_THREE",match:[1e3,1e4,10001,123e3],reject:[100,200,1001,10010,12345]},
  {id:"DEEP_VOID_FOUR",match:[1e4,1e5,1e4,12e4],reject:[1e3,2e3,10001,100010,12345]},
  {id:"DEEP_VOID_FIVE",match:[1e5,1e6,1e5,12e5],reject:[1e4,2e4,100001,1000010,12345]},
  {id:"SEQUENCE_3",match:[123,321,456,654,12345],reject:[12,13,135,1357,2468]},
  {id:"SEQUENCE_4",match:[1234,4321,5678,8765,123456],reject:[123,321,135,1357,2468]},
  {id:"SEQUENCE_6",match:[123456,654321,234567,765432],reject:[12345,54321,135,1357,2468]},
  {id:"SCRAMBLE",match:[21,89,132,213,8967,613254],reject:[1,11,13,124,135,1123]},
  {id:"NEIGHBORS",match:[12,23,34,89,456],reject:[0,1,13,24,35]},
  {id:"GAP_ONE",match:[12,21,23,78,819],reject:[0,1,13,22,84]},
  {id:"ONE_DIGIT",match:[0,1,5,9],reject:[10,12,123,1234]},
  {id:"DIGIT_ZERO",match:[0,0,0],reject:[1,10,100]},
  {id:"DIGIT_ONE",match:[1,1,1],reject:[0,11,100]},
  {id:"DIGIT_TWO",match:[2,2,2],reject:[1,22,200]},
  {id:"DIGIT_THREE",match:[3,3,3],reject:[2,33,300]},
  {id:"DIGIT_FOUR",match:[4,4,4],reject:[3,44,400]},
  {id:"DIGIT_FIVE",match:[5,5,5],reject:[4,55,500]},
  {id:"DIGIT_SIX",match:[6,6,6],reject:[5,66,600]},
  {id:"DIGIT_SEVEN",match:[7,7,7],reject:[6,77,700]},
  {id:"DIGIT_EIGHT",match:[8,8,8],reject:[7,88,800]},
  {id:"DIGIT_NINE",match:[9,9,9],reject:[8,99,900]},
  {id:"TWO_DIGITS",match:[10,12,99,42],reject:[1,123,1234,12345]},
  {id:"THREE_DIGITS",match:[100,123,999,420],reject:[12,1234,12345,1]},
  {id:"FOUR_DIGITS",match:[1e3,1245,9999,4200],reject:[123,12345,123456,1]},
  {id:"FIVE_DIGITS",match:[1e4,12345,99999,42069],reject:[1234,123456,1,12]},
  {id:"SIX_DIGITS",match:[1e5,192938,999999,123456],reject:[12345,1234,123,12]},
  {id:"DOUBLE_NINE",match:[99,199,299,1099,123499],reject:[9,98,100,989,12349]},
  {id:"TRIPLE_NINE",match:[999,1999,2999,10999,123999],reject:[99,989,1e3,9899,12399]},
  {id:"QUAD_NINE",match:[9999,19999,29999,109999,1239999],reject:[999,9899,1e4,98999,123999]},
  {id:"QUINT_NINE",match:[99999,199999,299999,1099999,0xbd357f],reject:[9999,98999,1e5,989999,1239999]},
  {id:"EVEN_SPACING",match:[1234,2468,1357,369],reject:[1245,1236,3696,12]},
  {id:"EVEN_SPACING_ABS",match:[1357,135797,7531,2468,8642],reject:[1245,1236,12456,12]},
  {id:"MIRROR_BOOKENDS",match:[1221,129821,345543,678876],reject:[129812,1234,123,12]},
  {id:"PAIRED_BOOKENDS",match:[1144,779044,223355,998877],reject:[1234,1111,123,12]},
  {id:"DIVISIBLE_BY_THREE",match:[0,3,6,9,33,369,33639,666,9e3],reject:[1,2,13,123,3336391]},
  {id:"BALANCED",match:[1111,1230,1212,99,5005,123033],reject:[12,123,1234,2468,123456,5500]},
  {id:"STROBOGRAMMATIC",match:[0,1,8,11,69,88,96,101,609,818,906,1001,6009],reject:[2,3,4,5,7,10,12,67,89,100]},
  {id:"PI_CONTAINS_3",match:[314,3145,1314,31415,314159,13140],reject:[31,341,134,12345,3041]},
  {id:"PI_CONTAINS_4",match:[3141,31415,314159,13141,31410],reject:[314,3142,3140,1314]},
  {id:"PI_CONTAINS_5",match:[31415,314159,131415,314150],reject:[3141,31416,31414]},
  {id:"PI",match:[314,3141,31415,314159],reject:[313,3140,31414,3141592,31416,1314]},
  {id:"E_CONTAINS_3",match:[271,2718,27182,271828,1271,2710],reject:[27,272,270,12345]},
  {id:"E_CONTAINS_4",match:[2718,27182,271828,12718,27180],reject:[271,2717,2719,1271]},
  {id:"E_CONTAINS_5",match:[27182,271828,127182,271820],reject:[2718,27181,27183]},
  {id:"E",match:[271,2718,27182,271828],reject:[270,2717,27181,2718281,27183]},
  {id:"SEMI_CENTURY",match:[50,150,250,1050,12350],reject:[5,500,51,15,105]},
  {id:"SEMI_MILLENNIUM",match:[500,1500,2500,10500,123500],reject:[50,5e3,501,150,1050]},
  {id:"SEMI_EPOCH",match:[5e3,15e3,25e3,105e3,125e3],reject:[500,5e4,5001,1500,10500]},
  {id:"TREE_FIDDY",match:[350,3500,1350,35e3,123504],reject:[35,305,351,12345]},
  {id:"TREE_FIDDY_EXACT",match:[350,350,350],reject:[3500,1350,35,3501]},
  {id:"SIXTY_SEVEN",match:[67,167,670,6700,12367],reject:[6,7,76,78,12345]},
  {id:"SIXTY_SEVEN_EXACT",match:[67,67,67],reject:[670,167,6,7,677]},
  {id:"EIGHTY_SIX",match:[86,186,860,8600,12386],reject:[8,6,68,87,12345]},
  {id:"EIGHTY_SIX_EXACT",match:[86,86,86],reject:[860,186,8,6,866]},
  {id:"ORIENTATION",match:[101,1010,1101,10100,12101],reject:[10,11,110,1001,12345]},
  {id:"ORIENTATION_EXACT",match:[101,101,101],reject:[1010,1101,10,11,1001]},
  {id:"CALENDAR",match:[365,3650,1365,36500,12365],reject:[36,356,366,364,12345]},
  {id:"CALENDAR_EXACT",match:[365,365,365],reject:[3650,1365,36,356,364]},
  {id:"SIXTY_SEVEN_DOUBLE",match:[6767,67670,16767,676700],reject:[67,676,6776,12345]},
  {id:"BRAINROT",match:[676767,676767,676767],reject:[67676,6767670,6767,67]},
  {id:"GROUNDHOG_DAY",match:[365365,365365,365365],reject:[36536,3653650,365,3650]},
  {id:"COLOSSAL",match:[999001,999500,999999,999900],reject:[999e3,998999,1e5,5e5]},
  {id:"ONE_MILLION",match:[1e6,1e6,1e6],reject:[999999,1e5,999e3,0]},
  {id:"CONSEC_QUAD_EXACT",match:[78910,891011,111098],reject:[1234,5960,810911]},
  {id:"CONSEC_QUAD_SCRAMBLED",match:[810911,108911,911108],reject:[891011,111098,1234]},
  {id:"CONSEC_QUAD_CONTAINS",match:[178910,278910,109870],reject:[891011,78910,5960]},
  {id:"CONSEC_TRIPLE_EXACT",match:[596061,222120,8910,91011],reject:[5960,605961,123,321]},
  {id:"CONSEC_TRIPLE_SCRAMBLED",match:[605961,615960,606159],reject:[596061,222120,5960]},
  {id:"CONSEC_TRIPLE_CONTAINS",match:[189100,891e3,189101],reject:[596061,8910,75960]},
  {id:"CONSEC_PAIR_EXACT",match:[5960,6059,541542,910,1011,99100,100101],reject:[12,1234,5961,123,100200]},
  {id:"CONSEC_PAIR_ADJACENT",match:[75960,759601,159600],reject:[5960,6059,12,759060]},
  {id:"CONSEC_PAIR_NEARBY",match:[759060,310430,590060],reject:[5960,75960,12,123]}
];

var SCORE_PERCENTILES = {}/* percentile lookup table omitted: the game computes percentile from totalScore itself; the cheat does not need it */;


var SCORE_BY_ID = {}, META_BY_ID = {}, FAMILY_BY_ID = {};
(function(){
  for(var i=0;i<BADGE_DEFINITIONS.length;i++){
    var b=BADGE_DEFINITIONS[i];
    SCORE_BY_ID[b.id]=b.score;
    FAMILY_BY_ID[b.id]=b.family;
    META_BY_ID[b.id]={label:b.label,description:b.description,emoji:b.emoji,score:b.score,family:b.family,rarity:rarityForScore(b.score),probability:b.probability};
  }
})();

function analyzeNumber(n){
  var str=n.toString();
  var matched=[];
  for(var i=0;i<BADGE_DEFINITIONS.length;i++){
    var b=BADGE_DEFINITIONS[i];
    if(b.check(n,str))matched.push(b.id);
  }
  var famMap={}, nonFam=[];
  for(var k=0;k<matched.length;k++){
    var id=matched[k];
    var sc=SCORE_BY_ID[id]; if(sc==null)sc=0;
    var fam=FAMILY_BY_ID[id];
    if(fam){
      var cur=famMap[fam];
      if(!cur||sc>cur.score)famMap[fam]={badge:id,score:sc};
    }else nonFam.push(id);
  }
  var scoringBadges=nonFam.slice();
  for(var f in famMap)if(Object.prototype.hasOwnProperty.call(famMap,f))scoringBadges.push(famMap[f].badge);
  var total=0;
  for(var s=0;s<scoringBadges.length;s++){var v=SCORE_BY_ID[scoringBadges[s]];total+=(v==null?0:v);}
  return {number:n,badges:matched,scoringBadges:scoringBadges,totalScore:total};
}

function enrichBadges(allIds,scoringIds){
  var scoringSet={};
  for(var i=0;i<scoringIds.length;i++)scoringSet[scoringIds[i]]=true;
  var out=[];
  for(var j=0;j<allIds.length;j++){
    var id=allIds[j], m=META_BY_ID[id];
    if(!m)continue;
    out.push({
      id:id,
      label:m.label,
      description:m.description,
      score:m.score,
      emoji:m.emoji,
      isScoring:!!scoringSet[id],
      family:m.family,
      rarity:m.rarity
    });
  }
  out.sort(function(a,b){return b.score-a.score;});
  return out;
}

function composeRollResult(n,opts){
  var r=analyzeNumber(n);
  var existing=opts&&opts.existingBadgeIds;
  var enriched=enrichBadges(r.badges,r.scoringBadges);
  for(var i=0;i<enriched.length;i++){
    enriched[i].isNew=!!(existing&&!existing.has(enriched[i].id));
  }
  return {number:r.number,badges:enriched,totalScore:r.totalScore};
}

function getPercentileForScore(score){
  var v=SCORE_PERCENTILES[(''+score)];
  return v==null?0:v;
}

function rollRandomNumber(){return Math.floor(1000001*Math.random());}


var API = {
  analyzeNumber: analyzeNumber,
  composeRollResult: composeRollResult,
  enrichBadgesWithScoringInfo: enrichBadges,
  getPercentileForScore: getPercentileForScore,
  rollRandomNumber: rollRandomNumber,
  rarityForScore: rarityForScore,
  BADGE_DEFINITIONS: BADGE_DEFINITIONS,
  badgeMeta: META_BY_ID,
  TEST_VECTORS: TEST_VECTORS,
  NT: NT
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.RNGDLE_SCORING = API;
})();
