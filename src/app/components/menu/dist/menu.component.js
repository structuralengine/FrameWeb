"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MenuComponent = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var login_dialog_component_1 = require("../login-dialog/login-dialog.component");
var wait_dialog_component_1 = require("../wait-dialog/wait-dialog.component");
var FileSaver = require("file-saver");
require("jspdf-autotable");
var MenuComponent = /** @class */ (function () {
    function MenuComponent(modalService, app, router, user, InputData, ResultData, http, three, printData) {
        this.modalService = modalService;
        this.app = app;
        this.router = router;
        this.user = user;
        this.InputData = InputData;
        this.ResultData = ResultData;
        this.http = http;
        this.three = three;
        this.printData = printData;
        this.loggedIn = this.user.loggedIn;
        this.fileName = '';
    }
    MenuComponent.prototype.ngOnInit = function () {
    };
    // 新規作成
    MenuComponent.prototype.renew = function () {
        this.app.dialogClose(); // 現在表示中の画面を閉じる
        this.InputData.clear();
        this.ResultData.clear();
        this.app.isCalculated = false;
        this.three.ClearData();
    };
    // ファイルを開く
    MenuComponent.prototype.open = function (evt) {
        var _this = this;
        var file = evt.target.files[0];
        this.fileName = file.name;
        evt.target.value = '';
        this.fileToText(file)
            .then(function (text) {
            _this.app.dialogClose(); // 現在表示中の画面を閉じる
            _this.InputData.loadInputData(text); // データを読み込む
            _this.app.isCalculated = false;
            _this.three.chengeData('fileLoad');
        })["catch"](function (err) {
            console.log(err);
        });
    };
    MenuComponent.prototype.fileToText = function (file) {
        var reader = new FileReader();
        reader.readAsText(file);
        return new Promise(function (resolve, reject) {
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject(reader.error);
            };
        });
    };
    // ファイルを保存
    MenuComponent.prototype.save = function () {
        var inputJson = JSON.stringify(this.InputData.getInputJson());
        var blob = new window.Blob([inputJson], { type: 'text/plain' });
        if (this.fileName.length === 0) {
            this.fileName = 'frameWebForJS.fwj';
        }
        FileSaver.saveAs(blob, this.fileName);
    };
    // 計算
    MenuComponent.prototype.calcrate = function () {
        /*
            if (this.user.loggedIn === false) {
              this.logIn();
            }
            if (this.user.loggedIn === false) {
              return;
            }
        */
        var modalRef = this.modalService.open(wait_dialog_component_1.WaitDialogComponent);
        var jsonData = this.InputData.getInputJson(0);
        // console.log(JSON.stringify(jsonData));
        if ('error' in jsonData) {
            alert(jsonData['error']);
            modalRef.close(); // モーダルダイアログを消す
            return;
        }
        var inputJson = { username: this.user.loginUserName, password: this.user.loginPassword };
        for (var _i = 0, _a = Object.keys(jsonData); _i < _a.length; _i++) {
            var key = _a[_i];
            if ('load' === key) {
                continue;
            }
            inputJson[key] = jsonData[key];
        }
        this.ResultData.clear(); // 解析結果情報をクリア
        var Keys = Object.keys(jsonData['load']);
        this.post(inputJson, jsonData['load'], Keys, 0, modalRef);
    };
    MenuComponent.prototype.post = function (jsonData, load, Keys, index, modalRef) {
        var _this = this;
        if (Keys.length <= index) {
            // 全ての解析ケースを計算し終えたら
            this.ResultData.CombinePickup(); // 組み合わせケースを集計する
            this.three.chengeData();
            modalRef.close(); // モーダルダイアログを消す
            return;
        }
        var key = Keys[index];
        var current = {};
        current[key] = load[key];
        jsonData['load'] = current;
        var inputJson = JSON.stringify(jsonData);
        console.log('荷重ケース ' + key);
        console.log(inputJson);
        // const url = 'https://uij0y12e2l.execute-api.ap-northeast-1.amazonaws.com/default/Frame3D';
        var url = 'https://asia-northeast1-the-structural-engine.cloudfunctions.net/frameWeb';
        this.http.post(url, inputJson, {
            headers: new http_1.HttpHeaders({
                'Content-Type': 'application/json'
            })
        }).subscribe(function (response) {
            // 通信成功時の処理（成功コールバック）
            console.log('通信成功!! 解析ケース' + index.toString());
            // サーバーのレスポンスを集計する
            if (!_this.ResultData.loadResultData(response)) {
                alert('解析結果の集計に失敗しました');
            }
            else {
                console.log(response);
                // ユーザーポイントの更新
                _this.loadResultData(response);
            }
            _this.post(jsonData, load, Keys, index + 1, modalRef);
        }, function (error) {
            // 通信失敗時の処理（失敗コールバック）
            _this.app.isCalculated = false;
            var messege = '通信 ' + error.statusText;
            if ('_body' in error) {
                messege += '\n' + error._body;
            }
            alert(messege);
        });
    };
    MenuComponent.prototype.loadResultData = function (jsonData) {
        this.user.loadResultData(jsonData);
        this.userPoint = this.user.purchase_value.toString();
        this.app.Calculated(this.ResultData);
    };
    // ピックアップファイル出力
    MenuComponent.prototype.pickup = function () {
        var pickupJson = this.ResultData.GetPicUpText();
        var blob = new window.Blob([pickupJson], { type: 'text/plain' });
        var filename = 'frameWebForJS.csv';
        if (this.fileName.length > 0) {
            filename = this.fileName.split('.').slice(0, -1).join('.');
            filename += '.csv';
        }
        FileSaver.saveAs(blob, filename);
    };
    // 印刷
    MenuComponent.prototype.print = function () {
        var doc = this.printData.printData(this.router.url.replace('/', ''));
        // 印刷実行
        doc.output('dataurlnewwindow');
    };
    // ログイン関係 
    MenuComponent.prototype.logIn = function () {
        var _this = this;
        this.modalService.open(login_dialog_component_1.LoginDialogComponent).result.then(function (result) {
            _this.loggedIn = _this.user.loggedIn;
            if (_this.loggedIn === true) {
                _this.loginUserName = _this.user.loginUserName;
                _this.userPoint = _this.user.purchase_value.toString();
            }
        });
        // 「ユーザー名」入力ボックスにフォーカスを当てる
        document.getElementById("user_name_id").focus();
    };
    MenuComponent.prototype.logOut = function () {
        this.loggedIn = false;
        this.user.clear();
    };
    MenuComponent = __decorate([
        core_1.Component({
            selector: 'app-menu',
            templateUrl: './menu.component.html',
            styleUrls: ['./menu.component.scss']
        })
    ], MenuComponent);
    return MenuComponent;
}());
exports.MenuComponent = MenuComponent;
