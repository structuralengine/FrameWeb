import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { Router } from '@angular/router';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';

import { UserInfoService } from '../../providers/user-info.service';
import * as FileSaver from 'file-saver';

import { InputDataService } from '../../providers/input-data.service';
import { ResultDataService } from '../../providers/result-data.service';
import { ThreeService } from '../three/three.service';

import { PrintDataModule } from '../../providers/print-data.module';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as pako from 'pako';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss', '../../app.component.scss']
})
export class MenuComponent implements OnInit {

  loginUserName: string;
  userPoint: string;
  loggedIn: boolean;
  fileName: string;

  constructor(private modalService: NgbModal,
    private app: AppComponent,
    private router: Router,
    private user: UserInfoService,
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private http: HttpClient,
    private three: ThreeService,
    private printData: PrintDataModule) {
    this.loggedIn = this.user.loggedIn;
    this.fileName = '';
  }

  ngOnInit() {
    this.fileName = "立体骨組構造解析ソフトver1.1.0"
  }


  // 新規作成
  renew(): void {
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.InputData.clear();
    this.ResultData.clear();
    this.app.isCalculated = false;
    this.three.ClearData();
    this.fileName = "立体骨組構造解析ソフトver1.1.0"
  }

  // ファイルを開く
  open(evt) {
    const file = evt.target.files[0];
    this.fileName = file.name;
    evt.target.value = '';
    this.fileToText(file)
      .then(text => {
        this.app.dialogClose(); // 現在表示中の画面を閉じる
        this.InputData.loadInputData(text); // データを読み込む
        this.app.isCalculated = false;
        this.three.chengeData('fileLoad');
      })
      .catch(err => {
        console.log(err);
      });
  }

