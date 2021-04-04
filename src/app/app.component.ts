import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from './providers/user-info.service'
import { ResultDataService } from './providers/result-data.service';
import { PrintService } from './components/print/print.service';
import { AuthService } from './core/auth.service';

import { ResultFsecService } from './components/result/result-fsec/result-fsec.service';
import { ResultDisgService } from './components/result/result-disg/result-disg.service';
import { ResultReacService } from './components/result/result-reac/result-reac.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  btnReac: string;
  constructor(private _router: Router,
              private ResultData: ResultDataService,
              public user:UserInfoService,
              public printService: PrintService,
              private authService: AuthService,
              public fsec: ResultFsecService,
              public disg: ResultDisgService,
              public reac: ResultReacService) { 
  }

  ngOnInit() {
    this.user.isContentsDailogShow = false;
  }
  
  // 計算結果表示ボタンを無効にする
  public disableResultButton() {
    this.fsec.clear();
    this.disg.clear();
    this.reac.clear();
  }

  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
  }

  public contentsDailogShow(id): void {
    this.deactiveButtons();
    document.getElementById(id).classList.add('active');
    this.user.isContentsDailogShow = true;
    //this.setDialogHeight();
  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for (let i = 0; i <= 13; i++) {
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
      const headerSize = container[0].clientHeight + header[0].clientHeight + 50;
      dialog.style.height = window.innerHeight - headerSize + 'px';
      console.log('dialog height:' + dialog.style.height);
    }, 100);
  }

  public getDialogHeight(): number {
    const dialog = document.getElementById('contents-dialog-id');
    let dialogHeight = parseFloat(dialog.style.height); // ヘッダー高さを引く
    if(isNaN(dialogHeight)){
      dialogHeight = window.innerHeight - 200; // メニューとヘッダー高さを引く
    } else {
      dialogHeight -=  80;
    }
    return dialogHeight;
  }

  public onPrintInvoice() {
    const invoiceIds = ['101', '102'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }

  // login() {
  //   this.authService.googleLogin();
  // }
  logout() {
    this.authService.signOut();
  }
}