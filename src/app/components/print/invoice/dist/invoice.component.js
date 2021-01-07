"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.InvoiceComponent = void 0;
var core_1 = require("@angular/core");
var InvoiceComponent = /** @class */ (function () {
    function InvoiceComponent(route, printService, InputData, comb, nodes, member, 
    // private define: InputDefineService,
    fixMember, fixNode, 
    // private joint: InputJointComponent,
    // private load: InputLoadComponent,
    notice, 
    // private panel: InputPanelService,
    // private pickup: InputPickupService,
    elements, three, scene) {
        this.printService = printService;
        this.InputData = InputData;
        this.comb = comb;
        this.nodes = nodes;
        this.member = member;
        this.fixMember = fixMember;
        this.fixNode = fixNode;
        this.notice = notice;
        this.elements = elements;
        this.three = three;
        this.scene = scene;
        this.node_dataset = [];
        // public comb_dataset = [];
        // public define_dataset = [];
        this.fixMember_dataset = [];
        this.fixMember_typeNum = [];
        this.fixNode_dataset = [];
        this.fixNode_typeNum = [];
        this.joint_dataset = [];
        this.joint_typeNum = [];
        // public load_dataset = [];
        this.member_dataset = [];
        this.notice_dataset = [];
        // public panel_dataset = [];
        // public pickup_dataset = [];
        this.elements_dataset = [];
        this.elements_typeNum = [];
        this.invoiceIds = route.snapshot.params['invoiceIds']
            .split(',');
        //this.dataset = new Array();
    }
    InvoiceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.invoiceDetails = this.invoiceIds
            .map(function (id) { return _this.getInvoiceDetails(id); });
        Promise.all(this.invoiceDetails)
            .then(function () { return _this.printService.onDataReady(); });
    };
    InvoiceComponent.prototype.getInvoiceDetails = function (invoiceId) {
        var amount = Math.floor((Math.random()));
        return new Promise(function (resolve) {
            return setTimeout(function () { return resolve({ amount: amount }); }, 1);
        });
    };
    InvoiceComponent.prototype.ngAfterViewInit = function () {
        var inputJson = this.InputData.getInputJson(0);
        if ('node' in inputJson) {
            this.node_dataset = this.printNode(inputJson);
        }
        if ('member' in inputJson) {
            this.member_dataset = this.printMember(inputJson);
        }
        if ('element' in inputJson) {
            var tables = this.printElement(inputJson); // {body, title}
            this.elements_dataset = tables.body;
            this.elements_typeNum = tables.title;
        }
        if ('fix_node' in inputJson) {
            var tables = this.printFixnode(inputJson); // {body, title}
            this.fixNode_dataset = tables.body;
            this.fixNode_typeNum = tables.title;
        }
        if ('joint' in inputJson) {
            var tables = this.printjoint(inputJson); // {body, title}
            this.joint_dataset = tables.body;
            this.joint_typeNum = tables.title;
        }
        if ('notice_points' in inputJson) {
            this.notice_dataset = this.printNoticepoints(inputJson);
        }
        if ('fix_member' in inputJson) {
            var tables = this.printFixmember(inputJson); // {body, title}
            this.fixMember_dataset = tables.body;
            this.fixMember_typeNum = tables.title;
        }
        // const LoadJson: any = this.InputData.load.getLoadJson()
        // if (Object.keys(LoadJson).length > 0) {
        //   // 基本荷重データ
        //   printAfterInfo = this.printLoadName(LoadJson);
        //   // 実荷重データ
        //   printAfterInfo = this.printLoad(LoadJson);
        // }
        // const defineJson: any = this.InputData.define.getDefineJson();
        // if (Object.keys(defineJson).length > 0) {
        //   printAfterInfo = this.printDefine(defineJson);
        // }
        // const combineJson: any = this.InputData.combine.getCombineJson();
        // if (Object.keys(combineJson).length > 0) {
        //   printAfterInfo = this.printCombine(combineJson);
        // }
        // const pickupJson: any = this.InputData.pickup.getPickUpJson();
        // if (Object.keys(pickupJson).length > 0) {
        //   printAfterInfo = this.printPickup(pickupJson);
        // }
    };
    // 格子点データ node を印刷する
    InvoiceComponent.prototype.printNode = function (inputJson) {
        var minCount = 5; // これ以上なら２行書きとする
        var printAfterInfo;
        var json = inputJson['node']; // inputJsonからnodeだけを取り出す
        var keys = Object.keys(json);
        var body = [];
        var head;
        if (keys.length < minCount) {
            head = ['No.', 'X(m)', 'Y(m)', 'Z(m)'];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var index = keys_1[_i];
                var item = json[index]; // 1行分のnodeデータを取り出す
                // 印刷する1行分のリストを作る
                var line = new Array();
                line.push(index);
                line.push(item.x.toFixed(3));
                line.push(item.y.toFixed(3));
                line.push(item.z.toFixed(3));
                body.push(line);
            }
        }
        else {
            // 2列表示
            head = ['No.', 'X(m)', 'Y(m)', 'Z(m)', 'No.', 'X(m)', 'Y(m)', 'Z(m)'];
            var n = Math.ceil(keys.length / 2); // 分割位置
            for (var i = 0; i < n; i++) {
                var line = new Array();
                // 左側
                var index1 = keys[i];
                var item1 = json[index1];
                line.push(index1);
                line.push(item1.x.toFixed(3));
                line.push(item1.y.toFixed(3));
                line.push(item1.z.toFixed(3));
                // 右側
                if (keys.length > n + i) {
                    var index2 = keys[n + i];
                    var item2 = json[index2];
                    line.push(index2);
                    line.push(item2.x.toFixed(3));
                    line.push(item2.y.toFixed(3));
                    line.push(item2.z.toFixed(3));
                }
                else {
                    line.push('');
                    line.push('');
                    line.push('');
                    line.push('');
                }
                body.push(line);
            }
        }
        return body;
    };
    //要素データ member を印刷する
    InvoiceComponent.prototype.printMember = function (inputJson) {
        var body = [];
        var json = inputJson['member']; // inputJsonからnodeだけを取り出す
        // // あらかじめテーブルの高さを計算する
        // const dataCount: number = Object.keys(json).length;
        // const TableHeight: number = (dataCount + 1) * (fontsize * 2.3);
        // はみ出るなら改ページ
        // if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
        //   if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
        //     doc.addPage();
        //     currentY = this.margine.top + fontsize;
        //     LineFeed = 0;
        //   }
        // }
        var keys = Object.keys(json);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var index = keys_2[_i];
            var item = json[index]; // 1行分のnodeデータを取り出す
            var len = this.InputData.member.getMemberLength(index); // 部材長さ
            // 印刷する1行分のリストを作る
            var line = new Array();
            line.push(index);
            line.push(item.ni.toString());
            line.push(item.nj.toString());
            line.push(len.toFixed(3));
            line.push(item.e.toString());
            line.push(item.cg.toString());
            body.push(line);
        }
        return body;
    };
    // 材料データ element を印刷する
    InvoiceComponent.prototype.printElement = function (inputJson) {
        var printAfterInfo;
        var json = inputJson['element']; // inputJsonからnodeだけを取り出す
        var keys = Object.keys(json);
        var body = [];
        var head;
        var No = 1;
        var title = new Array();
        for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
            var index = _a[_i];
            title.push(index.toString());
            var elist = json[index]; // 1行分のnodeデータを取り出す
            // // あらかじめテーブルの高さを計算する
            // const dataCount: number = elist.length;;
            // const TableHeight: number = (dataCount + 3) * (fontsize * 2.3);
            // // はみ出るなら改ページ
            // if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
            //   if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
            //     doc.addPage();
            //     currentY = this.margine.top + fontsize;
            //     LineFeed = 0;
            //   }
            // }
            // if (No === 1) {
            //   doc.text(this.margine.left, currentY + LineFeed, "材料データ")
            // }
            var table = []; // この時点でリセット、再定義 一旦空にする
            for (var _b = 0, _c = Object.keys(elist); _b < _c.length; _b++) {
                var key = _c[_b];
                var item = elist[key];
                // 印刷する1行分のリストを作る
                var line = new Array();
                line.push(key);
                line.push(item.A.toFixed(4));
                line.push(item.E.toExponential(2));
                line.push(item.G.toExponential(2));
                line.push(item.Xp.toExponential(2));
                line.push(item.Iy.toFixed(6));
                line.push(item.Iz.toFixed(6));
                line.push(item.J.toFixed(4));
                table.push(line);
            }
            body.push(table);
        }
        return { body: body, title: title };
    };
    // 支点データ fix_node を印刷する
    InvoiceComponent.prototype.printFixnode = function (inputJson) {
        var json = inputJson['fix_node'];
        var keys = Object.keys(json);
        var body = [];
        // const table: any = []; // 下に移動
        var title = new Array();
        for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
            var index = _a[_i];
            var elist = json[index]; // 1行分のnodeデータを取り出す
            title.push(index.toString());
            /*
            body[
              table[
                line[id,tx, ty, tz, rx, ry, rz ]
                line[id,tx, ty, tz, rx, ry, rz ]
                line[id,tx, ty, tz, rx, ry, rz ]
                ...
              ],
              table[
                line[tx, ty, tz, rx, ry, rz ]
                line[tx, ty, tz, rx, ry, rz ]
                line[tx, ty, tz, rx, ry, rz ]
                ...
              ]
            ]
            line2[
              index,
              index,
              index,
              index,
              index,
              index,
            ]
            */
            var table = []; // この時点でリセット、再定義 一旦空にする
            for (var _b = 0, _c = Object.keys(elist); _b < _c.length; _b++) {
                var key = _c[_b];
                var item = elist[key];
                console.log("item", Object.keys(elist));
                // 印刷する1行分のリストを作る
                var line = new Array();
                line.push(item.n);
                line.push(item.tx.toString());
                line.push(item.ty.toString());
                line.push(item.tz.toString());
                line.push(item.rx.toString());
                line.push(item.ry.toString());
                line.push(item.rz.toString());
                table.push(line);
            }
            body.push(table);
        }
        return { body: body, title: title };
    };
    // 結合データ を印刷する
    InvoiceComponent.prototype.printJoint = function (inputJson) {
        var printAfterInfo;
        var json = inputJson['joint'];
        var body = [];
        // const table: any = []; // 下に移動
        var title = new Array();
        for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
            var index = _a[_i];
            var elist = json[index]; // 1行分のnodeデータを取り出す
            title.push(index.toString());
            var table = []; // この時点でリセット、再定義 一旦空にする
            for (var _b = 0, _c = Object.keys(elist); _b < _c.length; _b++) {
                var key = _c[_b];
                var item = elist[key];
                console.log("item", Object.keys(elist));
                // 印刷する1行分のリストを作る
                var line = new Array();
                line.push(item.n);
                line.push(item.xi.toString());
                line.push(item.yi.toString());
                line.push(item.zi.toString());
                line.push(item.xj.toString());
                line.push(item.yj.toString());
                line.push(item.zj.toString());
                table.push(line);
            }
            body.push(table);
        }
        return { body: body, title: title };
    };
    // 着目点データ notice_points を印刷する
    InvoiceComponent.prototype.printNoticepoints = function (inputJson) {
        var printAfterInfo;
        var json = inputJson['notice_points'];
        var body = [];
        for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
            var index = _a[_i];
            var item = json[index]; // 1行分のnodeデータを取り出す
            // 印刷する1行分のリストを作る
            var line = new Array();
            line.push(item.m); // 部材No
            var len = this.InputData.member.getMemberLength(item.m); // 部材長
            if (len !== null) {
                line.push(len.toFixed(3));
            }
            else {
                line.push('');
            }
            var counter = 0;
            for (var _b = 0, _c = Object.keys(item.Points); _b < _c.length; _b++) {
                var key = _c[_b];
                line.push(item.Points[key].toFixed(3));
                counter += 1;
                if (counter === 9) {
                    body.push(line); // 表の1行 登録
                    counter = 0;
                    line = new Array();
                    line.push(''); // 部材No
                    line.push(''); // 部材長
                }
            }
            if (counter > 0) {
                body.push(line); // 表の1行 登録
            }
        }
        return body;
    };
    // バネデータ fix_member を印刷する
    InvoiceComponent.prototype.printFixmember = function (inputJson) {
        var printAfterInfo;
        var body = [];
        var json = inputJson['fix_member'];
        var title = new Array();
        for (var _i = 0, _a = Object.keys(json); _i < _a.length; _i++) {
            var index = _a[_i];
            var elist = json[index]; // 1行分のnodeデータを取り出す
            title.push(index.toString());
            var table = [];
            for (var _b = 0, _c = Object.keys(elist); _b < _c.length; _b++) {
                var key = _c[_b];
                var item = elist[key];
                // 印刷する1行分のリストを作る
                var line = new Array();
                line.push(item.m);
                line.push(item.tx.toString());
                line.push(item.ty.toString());
                line.push(item.tz.toString());
                line.push(item.tr.toString());
                table.push(line);
            }
            body.push(table);
        }
        return { body: body, title: title };
    };
    InvoiceComponent = __decorate([
        core_1.Component({
            selector: 'app-invoice',
            templateUrl: './invoice.component.html',
            styleUrls: ['./invoice.component.scss', '../../../../app.component.scss']
        })
    ], InvoiceComponent);
    return InvoiceComponent;
}());
exports.InvoiceComponent = InvoiceComponent;
