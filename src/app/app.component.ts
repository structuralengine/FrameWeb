import { Component, ViewChild } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';


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
    private translate: TranslateService) {
    
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

  SendCaptureToUnity(): void {
    this.unityView.sendMessageToUnity('ExternalConnect', 'SendCapture');
  }

  SendModeToUnity(templateUrl: string): void {
    if (typeof templateUrl == 'undefined')
      return;
    let mode_name = this.GetModeName(templateUrl);
    if (mode_name == '') {
      mode_name = 'nodes'; // デフォルトの設定
    }
    this.unityView.sendMessageToUnity('ExternalConnect', 'ChengeMode', mode_name);
  }

  SendSelectItemToUnity(id: number): void {
    const mode_name = this.GetModeName(location.hash);
    this.unityView.sendMessageToUnity('ExternalConnect', 'SelectItemChange', mode_name, id);
  }

  GetModeName(templateUrl: string): string {

    let mode_name = templateUrl + ''; //toString() と同じことしてる

    mode_name = mode_name.replace('#!/', '')
    mode_name = mode_name.replace('views/', '')
    mode_name = mode_name.replace('.html', '')
    return mode_name.trim();
  }


}
