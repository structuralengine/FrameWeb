!function(t){var e={};function o(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=t,o.c=e,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)o.d(n,r,(function(e){return t[e]}).bind(null,r));return n},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="",o(o.s="rvdD")}({rvdD:function(t,e){addEventListener("message",({data:t})=>{const e=t.defList,o=t.combList,n=t.reac,r=t.reacKeys,c={};for(const f of Object.keys(e)){const t={};for(const o of e[f]){const e=Math.abs(o).toString(),c=Math.sign(o);if(!(e in n)){if(0!==o)continue;n[0]=Object.values(n)[0]}for(const s of r){const r={};for(const t of n[e])r[t.id]={tx:c*t.tx,ty:c*t.ty,tz:c*t.tz,mx:c*t.mx,my:c*t.my,mz:c*t.mz,case:o};if(s in t){const e=s.split("_"),o=e[0],n=e[1];for(const c of Object.keys(t[s]))"max"===n?t[s][c][o]<r[c][o]&&(t[s][c]=r[c]):"min"===n&&t[s][c][o]>r[c][o]&&(t[s][c]=r[c])}else t[s]=r}}c[f]=t}const s={};for(const f of Object.keys(o)){const t={};for(const e of o[f]){const o=Number(e.caseNo),n=e.caseNo.toString(),s=e.coef;if(!(n in c))continue;if(0===s)continue;const f=c[n],i=Math.abs(o).toString().trim();for(const e of r){const o={};for(const t of Object.keys(f[e])){const n=f[e][t],r=Math.sign(s)<0?-1:1*n.case;let c="";0!==r&&(c=(r<0?"-":"+")+i),o[t]={tx:s*n.tx,ty:s*n.ty,tz:s*n.tz,mx:s*n.mx,my:s*n.my,mz:s*n.mz,case:c}}if(e in t)for(const n of Object.keys(f[e]))for(const r of Object.keys(o[n]))t[e][n][r]+=o[n][r];else t[e]=o}}s[f]=t}postMessage({reacCombine:s})})}});