!function(t){var n={};function e(r){if(n[r])return n[r].exports;var a=n[r]={i:r,l:!1,exports:{}};return t[r].call(a.exports,a,a.exports,e),a.l=!0,a.exports}e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var a in t)e.d(r,a,(function(n){return t[n]}).bind(null,a));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s="tLgl")}({tLgl:function(t,n){addEventListener("message",({data:t})=>{const n={};let e=null;const r=t.jsonData,a=t.member,o=t=>{const n=a.find(n=>n.id===t);return void 0===n?{ni:null,nj:null}:n},l=t=>{let n=null;try{const r=t.toString().trim();r.length>0&&(e=+r,n=isNaN(e)?null:e)}catch(r){n=null}var e;return n},u={};try{for(const t of Object.keys(r)){const e={fx:0,fy:0,fz:0,mx:0,my:0,mz:0},a=new Array,f=r[t];if("object"!=typeof f)continue;if(!("fsec"in f))continue;const s=f.fsec;let c=0,i="";for(const t of Object.keys(s)){let n=0;i=t.replace("member","");const r=s[t];let u={};const f=o(i);let m=f.ni,h="",M=1;const d=Object.keys(r).length;for(;M<=d;){const t="P"+M.toString();if(!(t in r))break;const o=r[t];let s=l(o.fxi),y=l(o.fyi),b=l(o.fzi),x=l(o.mxi),p=l(o.myi),j=l(o.mzi);s=null==s?0:Math.round(100*s)/100,y=null==y?0:Math.round(100*y)/100,b=null==b?0:Math.round(100*b)/100,x=null==x?0:Math.round(100*x)/100,p=null==p?0:Math.round(100*p)/100,j=null==j?0:Math.round(100*j)/100,u={m:i,n:m,l:n,fx:s,fy:y,fz:b,mx:x,my:p,mz:j},c++,u.row=c,a.push(u),i="",m="",M===d&&(h=f.nj);const g=l(o.L);let z=l(o.fxj),v=l(o.fyj),O=l(o.fzj),S=l(o.mxj),_=l(o.myj),P=l(o.mzj);n+=Math.round(1e3*g)/1e3,z=null==z?0:Math.round(100*z)/100,v=null==v?0:Math.round(100*v)/100,O=null==O?0:Math.round(100*O)/100,S=null==S?0:Math.round(100*S)/100,_=null==_?0:Math.round(100*_)/100,P=null==P?0:Math.round(100*P)/100,u={m:"",n:h,l:n,fx:z,fy:v,fz:O,mx:S,my:_,mz:P},c++,u.row=c,a.push(u),M++,e.fx=Math.max(Math.abs(s),Math.abs(z),e.fx),e.fy=Math.max(Math.abs(y),Math.abs(v),e.fy),e.fz=Math.max(Math.abs(b),Math.abs(O),e.fz),e.mx=Math.max(Math.abs(x),Math.abs(S),e.mx),e.my=Math.max(Math.abs(p),Math.abs(_),e.my),e.mz=Math.max(Math.abs(j),Math.abs(P),e.mz)}}const m=t.replace("Case","");n[m]=a,u[m]=e}}catch(f){e=f}postMessage({fsec:n,max_values:u,error:e})})}});