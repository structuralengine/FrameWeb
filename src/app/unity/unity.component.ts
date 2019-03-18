import { Component, Input, OnInit } from '@angular/core';
import { UnityLoader } from './UnityLoader.js';
import { UnityProgress } from './UnityProgress.js';

declare var window: any;

@Component({
  selector: 'app-unity',
  templateUrl: './unity.component.html',
  styleUrls: ['./unity.component.css']
})
export class UnityComponent implements OnInit {
  unityInstance: any;
  @Input() appLocation: String;
  @Input() appWidth: String;
  @Input() appHeight: String;

  constructor() { }

  ngOnInit() {
    window['UnityLoader'] = UnityLoader;
    window['UnityProgress'] = UnityProgress;
    window['ReceiveUnity'] = this.ReceiveUnity;
    window['ReceiveUnitySelectItemChenge'] = this.ReceiveUnitySelectItemChenge;
    if (this.appLocation) {
      this.loadProject(this.appLocation);
    }
  }

  public loadProject(path) {
    this.unityInstance = UnityLoader.instantiate('unityContainer', path);
  }

  public sendMessageToUnity(objectName: string, methodName: string, messageValue: string) {
    this.unityInstance.SendMessage(objectName, methodName, messageValue);
  }

  public ReceiveUnity(messageValue: string) {
    console.log('ReceiveUnity', messageValue);
  }

  public ReceiveUnitySelectItemChenge(messageValue: string) {
    console.log('ReceiveUnitySelectItemChenge', messageValue);
  }
}
