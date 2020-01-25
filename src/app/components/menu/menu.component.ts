import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from '../../app.component';
import { Http, Headers } from '@angular/http';

import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';

import { UserInfoService } from '../../providers/user-info.service';
import * as FileSaver from 'file-saver';

import { InputDataService } from '../../providers/input-data.service';
import { ResultDataService } from '../../providers/result-data.service';
import { ThreeService } from '../three/three.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  loginUserName: string;
  userPoint: string;
  loggedIn: boolean;
  fileName: string;

  constructor(private modalService: NgbModal,
              private app: AppComponent,
              private user: UserInfoService,
              private InputData: InputDataService,
              private ResultData: ResultDataService,
              private http: Http,
              private three: ThreeService) {
    this.loggedIn = this.user.loggedIn;
    this.fileName = '';
  }

  ngOnInit() {
  }

  // 新規作成
  renew(): void {
    this.app.dialogClose(); // 現在表示中の画面を閉じる
    this.InputData.clear();
    this.ResultData.clear();
    this.app.isCalculated = false;
    this.three.ClearData();
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
      .catch(err => console.log(err));
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
    const inputJson: string = this.InputData.getInputText();
    const blob = new window.Blob([inputJson], { type: 'text/plain' });
    if (this.fileName.length === 0) {
      this.fileName = 'frameWebForJS.json';
    }
    FileSaver.saveAs(blob, this.fileName);
  }

  // 計算
  calcrate(): void {

    if (this.user.loggedIn === false) {
      this.logIn();
    }
    if (this.user.loggedIn === false) {
      return;
    }

    const modalRef = this.modalService.open(WaitDialogComponent);

    const inputJson = 'inp_grid='
      + this.InputData.getInputText('calc', { username: this.user.loginUserName, password: this.user.loginPassword });

    console.log(inputJson);

    const url = 'http://structuralengine.com/FrameWeb/api/Web_Api.py';

    this.http.post(url, inputJson, {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      })
    }).subscribe(
      response => {
        // 通信成功時の処理（成功コールバック）
        console.log('通信成功!!');
        console.log(response.text());

        if (!this.ResultData.loadResultData(response.text())) {
          alert(response.text());
        } else {
          this.loadResultData(response.text());
          this.app.isCalculated = true;
          this.three.chengeData();
        }
        modalRef.close();
      },
      error => {
        // 通信失敗時の処理（失敗コールバック）
        this.app.isCalculated = false;
        console.log(error.statusText);
        modalRef.close();
      }
    );
  }

  private loadResultData(resultText: string): void {
    this.user.loadResultData(resultText);
    this.userPoint = this.user.purchase_value.toString();
  }

  // 印刷
  print(): void {

  }

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
