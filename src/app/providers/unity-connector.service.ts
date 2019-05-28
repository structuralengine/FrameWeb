import { Injectable } from '@angular/core';
import { FrameDataService } from '../providers/frame-data.service';

@Injectable({
  providedIn: 'root'
})

export class UnityConnectorService {
  unityInstance: any;
  inputMode: string;

  constructor(private frame: FrameDataService) { 
    this.inputMode = 'nodes';
  }

  public setUnityInstance(instance: any):void {
    this.unityInstance = instance;
  }


  // #region unity からメッセージを受け取る
  public ReceiveUnity(messageValue: string) {

    switch (messageValue) {
      case 'GetInputJSON':
        this.chengeData();
        break;

      case 'GetInputMode':
        this.ChengeMode(this.inputMode);
        break;

      default:
        break;
    }
  }

  public ReceiveUnitySelectItemChenge(id: string) {
    console.log('ReceiveUnitySelectItemChenge', id);
  }

  // #endregion

  // #region unity にメッセージを送る

  // 入力の変更時の処理
  public sendResultData() {
    const strJson: string = this.frame.getResultText();
    console.log('%c' + strJson, 'color: magenta');
    this.sendMessageToUnity('ExternalConnect', 'ReceiveResultData', strJson);
  }

  public chengeData(mode: string = 'unity') {
    const strJson: string = this.frame.getInputText(mode);
    console.log('%c' + mode, 'color: green');
    console.log('%c' + strJson, 'color: red');
    const funcName: string = (mode === 'unity') ? 'ReceiveData' : 'ReceiveModeData';
    this.sendMessageToUnity('ExternalConnect', funcName, strJson);
  }

  public ChengeMode(inputModeName: string) {
    this.inputMode = inputModeName;
    this.sendMessageToUnity('ExternalConnect', 'ChengeMode', inputModeName);
  }


  public SelectItemChange(id: string) {
    this.sendMessageToUnity('ExternalConnect', 'SelectItemChange', id);
  }

  private sendMessageToUnity(objectName: string, methodName: string, messageValue: any = '') {
    try {
      if (messageValue === '') {
        this.unityInstance.SendMessage(objectName, methodName);
      } else {
        this.unityInstance.SendMessage(objectName, methodName, messageValue);
      }
    } catch(e){
      console.log('sendMessageToUnityでエラー');
      console.log(e);
    }
  }
  // #endregion

}
