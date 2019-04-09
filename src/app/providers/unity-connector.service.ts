import { Injectable } from '@angular/core';
import { FrameDataService } from '../providers/frame-data.service';
import { ipcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})

export class UnityConnectorService {
  unityInstance: any
  inputMode: string

  constructor(private frame: FrameDataService) { 
    this.inputMode = '/input-nodes';
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
  public chengeData(mode: string = 'unity') {
    let strJson: string = this.frame.getInputText(mode)
    let funcName: string = (mode == 'unity') ? 'ReceiveData' : 'ReceiveModeData';
    this.sendMessageToUnity('ExternalConnect', funcName, strJson);
    try {
      // Unity用 テストコード
      const objJson = JSON.parse(strJson);
      ipcRenderer.sendSync('set_log_file', { methodName: funcName, strJson: objJson });
    }catch{}
  }

  public ChengeMode(mode: string) {
    let inputModeName: string = 'nodes';
    switch (mode) {
      case '/input-nodes':
        inputModeName = 'nodes';
        break;
      case '/input-members':
        inputModeName = 'members';
        break;
      case '/panels ← まだ作成していない画面です。':
        inputModeName = 'panels';
        break;
      case '/input-fix_nodes':
        inputModeName = 'fix_nodes';
        break;
      case '/input-elements':
        inputModeName = 'elements';
        break;
      case '/input-joints':
        inputModeName = 'joints';
        break;
      case '/input-notice_points':
        inputModeName = 'notice_points';
        break;
      case '/input-fix_members':
        inputModeName = 'fix_members';
        break;
      case '/input-load-name':
      case '/input-loads':
        inputModeName = 'loads';
        break;
      case '/result-fsec':
        inputModeName = 'fsec';
        break;
      case '/result-pic_fsec':
      case '/result-comb_fsec':
        inputModeName = 'comb_fsec';
        break;
      case '/result-disg':
        inputModeName = 'disg';
        break;  
      case '/result-comb_disg':
      case '/result-pic_disg':
        inputModeName = 'comb_disg';
        break;
      case '/result-reac':
        inputModeName = 'reac';
        break;
      case '/result-comb_reac':
      case '/result-pic_reac':
        inputModeName = 'comb_reac';
        break;
      default:
        return;
    }
    this.inputMode = mode;
    this.sendMessageToUnity('ExternalConnect', 'ChengeMode', inputModeName);
    try {
      // Unity用 テストコード
      ipcRenderer.sendSync('set_log_file', { methodName: 'ChengeMode', inputModeType: inputModeName });
    }catch{}
  }

  public SelectItemChange(id: string) {
    this.sendMessageToUnity('ExternalConnect', 'SelectItemChange', id);
    try {
    // Unity用 テストコード
      ipcRenderer.sendSync('set_log_file', { methodName: 'SelectItemChange', id: id });
    } catch{ }
  }

  private sendMessageToUnity(objectName: string, methodName: string, messageValue: any = '') {
    if (messageValue == '') {
      this.unityInstance.SendMessage(objectName, methodName);
    } else {
      this.unityInstance.SendMessage(objectName, methodName, messageValue);
    }
  }
  // #endregion

}
