!function(){function e(e,r){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=function(e,r){if(!e)return;if("string"==typeof e)return t(e,r);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return t(e,r)}(e))||r&&e&&"number"==typeof e.length){n&&(e=n);var o=0,a=function(){};return{s:a,n:function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,f=!0,u=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return f=e.done,e},e:function(e){u=!0,i=e},f:function(){try{f||null==n.return||n.return()}finally{if(u)throw i}}}}function t(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,(function(t){return e[t]}).bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s="rvdD")}({rvdD:function(t,r){addEventListener("message",function(t){for(var r=t.data,n=r.defList,o=r.combList,a=r.reac,i=r.reacKeys,f={},u=0,c=Object.keys(n);u<c.length;u++){var l,s=c[u],y={},v=e(n[s]);try{for(v.s();!(l=v.n()).done;){var b=l.value,m=Math.abs(b).toString(),d=Math.sign(b);if(!(m in a)){if(0!==b)continue;a[0]=Object.values(a)[0]}var g,p=e(i);try{for(p.s();!(g=p.n()).done;){var h,j=g.value,O={},x=e(a[m]);try{for(x.s();!(h=x.n()).done;){var S=h.value;O[S.id]={tx:d*S.tx,ty:d*S.ty,tz:d*S.tz,mx:d*S.mx,my:d*S.my,mz:d*S.mz,case:b}}}catch(fe){x.e(fe)}finally{x.f()}if(j in y)for(var M=j.split("_"),z=M[0],k=M[1],_=0,w=Object.keys(y[j]);_<w.length;_++){var A=w[_];"max"===k?y[j][A][z]<O[A][z]&&(y[j][A]=O[A]):"min"===k&&y[j][A][z]>O[A][z]&&(y[j][A]=O[A])}else y[j]=O}}catch(fe){p.e(fe)}finally{p.f()}}}catch(fe){v.e(fe)}finally{v.f()}f[s]=y}for(var P={},I=0,L=Object.keys(o);I<L.length;I++){var N,T=L[I],C={},D=e(o[T]);try{for(D.s();!(N=D.n()).done;){var E=N.value,K=Number(E.caseNo),U=E.caseNo.toString(),$=E.coef;if(U in f&&0!==$){var q,B=f[U],F=Math.abs(K).toString().trim(),G=e(i);try{for(G.s();!(q=G.n()).done;){for(var H=q.value,J={},Q=0,R=Object.keys(B[H]);Q<R.length;Q++){var V=R[Q],W=B[H][V],X=Math.sign($)<0?-1:1*W.case,Y="";0!==X&&(Y=(X<0?"-":"+")+F),J[V]={tx:$*W.tx,ty:$*W.ty,tz:$*W.tz,mx:$*W.mx,my:$*W.my,mz:$*W.mz,case:Y}}if(H in C)for(var Z=0,ee=Object.keys(B[H]);Z<ee.length;Z++){for(var te=ee[Z],re=0,ne=Object.keys(J[te]);re<ne.length;re++){var oe=ne[re];C[H][te][oe]+=J[te][oe]}C[H][te].comb=T}else{for(var ae=0,ie=Object.keys(J);ae<ie.length;ae++){J[ie[ae]].comb=T}C[H]=J}}}catch(fe){G.e(fe)}finally{G.f()}}}}catch(fe){D.e(fe)}finally{D.f()}P[T]=C}postMessage({reacCombine:P})})}})}();