  private fileToText(file): any {
    const reader = new FileReader();
    reader.readAsText(file);
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  // ファイルを保存
  save(): void {
    const inputJson: string = JSON.stringify(this.InputData.getInputJson());
    const blob = new window.Blob([inputJson], { type: 'text/plain' });
    if (this.fileName.length === 0) {
      this.fileName = 'frameWebForJS.fwj';
    }
    FileSaver.saveAs(blob, this.fileName);
  }


  // 計算
  public calcrate(): void {
    /*
        if (this.user.loggedIn === false) {
          this.logIn();
        }
        if (this.user.loggedIn === false) {
          return;
        }
    */


    const modalRef = this.modalService.open(WaitDialogComponent);

    const jsonData: {} = this.InputData.getInputJson(0);

    if ('error' in jsonData) {
      alert(jsonData['error']);
      modalRef.close(); // モーダルダイアログを消す
      return;
    }

    this.ResultData.clear(); // 解析結果情報をクリア

    this.post_compress(jsonData, modalRef);
    /* // 旧式：Json データをそのままポストする場合
    const inputJson = { username: this.user.loginUserName, password: this.user.loginPassword };
    for (const key of Object.keys(jsonData)) {
      if ('load' === key) {
        continue;
      }
      inputJson[key] = jsonData[key];
    }
    const Keys = Object.keys(jsonData['load']);
    this.post(inputJson, jsonData['load'], Keys, 0, modalRef);
    */

  }

  private post_compress(jsonData: {}, modalRef: NgbModalRef) {

    const json = JSON.stringify(jsonData, null, 0);   // json string にする
    const compressed = pako.gzip(json); // pako を使ってgzip圧縮する
    const base64Encoded = btoa(compressed); //btoa() を使ってBase64エンコードする

    //const url = 'https://asia-northeast1-the-structural-engine.cloudfunctions.net/frameWeb-2';
    const url = 'http://127.0.0.1:5000';

    this.http.post(url, base64Encoded, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip,base64'
      }),
      responseType: 'text'
    }).subscribe(
      response => {
        // 通信成功時の処理（成功コールバック）
        console.log('通信成功!!');
        try {
          // Decode base64 (convert ascii to binary)
          const strData = atob(response);
          // Convert binary string to character-number array
          const charData = strData.split('').map(function (x) { return x.charCodeAt(0); });
          // Turn number array into byte-array
          const binData = new Uint8Array(charData);
          // Pako magic
          const json = pako.ungzip(binData,{to: 'string'} );

          const jsonData = JSON.parse(json);
          // サーバーのレスポンスを集計する
          if (!this.ResultData.loadResultData(jsonData)) {
            throw '解析結果の集計に失敗しました';
          } else {
            console.log(jsonData);
            // ユーザーポイントの更新
            this.loadResultData(jsonData);
            // 全ての解析ケースを計算し終えたら
            this.ResultData.CombinePickup(); // 組み合わせケースを集計する
            this.three.chengeData();
          }
        } catch (e) {
          alert(e);
        } finally {
          modalRef.close(); // モーダルダイアログを消す
        }
      },
      error => {
        // 通信失敗時の処理（失敗コールバック）
        this.app.isCalculated = false;

        let messege: string = '通信 ' + error.statusText;
        if ('_body' in error) {
          messege += '\n' + error._body;
        }
        alert(messege);
        modalRef.close();
      }
    );
  }

  private bytes(url: string): Array<number> {
    const data: number[] = new Array();
    for (let i = 0; i < url.length; i++) {
      data.push(url.charCodeAt(i));
    }
    return data;
  }

  /* // 旧式：Json データをそのままポストする場合
  private post(jsonData: object, load: object, Keys: string[], index: number, modalRef: NgbModalRef) {

    if (Keys.length <= index) {
      // 全ての解析ケースを計算し終えたら
      this.ResultData.CombinePickup(); // 組み合わせケースを集計する
      this.three.chengeData();
      modalRef.close(); // モーダルダイアログを消す
      return;
    }
    const key: string = Keys[index];
    const current = {};
    current[key] = load[key];
    jsonData['load'] = current;
    const inputJson = JSON.stringify(jsonData);
    console.log('荷重ケース ' + key);
    console.log(inputJson);

    const compressed = pako.gzip(inputJson);
    console.log(compressed);

    // const url = 'https://uij0y12e2l.execute-api.ap-northeast-1.amazonaws.com/default/Frame3D';
    //const url = 'https://asia-northeast1-the-structural-engine.cloudfunctions.net/frameWeb';
    const url = 'http://127.0.0.1:5000';

    this.http.post(url, inputJson, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe(
      response => {
        // 通信成功時の処理（成功コールバック）
        console.log('通信成功!! 解析ケース' + index.toString());

        // サーバーのレスポンスを集計する
        if (!this.ResultData.loadResultData(response)) {
          alert('解析結果の集計に失敗しました');
        } else {
          console.log(response);
          // ユーザーポイントの更新
          this.loadResultData(response);
        }
        this.post(jsonData, load, Keys, index + 1, modalRef);
      },
      error => {
        // 通信失敗時の処理（失敗コールバック）
        this.app.isCalculated = false;

<<<<<<< HEAD
        let messege: string =  '通信 ' + error.statusText;
        if ('_body' in error){
=======
        let messege: string = '通信 ' + error.statusText;
        if ('_body' in error) {
>>>>>>> develop
          messege += '\n' + error._body;
        }
        alert(messege);
        modalRef.close();
      }
    );
  }
  */

  private loadResultData(jsonData: object): void {
    this.user.loadResultData(jsonData);
    this.userPoint = this.user.purchase_value.toString();
    this.app.Calculated(this.ResultData);
  }

  // ピックアップファイル出力
  public pickup(): void {
    const pickupJson: string = this.ResultData.GetPicUpText();
    const blob = new window.Blob([pickupJson], { type: 'text/plain' });
    let filename: string = 'frameWebForJS.csv';
    if (this.fileName.length > 0) {
      filename = this.fileName.split('.').slice(0, -1).join('.')
      filename += '.csv';
    }

    FileSaver.saveAs(blob, filename);
  }

  /*
  // 印刷
  print(): void {
    const doc = this.printData.printData(this.router.url.replace('/', ''));
    // 印刷実行
    doc.output('dataurlnewwindow');
  }
  */

  // ログイン関係 
  logIn(): void {
    this.modalService.open(LoginDialogComponent).result.then((result) => {
      this.loggedIn = this.user.loggedIn;
      if (this.loggedIn === true) {
        this.loginUserName = this.user.loginUserName;
        this.userPoint = this.user.purchase_value.toString();
      }
    });

    // 「ユーザー名」入力ボックスにフォーカスを当てる
    document.getElementById("user_name_id").focus();
  }

  logOut(): void {
    this.loggedIn = false;
    this.user.clear();
  }

}
