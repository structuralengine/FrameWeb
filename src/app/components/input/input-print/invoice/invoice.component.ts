import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintService } from '../print.service';

import { InputDataService } from '../../../../providers/input-data.service';

import { InputCombineService } from '../../input-combine/input-combine.service';
import { InputDefineService } from '../../input-define/input-define.service';
import { InputNodesService } from '../../input-nodes/input-nodes.service';
import { InputElementsService } from '../../input-elements/input-elements.service';
import { InputMembersService } from '../../input-members/input-members.service';
import { InputFixMemberService } from '../../input-fix-member/input-fix-member.service';
import { AfterViewInit } from '@angular/core';
import { ThreeService } from 'src/app/components/three/three.service';
import { SceneService } from 'src/app/components/three/scene.service';
import { InputFixNodeService } from '../../input-fix-node/input-fix-node.service';
import { InputJointService } from '../../input-joint/input-joint.service';
import { InputLoadService } from '../../input-load/input-load.service';
import { InputNoticePointsService } from '../../input-notice-points/input-notice-points.service';
import { InputPickupService } from '../../input-pickup/input-pickup.service';



@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss', '../../../../app.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public node_dataset = [];
  // public comb_dataset = [];
  // public define_dataset = [];
  // public fixMember_dataset = [];
  public fixNode_dataset = [];
  // public joint_dataset = [];
  // public load_dataset = [];
  public member_dataset = [];
  public notice_dataset = [];
  // public panel_dataset = [];
  // public pickup_dataset = [];
  public elements_dataset = [];

  constructor(route: ActivatedRoute,
    private printService: PrintService,
    private InputData: InputDataService,
    private comb: InputCombineService,
    private nodes: InputNodesService,
    private member: InputMembersService,
    // private define: InputDefineService,
    // private fixMember: InputFixMemberService,
    private fixNode: InputFixNodeService,
    // private joint: InputJointComponent,
    // private load: InputLoadComponent,
    private notice: InputNoticePointsService,
    // private panel: InputPanelService,
    // private pickup: InputPickupService,
    private elements: InputElementsService,
    private three: ThreeService,
    private scene: SceneService,

  ) {
    this.invoiceIds = route.snapshot.params['invoiceIds']
      .split(',');
    //this.dataset = new Array();
  }

  ngOnInit() {

    this.invoiceDetails = this.invoiceIds
      .map(id => this.getInvoiceDetails(id));
    Promise.all(this.invoiceDetails)
      .then(() => this.printService.onDataReady());
  }

  getInvoiceDetails(invoiceId) {

    const amount = Math.floor((Math.random()));
    return new Promise(resolve =>
      setTimeout(() => resolve({ amount }), 1)
    );
  }


  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);


    if ('node' in inputJson) {
      this.node_dataset = this.printNode(inputJson);
    }

    if ('member' in inputJson) {
      this.member_dataset = this.printMember(inputJson);
    }

    if ('element' in inputJson) {
      this.elements_dataset = this.printElement(inputJson);
    }

    if ('fix_node' in inputJson) {
      this.fixNode_dataset = this.printFixnode(inputJson);
    }

    // if ('joint' in inputJson) {
    //   printAfterInfo = this.printJoint(inputJson);
    // }

    if ('notice_points' in inputJson) {
      this.notice_dataset = this.printNoticepoints(inputJson);
    }

    // if ('fix_member' in inputJson) {
    //   printAfterInfo = this.printFixmember(inputJson);
    // }

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


  }

  // 格子点データ node を印刷する
  printNode(inputJson): any {
    const minCount: number = 5; // これ以上なら２行書きとする

    let printAfterInfo: any;

    const json: {} = inputJson['node']; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);

    const body: any = [];
    let head: string[];

    if (keys.length < minCount) {
      head = ['No.', 'X(m)', 'Y(m)', 'Z(m)'];
      for (const index of keys) {
        const item = json[index]; // 1行分のnodeデータを取り出す
        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(index);
        line.push(item.x.toFixed(3));
        line.push(item.y.toFixed(3));
        line.push(item.z.toFixed(3));
        body.push(line);
      }
    } else {
      // 2列表示
      head = ['No.', 'X(m)', 'Y(m)', 'Z(m)', 'No.', 'X(m)', 'Y(m)', 'Z(m)'];
      const n = Math.ceil(keys.length / 2); // 分割位置
      for (let i = 0; i < n; i++) {
        const line: string[] = new Array();
        // 左側
        const index1: string = keys[i];
        const item1 = json[index1];
        line.push(index1);
        line.push(item1.x.toFixed(3));
        line.push(item1.y.toFixed(3));
        line.push(item1.z.toFixed(3));
        // 右側
        if (keys.length > n + i) {
          const index2: string = keys[n + i];
          const item2 = json[index2];
          line.push(index2);
          line.push(item2.x.toFixed(3));
          line.push(item2.y.toFixed(3));
          line.push(item2.z.toFixed(3));
        } else {
          line.push('');
          line.push('');
          line.push('');
          line.push('');
        }
        body.push(line);
      }

    }
    return body;
  }


  //要素データ member を印刷する
  printMember(inputJson): any {

    const body: any = [];
    const json: {} = inputJson['member']; // inputJsonからnodeだけを取り出す

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

    const keys: string[] = Object.keys(json);
    
    for (const index of keys) {
      const item = json[index]; // 1行分のnodeデータを取り出す
      const len: number = this.InputData.member.getMemberLength(index); // 部材長さ
      // 印刷する1行分のリストを作る
      const line: string[] = new Array();
      line.push(index);
      line.push(item.ni.toString());
      line.push(item.nj.toString());
      line.push(len.toFixed(3));
      line.push(item.e.toString());
      line.push(item.cg.toString());
      body.push(line);
    }
    
    return body;
  }

  // 材料データ element を印刷する
  printElement(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['element']; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);
    const body: any = [];
    let head: string[];
    let No: number = 1;
    for (const index of Object.keys(json)) {

      const elist = json[index]; // 1行分のnodeデータを取り出す

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

      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(key);
        line.push(item.A.toFixed(4));
        line.push(item.E.toExponential(2));
        line.push(item.G.toExponential(2));
        line.push(item.Xp.toExponential(2));
        line.push(item.Iy.toFixed(6));
        line.push(item.Iz.toFixed(6));
        line.push(item.J.toFixed(4));
        body.push(line);
      }
    }
    return body;
  }


  // 支点データ fix_node を印刷する
  private printFixnode(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['fix_node'];
    const keys: string[] = Object.keys(json);
    const body: any = [];

    let No: number = 1;
    for (const index of keys) {
      const elist = json[index]; // 1行分のnodeデータを取り出す

      // // あらかじめテーブルの高さを計算する
      // const dataCount: number = elist.length;;
      // const TableHeight: number = (dataCount + 2) * (fontsize * 2.3);

      // // はみ出るなら改ページ
      // if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
      //   if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
      //     doc.addPage();
      //     currentY = this.margine.top + fontsize;
      //     LineFeed = 0;
      //   }
      // }

      // if (No === 1) {
      //   doc.text(this.margine.left, currentY + LineFeed, "支点データ")
      // }

      
      for (const key of keys) {
        const item = elist[key];

        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(item.n);
        line.push(item.tx.toString());
        line.push(item.ty.toString());
        line.push(item.tz.toString());
        line.push(item.rx.toString());
        line.push(item.ry.toString());
        line.push(item.rz.toString());
        body.push(line);
      }
    }
    return body;
  }

  // // 支点データ fix_node を印刷する
  // private printJoint(inputJson, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   const json: {} = inputJson['joint'];

  //   let No: number = 1;
  //   for (const index of Object.keys(json)) {
  //     const elist = json[index]; // 1行分のnodeデータを取り出す

  //     // あらかじめテーブルの高さを計算する
  //     const dataCount: number = elist.length;;
  //     const TableHeight: number = (dataCount + 3) * (fontsize * 2.3);

  //     // はみ出るなら改ページ
  //     if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //       if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //         doc.addPage();
  //         currentY = this.margine.top + fontsize;
  //         LineFeed = 0;
  //       }
  //     }

  //     if (No === 1) {
  //       doc.text(this.margine.left, currentY + LineFeed, "結合データ")
  //     }

  //     const body: any = [];
  //     for (const key of Object.keys(elist)) {
  //       const item = elist[key];

  //       // 印刷する1行分のリストを作る
  //       const line: string[] = new Array();
  //       line.push(item.m);
  //       let text = '';
  //       for (const key of ['xi', 'yi', 'zi']) {
  //         text += (key in item) ? item[key].toString() : '';
  //       }
  //       line.push(text);
  //       text = '';
  //       for (const key of ['xj', 'yj', 'zj']) {
  //         text += (key in item) ? item[key].toString() : '';
  //       }
  //       line.push(text);
  //       body.push(line);
  //     }
  //     doc.autoTable({
  //       theme: ['plain'],
  //       margin: {
  //         left: this.margine.left,
  //         right: this.margine.right
  //       },
  //       styles: { font: 'default', halign: "center" },
  //       startY: fontsize + currentY + LineFeed,
  //       head: [
  //         [{ content: 'TYPE ' + No.toString(), styles: { halign: "left" }, colSpan: 3 }],
  //         ['部材No.', 'i端側', 'j端側'],
  //         ['', 'XYZ', 'XYZ']
  //       ],
  //       body: body,
  //       didParseCell: function (CellHookData) {
  //         printAfterInfo = CellHookData
  //       }
  //     })
  //     No++;
  //     currentY = printAfterInfo.table.finalY;
  //   }
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

  // 着目点データ notice_points を印刷する
  private printNoticepoints(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['notice_points'];

    // // あらかじめテーブルの高さを計算する
    // const dataCount: number = Object.keys(json).length;
    // const TableHeight: number = (dataCount + 1) * (fontsize * 2.3);

    // // はみ出るなら改ページ
    // if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
    //   if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
    //     doc.addPage();
    //     currentY = this.margine.top + fontsize;
    //     LineFeed = 0;
    //   }
    // }

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      line.push(item.m); // 部材No
      const len: number = this.InputData.member.getMemberLength(item.m);// 部材長
      if (len !== null) {
        line.push(len.toFixed(3));
      } else {
        line.push('');
      }

      let counter: number = 0;
      for (const key of Object.keys(item.Points)) {
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
    // doc.text(this.margine.left, currentY + LineFeed, "着目点")
    // doc.autoTable({
    //   theme: ['plain'],
    //   margin: {
    //     left: this.margine.left,
    //     right: this.margine.right
    //   },
    //   styles: { font: 'default', halign: "right" },
    //   startY: fontsize + currentY + LineFeed,
    //   head: [['部材No.', '部材長', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9']],
    //   body: body,
    //   didParseCell: function (CellHookData) {
    //     printAfterInfo = CellHookData
    //   }
    // })
    // LineFeed = this.defaultLinefeed;
    return body;
  }

  // // バネデータ fix_member を印刷する
  // private printFixmember(inputJson, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   const json: {} = inputJson['fix_member'];

  //   let No: number = 1;
  //   for (const index of Object.keys(json)) {
  //     const elist = json[index]; // 1行分のnodeデータを取り出す

  //     // あらかじめテーブルの高さを計算する
  //     const dataCount: number = elist.length;;
  //     const TableHeight: number = (dataCount + 3) * (fontsize * 2.3);

  //     // はみ出るなら改ページ
  //     if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //       if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //         doc.addPage();
  //         currentY = this.margine.top + fontsize;
  //         LineFeed = 0;
  //       }
  //     }

  //     if (No === 1) {
  //       doc.text(this.margine.left, currentY + LineFeed, "バネデータ")
  //     }

  //     const body: any = [];
  //     for (const key of Object.keys(elist)) {
  //       const item = elist[key];

  //       // 印刷する1行分のリストを作る
  //       const line: string[] = new Array();
  //       line.push(item.m);
  //       line.push(item.tx.toString());
  //       line.push(item.ty.toString());
  //       line.push(item.tz.toString());
  //       line.push(item.tr.toString());
  //       body.push(line);
  //     }
  //     doc.autoTable({
  //       theme: ['plain'],
  //       margin: {
  //         left: this.margine.left,
  //         right: this.margine.right
  //       },
  //       styles: { font: 'default', halign: "right" },
  //       startY: fontsize + currentY + LineFeed,
  //       head: [
  //         [{ content: 'TYPE ' + No.toString(), styles: { halign: "left" }, colSpan: 5 }],
  //         ['部材No.', 'TX', 'TY', 'TZ', 'TR'],
  //         ['', 'kN/m', 'kN/m', 'kN/m', 'kN/rad']
  //       ],
  //       body: body,
  //       didParseCell: function (CellHookData) {
  //         printAfterInfo = CellHookData
  //       }
  //     })
  //     No++;
  //     currentY = printAfterInfo.table.finalY;
  //   }
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

  // // 基本荷重データ load name を印刷する
  // private printLoadName(json, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   // あらかじめテーブルの高さを計算する
  //   const dataCount: number = Object.keys(json).length;
  //   const TableHeight: number = (dataCount + 2) * (fontsize * 2.3);

  //   // はみ出るなら改ページ
  //   if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //     if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //       doc.addPage();
  //       currentY = this.margine.top + fontsize;
  //       LineFeed = 0;
  //     }
  //   }

  //   const body: any = [];
  //   for (const index of Object.keys(json)) {
  //     const item = json[index]; // 1行分のnodeデータを取り出す

  //     const rate: number = (item.rate !== null) ? item.rate : 1;
  //     const fix_node: number = (item.fix_node !== null) ? item.fix_node : 1;
  //     const fix_member: number = (item.fix_member !== null) ? item.fix_member : 1;
  //     const element: number = (item.element !== null) ? item.element : 1;
  //     const joint: number = (item.joint !== null) ? item.joint : 1;

  //     // 印刷する1行分のリストを作る
  //     const line: any[] = new Array();
  //     line.push(index);
  //     line.push(rate.toFixed(4));
  //     line.push(item.symbol);
  //     line.push({ content: item.name, styles: { halign: "left" } });
  //     line.push(fix_node.toString());
  //     line.push(fix_member.toString());
  //     line.push(element.toString());
  //     line.push(joint.toString());
  //     body.push(line);
  //   }
  //   doc.text(this.margine.left, currentY + LineFeed, "基本荷重データ")
  //   doc.autoTable({
  //     theme: ['plain'],
  //     margin: {
  //       left: this.margine.left,
  //       right: this.margine.right
  //     },
  //     styles: { font: 'default', halign: 'center' },
  //     startY: fontsize + currentY + LineFeed,
  //     head: [['Case', '', '', '', { content: '構造系条件', styles: { halign: "center" }, colSpan: 4 }],
  //     ['No.', '割増係数', '記号', '荷重名称', '支点', '断面', 'バネ', '結合']
  //     ],
  //     body: body,
  //     didParseCell: function (CellHookData) {
  //       printAfterInfo = CellHookData
  //     }
  //   })
  //   LineFeed = this.defaultLinefeed;

  //   return printAfterInfo;
  // }

  // // 実荷重データ load を印刷する
  // private printLoad(json, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   let No: number = 1;
  //   for (const index of Object.keys(json)) {
  //     const elist = json[index]; // 1行分のnodeデータを取り出す

  //     // あらかじめテーブルの高さを計算する
  //     let mloadCount: number = 0;
  //     if ('load_member' in elist) {
  //       mloadCount = elist.load_member.length;
  //     }
  //     let ploadCount: number = 0;
  //     if ('load_node' in elist) {
  //       ploadCount = elist.load_node.length;
  //     }
  //     const mTableHeight: number = (mloadCount + 2) * (fontsize * 2.3);
  //     const pTableHeight: number = (ploadCount + 1) * (fontsize * 2.3);
  //     const TableHeight: number = mTableHeight + pTableHeight;

  //     // はみ出るなら改ページ
  //     if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //       if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //         doc.addPage();
  //         currentY = this.margine.top + fontsize;
  //         LineFeed = 0;
  //       }
  //     }

  //     if (No === 1) {
  //       doc.text(this.margine.left, currentY + LineFeed, "実荷重データ")
  //     }

  //     // 部材荷重
  //     if (mloadCount > 0) {

  //       const body: any = [];
  //       body.push(['Case ' + index, { content: elist.name, styles: { halign: "left" }, colSpan: 8 }]);

  //       for (const item of elist.load_member) {
  //         // 印刷する1行分のリストを作る
  //         const line: string[] = new Array();
  //         line.push('');
  //         line.push(item.m1);
  //         line.push(item.m2);
  //         line.push(item.direction);
  //         line.push(item.mark);
  //         line.push(item.L1);
  //         line.push(item.L2);
  //         line.push((item.P1 === null) ? '' : item.P1.toFixed(2));
  //         line.push((item.P2 === null) ? '' : item.P2.toFixed(2));
  //         body.push(line);
  //       }
  //       doc.autoTable({
  //         theme: ['plain'],
  //         margin: {
  //           left: this.margine.left,
  //           right: this.margine.right
  //         },
  //         styles: { font: 'default', halign: "right" },
  //         startY: fontsize + currentY + LineFeed,
  //         head: [
  //           ['部材荷重', { content: '部材番号', styles: { halign: "center" }, colSpan: 2 }, '', '', '', '', '', ''],
  //           ['', 'スタート', 'エンド', '方向', 'マーク', 'L1', 'L2', 'P1', 'P2']
  //         ],
  //         body: body,
  //         didParseCell: function (CellHookData) {
  //           printAfterInfo = CellHookData
  //         }
  //       })
  //       currentY = printAfterInfo.table.finalY;
  //     }

  //     // 節点荷重
  //     if (ploadCount > 0) {

  //       const body: any = [];
  //       body.push(['Case ' + index, { content: elist.name, styles: { halign: "left" }, colSpan: 8 }]);

  //       for (const item of elist.load_node) {

  //         const tx = (item.tx !== null) ? item.tx : 0;
  //         const ty = (item.ty !== null) ? item.ty : 0;
  //         const tz = (item.tz !== null) ? item.tz : 0;
  //         const rx = (item.rx !== null) ? item.rx : 0;
  //         const ry = (item.ry !== null) ? item.ry : 0;
  //         const rz = (item.rz !== null) ? item.rz : 0;

  //         // 印刷する1行分のリストを作る
  //         const line: string[] = new Array();
  //         line.push('');
  //         line.push(item.n.toString());
  //         line.push(tx.toFixed(2));
  //         line.push(ty.toFixed(2));
  //         line.push(tz.toFixed(2));
  //         line.push(rx.toFixed(2));
  //         line.push(ry.toFixed(2));
  //         line.push(rz.toFixed(2));
  //         body.push(line);
  //       }
  //       doc.autoTable({
  //         theme: ['plain'],
  //         margin: {
  //           left: this.margine.left,
  //           right: this.margine.right
  //         },
  //         styles: { font: 'default', halign: "right" },
  //         startY: fontsize + currentY + LineFeed,
  //         head: [
  //           ['節点荷重', '節点番号', 'FX', 'FY', 'FZ', 'Mx', 'My', 'Mz']
  //         ],
  //         body: body,
  //         didParseCell: function (CellHookData) {
  //           printAfterInfo = CellHookData
  //         }
  //       })
  //       currentY = printAfterInfo.table.finalY;
  //     }
  //     No++;
  //   }
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

  // // DEFINEデータ  を印刷する
  // private printDefine(json, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   // あらかじめテーブルの高さを計算する
  //   const dataCount: number = Object.keys(json).length;
  //   const TableHeight: number = (dataCount + 1) * (fontsize * 2.3);

  //   // はみ出るなら改ページ
  //   if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //     if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //       doc.addPage();
  //       currentY = this.margine.top + fontsize;
  //       LineFeed = 0;
  //     }
  //   }

  //   const body: any = [];
  //   for (const index of Object.keys(json)) {

  //     const item = json[index]; // 1行分のnodeデータを取り出す

  //     // 印刷する1行分のリストを作る
  //     let line: string[] = new Array();
  //     line.push(index); // DefineNo
  //     let counter: number = 0;
  //     for (const key of Object.keys(item)) {
  //       if (key === 'row') { continue; }
  //       line.push(item[key]);
  //       counter += 1;
  //       if (counter === 10) {
  //         body.push(line); // 表の1行 登録
  //         counter = 0;
  //         line = new Array();
  //         line.push(''); // DefineNo
  //       }
  //     }
  //     if (counter > 0) {
  //       body.push(line); // 表の1行 登録
  //     }
  //   }
  //   doc.text(this.margine.left, currentY + LineFeed, "DEFINEデータ")
  //   doc.autoTable({
  //     theme: ['plain'],
  //     margin: {
  //       left: this.margine.left,
  //       right: this.margine.right
  //     },
  //     styles: { font: 'default', halign: "right" },
  //     startY: fontsize + currentY + LineFeed,
  //     head: [['DefineNo.', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10']],
  //     body: body,
  //     didParseCell: function (CellHookData) {
  //       printAfterInfo = CellHookData
  //     }
  //   })
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

  // // COMBINEデータ  を印刷する
  // private printCombine(json, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   // あらかじめテーブルの高さを計算する
  //   const dataCount: number = Object.keys(json).length;
  //   const TableHeight: number = (2 * dataCount + 2) * (fontsize * 2.3);

  //   // はみ出るなら改ページ
  //   if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //     if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //       doc.addPage();
  //       currentY = this.margine.top + fontsize;
  //       LineFeed = 0;
  //     }
  //   }

  //   const body: any = [];
  //   for (const index of Object.keys(json)) {

  //     const item = json[index]; // 1行分のnodeデータを取り出す

  //     // 印刷する1行分のリストを作る
  //     let line1: any[] = new Array();
  //     let line2: string[] = new Array();
  //     line1.push(index); // CombNo
  //     line2.push('');
  //     if ('name' in item) {
  //       line1.push({ content: item.name, styles: { halign: "left" } }); // 荷重名称
  //     } else {
  //       line1.push('');
  //     }
  //     line2.push('');

  //     let counter: number = 0;
  //     for (const key of Object.keys(item)) {
  //       if (key === 'row') { continue; }
  //       if (key === 'name') { continue; }
  //       line1.push(key.replace('C', ''));
  //       line2.push(item[key]);
  //       counter += 1;
  //       if (counter === 8) {
  //         body.push(line1); // 表の1行 登録
  //         body.push(line2);
  //         counter = 0;
  //         line1 = new Array();
  //         line2 = new Array();
  //         line1.push(''); // CombNo
  //         line2.push('');
  //         line1.push(''); // 荷重名称
  //         line2.push('');
  //       }
  //     }
  //     if (counter > 0) {
  //       body.push(line1); // 表の1行 登録
  //       body.push(line2);
  //     }
  //   }
  //   doc.text(this.margine.left, currentY + LineFeed, "COMBINEデータ")
  //   doc.autoTable({
  //     theme: ['plain'],
  //     margin: {
  //       left: this.margine.left,
  //       right: this.margine.right
  //     },
  //     styles: { font: 'default', halign: "right" },
  //     startY: fontsize + currentY + LineFeed,
  //     head: [['Comb', '', '', '', '', '', '', '', '', ''],
  //     ['No.', { content: '荷重名称', styles: { halign: "left" } }, 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']],
  //     body: body,
  //     didParseCell: function (CellHookData) {
  //       printAfterInfo = CellHookData
  //     }
  //   })
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

  // // PICKUPEデータ  を印刷する
  // private printPickup(json, doc, currentY, fontsize, pageHeight, LineFeed): any {

  //   let printAfterInfo: any;

  //   // あらかじめテーブルの高さを計算する
  //   const dataCount: number = Object.keys(json).length;
  //   const TableHeight: number = (dataCount + 2) * (fontsize * 2.3);

  //   // はみ出るなら改ページ
  //   if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
  //     if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
  //       doc.addPage();
  //       currentY = this.margine.top + fontsize;
  //       LineFeed = 0;
  //     }
  //   }

  //   const body: any = [];
  //   for (const index of Object.keys(json)) {

  //     const item = json[index]; // 1行分のnodeデータを取り出す

  //     // 印刷する1行分のリストを作る
  //     let line: any[] = new Array();
  //     line.push(index); // PickUpNo
  //     if ('name' in item) {
  //       line.push({ content: item.name, styles: { halign: "left" } }); // 荷重名称
  //     } else {
  //       line.push('');
  //     }

  //     let counter: number = 0;
  //     for (const key of Object.keys(item)) {
  //       if (key === 'row') { continue; }
  //       if (key === 'name') { continue; }
  //       line.push(item[key]);
  //       counter += 1;
  //       if (counter === 10) {
  //         body.push(line); // 表の1行 登録
  //         counter = 0;
  //         line = new Array();
  //         line.push(''); // PickUpNo
  //       }
  //     }
  //     if (counter > 0) {
  //       body.push(line); // 表の1行 登録
  //     }
  //   }
  //   doc.text(this.margine.left, currentY + LineFeed, "PICKUPデータ")
  //   doc.autoTable({
  //     theme: ['plain'],
  //     margin: {
  //       left: this.margine.left,
  //       right: this.margine.right
  //     },
  //     styles: { font: 'default', halign: "right" },
  //     startY: fontsize + currentY + LineFeed,
  //     head: [['PickUp', '', '', '', '', '', '', '', '', '', '', ''],
  //     ['No.', { content: '荷重名称', styles: { halign: "left" } }, 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10']
  //     ],
  //     body: body,
  //     didParseCell: function (CellHookData) {
  //       printAfterInfo = CellHookData
  //     }
  //   })
  //   LineFeed = this.defaultLinefeed;
  //   return printAfterInfo;
  // }

}




