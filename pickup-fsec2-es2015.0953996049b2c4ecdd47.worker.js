!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,(function(t){return e[t]}).bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s="TY/C")}({"TY/C":function(e,t){addEventListener("message",({data:e})=>{const t=e.fsecPickup,n={};for(const o of Object.keys(t)){const e=t[o];if(null===e)continue;const r={};for(const t of Object.keys(e)){let n={};t in e&&(n=e[t]);const o=new Array;let f=null;const u={};for(const e of Object.keys(n)){const t=n[e],r={m:f===t.m?"":t.m,n:"n"in t?t.n:"",l:t.l.toFixed(3),fx:t.fx.toFixed(2),fy:t.fy.toFixed(2),fz:t.fz.toFixed(2),mx:t.mx.toFixed(2),my:t.my.toFixed(2),mz:t.mz.toFixed(2),case:t.case};u.n===r.n&&u.fx===r.fx&&u.fy===r.fy&&u.fz===r.fz&&u.mx===r.mx&&u.my===r.my&&u.mz===r.mz||(o.push(r),f=t.m,Object.assign(u,r))}r[t]=o}n[o]=r}postMessage({result:n})})}});