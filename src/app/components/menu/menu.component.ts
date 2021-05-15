import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PrintService } from '../print/print.service';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';

import { UserInfoService } from '../../providers/user-info.service';
import * as FileSaver from 'file-saver';

import { InputDataService } from '../../providers/input-data.service';
import { ResultDataService } from '../../providers/result-data.service';
import { ThreeService } from '../three/three.service';

import * as pako from 'pako';
import { DataCountService } from '../print/invoice/dataCount.service';

import { AuthService } from '../../core/auth.service';
import firebase from 'firebase';
import { DataHelperModule } from 'src/app/providers/data-helper.module';
import { SceneService } from '../three/scene.service';

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
  isCalculated: boolean;
  amount: number;

  constructor(
    private modalService: NgbModal,
    private app: AppComponent,
    private scene: SceneService,
    private helper: DataHelperModule,
    public user: UserInfoService,
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private http: HttpClient,
    private three: ThreeService,
    public printService: PrintService,
    public countArea: DataCountService,
    public auth: AuthService
  ) {
    this.loggedIn = this.user.loggedIn;
    this.fileName = '';
  }

  ngOnInit() {
    this.fileName = "立体骨組構造解析ソフトver1.2.13"
    this.user.isContentsDailogShow = false;
    this.auth.user.subscribe(user => {
      console.log(user);
    });
    this.helper.dimension = 3;

    firebase.firestore().settings({
      ignoreUndefinedProperties: true,
    })
  }


  // 新規作成
  renew(): void {
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.InputData.clear();
    this.ResultData.clear();
    this.three.ClearData();
    this.fileName = "立体骨組構造解析ソフトver1.2.13"
  }

  // ファイルを開く
  open(evt) {
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.InputData.clear();
    this.ResultData.clear();
    this.three.ClearData();
    this.countArea.clear();
    const modalRef = this.modalService.open(WaitDialogComponent);

    const file = evt.target.files[0];
    this.fileName = file.name;
    evt.target.value = '';
    this.fileToText(file)
      .then(text => {
        this.app.dialogClose(); // 現在表示中の画面を閉じる
        this.InputData.loadInputData(text); // データを読み込む
        this.three.fileload();
        modalRef.close();
      })
      .catch(err => {
        alert(err);
        modalRef.close();
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
      this.fileName = 'frameWebForJS.json';
    }
    FileSaver.saveAs(blob, this.fileName);
  }


  // 計算
  public calcrate(): void {

    if (this.loggedIn === true) {
      // alert("計算を開始されるとお客様のポイントを消費しますが、よろしいですか？");
      this.auth.calc(this.amount);
      this.amount = this.auth.amount;
      const modalRef = this.modalService.open(WaitDialogComponent);

      const jsonData: {} = this.InputData.getInputJson(0);
      // console.log(JSON.stringify(jsonData));

      if ('error' in jsonData) {
        alert(jsonData['error']);
        modalRef.close(); // モーダルダイアログを消す
        return;
      }
      this.ResultData.clear(); // 解析結果情報をクリア

      this.post_compress(jsonData, modalRef);
    } else {
      alert("ログインしてください")
    }
  }

  private post_compress(jsonData: {}, modalRef: NgbModalRef) {

    const url = 'https://asia-northeast1-the-structural-engine.cloudfunctions.net/frameWeb-2';
    //const url = 'http://127.0.0.1:5000';

    // json string にする
    const json = JSON.stringify(jsonData, null, 0);
    // pako を使ってgzip圧縮する
    const compressed = pako.gzip(json);
    //btoa() を使ってBase64エンコードする
    const base64Encoded = btoa(compressed);

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
          const json = pako.ungzip(binData, { to: 'string' });


          // テスト ---------------------------------------------
          // this.saveResult(json);
          // --------------------------------------------- テスト*/

          const jsonData = JSON.parse(json);
          // サーバーのレスポンスを集計する
          console.log(jsonData);
          if ( 'error' in jsonData){
            throw jsonData.error;
          }
          // 解析結果を集計する
          this.ResultData.loadResultData(jsonData);
          // ユーザーの保有ポイントの表示を更新する
          this.user.loadResultData(jsonData);
          this.userPoint = this.user.purchase_value.toString();
        } catch (e) {
          alert(e);
        } finally {
          modalRef.close(); // モーダルダイアログを消す
        }
      },
      error => {

        let messege: string = '通信 ' + error.statusText;
        if ('_body' in error) {
          messege += '\n' + error._body;
        }
        alert(messege);
        console.error(error);
        modalRef.close();
      }
    );
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

  // ログイン関係
  logIn(): void {
    this.modalService.open(LoginDialogComponent).result.then((result) => {
      this.loggedIn = this.user.loggedIn;
      setTimeout(() => {
        if (this.loggedIn === true) {
          this.userPoint = this.user.purchase_value.toString();
          this.amount = this.auth.amount;
        }
      }, 200);
    });

    // 「ユーザー名」入力ボックスにフォーカスを当てる
    //document.getElementById("user_name_id").focus();
  }

  logOut(): void {
    this.loggedIn = false;
    this.user.clear();
    this.auth.signOut();
  }

  logout() {
    this.user.loggedIn = false;
    this.auth.signOut();
    this.user.clear();
  }

  //　印刷フロート画面用
  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
  }

  public contentsDailogShow(id): void {
    this.deactiveButtons();
    document.getElementById(id).classList.add('active');
    this.user.isContentsDailogShow = true;
    //this.setDialogHeight();
  }

  // アクティブになっているボタンを全て非アクティブにする
  deactiveButtons() {
    for (let i = 0; i <= 13; i++) {
      const data = document.getElementById(i + '');
      if (data != null) {
        if (data.classList.contains('active')) {
          data.classList.remove('active');
        }
      }
    }
  }
  // 
  setDimension(dim: number){
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.helper.dimension = dim;
    this.scene.createCamera();    // three.js のカメラを変更する
    this.scene.addControls();
    this.scene.render();
  }

  // テスト ---------------------------------------------
  private saveResult(text: string): void {
    const blob = new window.Blob([text], { type: 'text/plain' });
    FileSaver.saveAs(blob, 'frameWebResult.json');
  }

  //解析結果ファイルを開く
  resultopen(evt) {
    const modalRef = this.modalService.open(WaitDialogComponent);

    const file = evt.target.files[0];
    this.fileName = file.name;
    evt.target.value = '';

    this.fileToText(file)
      .then(text => {

        this.app.dialogClose(); // 現在表示中の画面を閉じる
        this.ResultData.clear();
        const jsonData = JSON.parse(text);

        this.ResultData.loadResultData(jsonData);
        modalRef.close();

      })
      .catch(err => {
        alert(err);
        modalRef.close();
      });
  }
  // --------------------------------------------- テスト */


}

