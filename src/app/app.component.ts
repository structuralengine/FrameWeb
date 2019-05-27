import { Component, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Router, NavigationEnd } from "@angular/router";

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

        // ページが遷移した時の処理
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.unityConnector.ChengeMode(event.url);
      }
    });

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
  }

  contentsDailogShow(): void{
    this.isContentsDailogShow = true;
  }
}
