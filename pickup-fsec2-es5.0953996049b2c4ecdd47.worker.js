!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,(function(t){return e[t]}).bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s="TY/C")}({"TY/C":function(e,t){addEventListener("message",function(e){for(var t=e.data.fsecPickup,n={},r=0,o=Object.keys(t);r<o.length;r++){var f=o[r],u=t[f];if(null!==u){for(var i={},a=0,l=Object.keys(u);a<l.length;a++){var c=l[a],s={};c in u&&(s=u[c]);for(var d=new Array,y=null,m={},x=0,p=Object.keys(s);x<p.length;x++){var b=s[p[x]],v={m:y===b.m?"":b.m,n:"n"in b?b.n:"",l:b.l.toFixed(3),fx:b.fx.toFixed(2),fy:b.fy.toFixed(2),fz:b.fz.toFixed(2),mx:b.mx.toFixed(2),my:b.my.toFixed(2),mz:b.mz.toFixed(2),case:b.case};m.n===v.n&&m.fx===v.fx&&m.fy===v.fy&&m.fz===v.fz&&m.mx===v.mx&&m.my===v.my&&m.mz===v.mz||(d.push(v),y=b.m,Object.assign(m,v))}i[c]=d}n[f]=i}}postMessage({result:n})})}});