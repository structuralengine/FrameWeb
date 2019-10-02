import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

import { InputDataService } from '../providers/input-data.service';
import { ResultDataService } from '../providers/result-data.service';

@Injectable({
  providedIn: 'root'
})

export class UnityConnectorService {

  private unityInstance: any;
  private inputMode: string;

  constructor(private input: InputDataService,
              private result: ResultDataService) { 
    this.inputMode = 'nodes';
  }

  public setUnityInstance(instance: any):void {
    this.unityInstance = instance;
  }


  // #region unity からメッセージを受け取る
  public ReceiveUnity(message: string) {

    switch (message) {
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

  // 全ての入力データを通知する
  public chengeData() {
    const strJson: string = this.input.getInputText('unity');
    this.unityInstance.SendMessage('ExternalConnect', 'ReceiveData', strJson);
    // テストJson をダウンロード
    this.downloadTestJson('ReceiveData', strJson);
  }

  // 現在アクティブなモードのデータが変更したことを通知する
  public chengeModeData(mode: string) {
    const strJson: string = this.input.getInputText(mode);
    this.unityInstance.SendMessage('ExternalConnect', 'ReceiveModeData', strJson);
    // テストJson をダウンロード
    this.downloadTestJson('ReceiveModeData', strJson);
  }

  // モードが変更したことを通知する
  public ChengeMode(inputModeName: string) {
    this.inputMode = inputModeName;
    this.unityInstance.SendMessage('ExternalConnect', 'ChengeMode', inputModeName);
    // テストJson をダウンロード
    this.downloadTestJson('ChengeMode', inputModeName);
  }

  // 全ての解析結果データを通知する
  public sendResultData() {
    const strJson: string = this.result.getResultText();
    this.unityInstance.SendMessage('ExternalConnect', 'ReceiveResultData', strJson);
    // テストJson をダウンロード
    this.downloadTestJson('ReceiveResultData', strJson);
  }

  // 選択アイテムを通知する
  public SelectItemChange(id: string) {
    this.unityInstance.SendMessage('ExternalConnect', 'SelectItemChange', id);
    // テストJson をダウンロード
    this.downloadTestJson('SelectItemChange', id);
  }

  // テストJson をダウンロード
  private testJsonIndex: number = 0;
  private downloadTestJson(MethodName: string, value: string): void {
    // return // 出荷時は return を有効にする
    let strJson: string = '{"methodName": "' + MethodName + '", "value": ';
    if ( value.slice(0, 1) === '{') {
      strJson += value + '}';
    } else {
      strJson += '"' + value + '"}';
    }

    const blob = new window.Blob([strJson], { type: 'text/plain' });
    this.testJsonIndex ++;
    const fileName: string = this.testJsonIndex.toString() + '_' + MethodName + '.json';
    FileSaver.saveAs(blob, fileName);
  }
  // #endregion

}
