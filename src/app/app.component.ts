import { Component, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Router, NavigationEnd } from "@angular/router";

import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

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
    public electronService: ElectronService,
    private translate: TranslateService,
    private _router: Router,
    private unityConnector: UnityConnectorService ) {
    
    const location = (platformLocation as any).location;
    this.baseUrl = location.origin + location.pathname;
    console.log('baseUrl', this.baseUrl);

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);
    
    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }

    // ページが遷移した時の処理
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.unityConnector.ChengeMode(event.url);
      }
    })

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
