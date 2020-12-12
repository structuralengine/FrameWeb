"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppComponent = void 0;
var core_1 = require("@angular/core");
var AppComponent = /** @class */ (function () {
    function AppComponent(_router, ResultData, user) {
        this._router = _router;
        this.ResultData = ResultData;
        this.user = user;
    }
    AppComponent.prototype.ngOnInit = function () {
        this.user.isContentsDailogShow = false;
        this.isCalculated = false;
    };
    AppComponent.prototype.dialogClose = function () {
        this.user.isContentsDailogShow = false;
        this.deactiveButtons();
    };
    AppComponent.prototype.contentsDailogShow = function (id) {
        this.deactiveButtons();
        document.getElementById(id).classList.add('active');
        this.user.isContentsDailogShow = true;
        this.setDialogHeight();
    };
    // 解析終了したら呼ばれる関数
    AppComponent.prototype.Calculated = function (ResultData) {
        this.isCalculated = true;
        if (ResultData.reac.REAC_ROWS_COUNT > 0) {
            this.btnReac = 'btn btn-outline-primary';
        }
        else {
            this.btnReac = 'btn btn-outline-primary disabled';
        }
    };
    // アクティブになっているボタンを全て非アクティブにする
    AppComponent.prototype.deactiveButtons = function () {
        for (var i = 0; i <= 12; i++) {
            var data = document.getElementById(i + '');
            if (data != null) {
                if (data.classList.contains('active')) {
                    data.classList.remove('active');
                }
            }
        }
    };
    // contents-dialogの高さをウィンドウサイズに合わせる
    AppComponent.prototype.setDialogHeight = function () {
        setTimeout(function () {
            var dialog = document.getElementById('contents-dialog-id');
            // ヘッダ領域を取得
            var header = document.getElementsByClassName('header');
            var container = document.getElementsByClassName('container');
            var headerSize = container[0].clientHeight + header[0].clientHeight + 30;
            dialog.style.height = window.innerHeight - headerSize + 'px';
            console.log('dialog height:' + dialog.style.height);
        }, 100);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.scss']
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
