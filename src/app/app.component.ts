import { Component, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import { UnityConnectorService } from './providers/unity-connector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('unityView') unityView;
  baseUrl: string;
  project: string;

  isContentsDailogShow: boolean;
  isCalculated: boolean;

  constructor(platformLocation: PlatformLocation,
    private _router: Router,
    private unityConnector: UnityConnectorService ) {

    const location = (platformLocation as any).location;
    this.baseUrl = location.origin + location.pathname;
    console.log('baseUrl', this.baseUrl);

    /* // ページが遷移した時の処理
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.unityConnector.ChengeMode(event.url);
      }
    });
    */

    // custom property
    this.isContentsDailogShow = false;
    this.isCalculated = false;

  }

  ngOnInit() {
    this.project = 'unity';
    this.unityView.loadProject(`${this.baseUrl}assets/unity/Build/unity.json`);
  }

  dialogClose(): void{
    this.isContentsDailogShow = false;
    this.deactiveButtons();
  }

  contentsDailogShow(id): void{

    this.deactiveButtons();

    document.getElementById(id).classList.add("active");
    
    this.isContentsDailogShow = true;
    this.setDialogHeight();
  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for(var i = 0; i <= 11; i++) {
      var data = document.getElementById(i+"");
      if (data != null) {
        if (data.classList.contains("active")) {
          data.classList.remove("active");
        }
      }
    }
  }

  // contents-dialogの高さをウィンドウサイズに合わせる
  setDialogHeight() {

    setTimeout(function () {
      var dialog = document.getElementById('contents-dialog-id');
      // ヘッダ領域を取得
      var header = document.getElementsByClassName('header');
      var container = document.getElementsByClassName('container');
      var headerSize = container[0].clientHeight + header[0].clientHeight + 30;

      dialog.style.height = window.innerHeight - headerSize +"px";
      console.log("dialog height:"+dialog.style.height);

    }, 100);

  }
}
