import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfoService } from './providers/user-info.service'
import { ResultDataService } from './providers/result-data.service';
import { PrintService } from './components/print/print.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  //isContentsDailogShow: boolean;
  isCalculated: boolean;
  btnReac: string;

  constructor(private _router: Router,
              private ResultData: ResultDataService,
              public user:UserInfoService,
              public printService: PrintService) { 
  }

  ngOnInit() {
    this.user.isContentsDailogShow = false;
    this.isCalculated = false;
  }

  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
  
  }

  public contentsDailogShow(id): void {

    this.deactiveButtons();

    document.getElementById(id).classList.add('active');
  

    this.user.isContentsDailogShow = true;
    this.setDialogHeight();

  }

  // 解析終了したら呼ばれる関数
  public Calculated(ResultData: ResultDataService): void {
    this.isCalculated = true;

    if ( ResultData.reac.REAC_ROWS_COUNT > 0) {
      this.btnReac = 'btn btn-outline-primary';
    } else {
      this.btnReac = 'btn btn-outline-primary disabled';
    }

  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for (let i = 0; i <= 12; i++) {
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


  public onPrintInvoice() {
    const invoiceIds = ['101', '102'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }


}
