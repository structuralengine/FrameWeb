import { Component, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import { UnityConnectorService } from './unity/unity-connector.service';

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

    document.getElementById(id).classList.add('active');

    this.isContentsDailogShow = true;
    this.setDialogHeight();
  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for(let i = 0; i <= 11; i++) {
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

      dialog.style.height = window.innerHeight - headerSize  + 'px';
      console.log('dialog height:' + dialog.style.height);

    }, 100);

  }
}
