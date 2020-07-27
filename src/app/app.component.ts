import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isContentsDailogShow: boolean;
  isCalculated: boolean;

  constructor(private _router: Router) { 
  }

  ngOnInit() {
    this.isContentsDailogShow = false;
    this.isCalculated = false;
  }

  public dialogClose(): void {
    this.isContentsDailogShow = false;
    this.deactiveButtons();
  }

  public contentsDailogShow(id): void {

    this.deactiveButtons();

    document.getElementById(id).classList.add('active');

    this.isContentsDailogShow = true;
    this.setDialogHeight();

  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for (let i = 0; i <= 11; i++) {
      const data = document.getElementById(i + '');
      if (data != null) {
        if (data.classList.contains('active')) {
          data.classList.remove('active');
        }
      }
    }
  }

  // contents-dialogの高さをウィンドウサイズに合わせる
  setDialogHeight() {

    setTimeout(function () {
      const dialog = document.getElementById('contents-dialog-id');
      // ヘッダ領域を取得
      const header = document.getElementsByClassName('header');
      const container = document.getElementsByClassName('container');
      const headerSize = container[0].clientHeight + header[0].clientHeight + 30;

      dialog.style.height = window.innerHeight - headerSize + 'px';
      console.log('dialog height:' + dialog.style.height);

    }, 100);

  }
}
