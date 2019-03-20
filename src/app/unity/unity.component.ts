import { Component, Input, OnInit } from '@angular/core';
import { UnityLoader } from './UnityLoader.js';
import { UnityProgress } from './UnityProgress.js';
import { FrameDataService } from '../providers/frame-data.service';

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

  constructor(private frame: FrameDataService) { }

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

  public sendMessageToUnity(objectName: string, methodName: string, messageValue: string = '') {
    if (messageValue == '') {
      this.unityInstance.SendMessage(objectName, methodName); 
    } else {
      this.unityInstance.SendMessage(objectName, methodName, messageValue); 
    }
  }

  public ReceiveUnity(messageValue: string) {
    switch (messageValue) {
      case 'GetInputJSON':
        console.log('Called!!---GetInputJSON');
        //const strJson: string = this.frame.getInputText(1);
        //this.sendMessageToUnity('ExternalConnect', 'ReceiveData', strJson);
        break;
      default:
        break;

    }
    console.log('ReceiveUnity', messageValue);
  }

  public ReceiveUnitySelectItemChenge(messageValue: string) {
    console.log('ReceiveUnitySelectItemChenge', messageValue);
  }
}
