import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// WebGLのサイズをブラウザサイズに合わせて動的に変更する処理
var canvas;
var header;
var container;

//初期化
function init() {
  // WebGL本体が格納されているタグを取得
  canvas = document.getElementById('#canvas');
  
  // ヘッダ領域を取得
  header = document.getElementsByClassName('header');
  container = document.getElementsByClassName('container');

  setSize();
}

//サイズ変更処理
function setSize() {
  
  // ヘッダ領域の分だけ縦幅を小さくするため、ヘッダサイズを取得する
  var headerSize = container[0].clientHeight + header[0].clientHeight;
  
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight - headerSize + 'px';
}

window.onload = function () {
  init();
};
//ブラウザの大きさが変わった時に行う処理
(function () {
  window.onresize = function () {
    setTimeout(function () {
      setSize();
    }, 200);
  };
}());
