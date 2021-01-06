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
  public comb_dataset = [];
  public define_dataset = [];
  public fixMember_dataset = [];
  public fixMember_typeNum = [];
  public fixNode_dataset = [];
  public fixNode_typeNum = [];
  public joint_dataset = [];
  public joint_typeNum = [];
  public loadName_dataset = [];
  public load_title = [];
  public load_member = [];
  public load_node = [];
  public member_dataset = [];
  public notice_dataset = [];
  // public panel_dataset = [];
  public pickup_dataset = [];
  public elements_dataset = [];
  public elements_typeNum = [];


  constructor(route: ActivatedRoute,
    private printService: PrintService,
    private InputData: InputDataService,
    private comb: InputCombineService,
    private nodes: InputNodesService,
    private member: InputMembersService,
    private define: InputDefineService,
    private fixMember: InputFixMemberService,
    private fixNode: InputFixNodeService,
    private joint: InputJointService,
    private load: InputLoadService,
    private notice: InputNoticePointsService,
    // private panel: InputPanelService,
    private pickup: InputPickupService,
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
      const tables = this.printElement(inputJson); // {body, title}
      this.elements_dataset = tables.body;
      this.elements_typeNum = tables.title;
      console.log("dsaffds", tables)

    }

    if ('fix_node' in inputJson) {
      const tables = this.printFixnode(inputJson); // {body, title}
      this.fixNode_dataset = tables.body;
      this.fixNode_typeNum = tables.title;
    }

    if ('joint' in inputJson) {
      const tables = this.printjoint(inputJson); // {body, title}
      this.joint_dataset = tables.body;
      this.joint_typeNum = tables.title;
    }

    if ('notice_points' in inputJson) {
      this.notice_dataset = this.printNoticepoints(inputJson);
    }

    if ('fix_member' in inputJson) {
      const tables = this.printFixmember(inputJson); // {body, title}
      this.fixMember_dataset = tables.body;
      this.fixMember_typeNum = tables.title;
    }

    const LoadJson: any = this.InputData.load.getLoadJson();
    if (Object.keys(LoadJson).length > 0) {
      // 基本荷重データ
      this.loadName_dataset = this.printLoadName(LoadJson);

      // 実荷重データ
      const tables = this.printLoad(LoadJson);
      // title, memberData, nodeData
      this.load_title = tables.titleSum;
      this.load_member = tables.memberSum;
      this.load_node = tables.nodeSum;
    }

    const defineJson: any = this.InputData.define.getDefineJson();
    if (Object.keys(defineJson).length > 0) {
      this.define_dataset = this.printDefine(defineJson);

    }

    const combineJson: any = this.InputData.combine.getCombineJson();
    if (Object.keys(combineJson).length > 0) {
      this.comb_dataset = this.printCombine(combineJson);
    }


    const pickupJson: any = this.InputData.pickup.getPickUpJson();
    if (Object.keys(pickupJson).length > 0) {
      this.pickup_dataset = this.printPickup(pickupJson);
    }

  }


  // 格子点データ node を印刷する
  private printNode(inputJson): any {
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
  private printMember(inputJson): any {

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
  private printElement(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['element']; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);
    const body: any = [];
    let head: string[];
    let No: number = 1;
    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      title.push(index.toString());
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
      const table: any = []; // この時点でリセット、再定義 一旦空にする
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
        table.push(line);
      }
      body.push(table);
    }
    return { body, title };
  }


  // 支点データ fix_node を印刷する
  private printFixnode(inputJson): any {

    const json: {} = inputJson['fix_node'];
    const keys: string[] = Object.keys(json);
    const body: any = [];
    // const table: any = []; // 下に移動
    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
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

      const table: any = []; // この時点でリセット、再定義 一旦空にする
      for (const key of Object.keys(elist)) {
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
        table.push(line);

      }
      body.push(table);
    }
    return { body, title };
  }

  // 結合データ を印刷する
  private printjoint(inputJson): any {

    const json: {} = inputJson['joint'];

    const body: any = [];
    // const table: any = []; // 下に移動
    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      title.push(index.toString());
      const table: any = []; // この時点でリセット、再定義 一旦空にする
      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る

        const line: string[] = new Array();
        line.push(item.m);
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
    return { body, title };

  }

  // 着目点データ notice_points を印刷する
  private printNoticepoints(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['notice_points'];

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
    return body;
  }

  // バネデータ fix_member を印刷する
  private printFixmember(inputJson): any {

    const body: any = [];
    const json: {} = inputJson['fix_member'];

    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      title.push(index.toString());
      const table: any = [];
      for (const key of Object.keys(elist)) {
        const item = elist[key];

        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(item.m);
        line.push(item.tx.toString());
        line.push(item.ty.toString());
        line.push(item.tz.toString());
        line.push(item.tr.toString());
        table.push(line);
      }
      body.push(table);
    }
    return { body, title };
  }

  // 基本荷重データ load name を印刷する
  private printLoadName(json): any {
    const body: any = [];
    const dataCount: number = Object.keys(json).length;
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す
      /*let rate: number
      if(item.rate !== null){
        rate = item.rate;
      } else {
        rate = 1;
      } */
      const rate: number = (item.rate !== null) ? item.rate : 1;
      const fix_node: number = (item.fix_node !== null) ? item.fix_node : 1;
      const fix_member: number = (item.fix_member !== null) ? item.fix_member : 1;
      const element: number = (item.element !== null) ? item.element : 1;
      const joint: number = (item.joint !== null) ? item.joint : 1;

      // 印刷する1行分のリストを作る
      const line: any[] = new Array();
      line.push(index);
      line.push(rate.toFixed(4));
      line.push(item.symbol);
      line.push(item.name);
      line.push(fix_node.toString());
      line.push(fix_member.toString());
      line.push(element.toString());
      line.push(joint.toString());
      body.push(line);

    }
    return body;
  }

  // 実荷重データ load 部材荷重 を印刷する
  private printLoad(json): any {
    const titleSum: any = [];
    const memberSum: any = [];
    const nodeSum: any = [];


    // const title: string[] = new Array();

    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      //データ数が0かどうかの判定
      const memberData: any = [];
      const nodeData: any = [];
      const title: any = [];

      let mloadCount: number = 0;
      if ('load_member' in elist) {
        mloadCount = elist.load_member.length;
      }

      let ploadCount: number = 0;
      if ('load_node' in elist) {
        ploadCount = elist.load_node.length;
      }

      if (mloadCount <= 0 && ploadCount <= 0) {
        continue; // 印刷すべきデータがなければ スキップ
      }

      // タイトル
      title.push(['Case ' + index, elist.name]);

      //部材荷重
      if (mloadCount > 0) {
        for (const item of elist.load_member) {
          // 印刷する1行分のリストを作る
          const line: string[] = new Array();
          line.push('');
          line.push(item.m1);
          line.push(item.m2);
          line.push(item.direction);
          line.push(item.mark);
          line.push(item.L1);
          line.push(item.L2);
          line.push((item.P1 === null) ? '' : item.P1.toFixed(2));
          line.push((item.P2 === null) ? '' : item.P2.toFixed(2));
          memberData.push(line);

        }
      }

      // 節点荷重
      if (ploadCount > 0) {
        for (const item of elist.load_node) {

          const tx = (item.tx !== null) ? item.tx : 0;
          const ty = (item.ty !== null) ? item.ty : 0;
          const tz = (item.tz !== null) ? item.tz : 0;
          const rx = (item.rx !== null) ? item.rx : 0;
          const ry = (item.ry !== null) ? item.ry : 0;
          const rz = (item.rz !== null) ? item.rz : 0;

          // 印刷する1行分のリストを作る
          const line: string[] = new Array();
          line.push('');
          line.push(item.n.toString());
          line.push(tx.toFixed(2));
          line.push(ty.toFixed(2));
          line.push(tz.toFixed(2));
          line.push(rx.toFixed(2));
          line.push(ry.toFixed(2));
          line.push(rz.toFixed(2));
          nodeData.push(line);
        }
      }

      titleSum.push(title);
      memberSum.push(memberData);
      nodeSum.push(nodeData);
    }

    return { titleSum, memberSum, nodeSum };
  }


  // DEFINEデータ  を印刷する
  private printDefine(json): any {

    //let printAfterInfo: any;

    const dataCount: number = Object.keys(json).length;

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      line.push(index); // DefineNo
      let counter: number = 0;
      const table: any = [];
      for (const key of Object.keys(item)) {
        //  if (key === 'row') { continue; }
        line.push(item[key]);
        counter += 1;
        if (counter === 10) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(''); // DefineNo
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
      }
    }

    return body;
  }

  // COMBINEデータ  を印刷する
  private printCombine(json): any {

    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す

      if (index == "3") {
        console.log("2番目の処理が正常に完了")
      }

      // 印刷する1行分のリストを作る
      let line1: any[] = new Array();
      let line2: string[] = new Array();
      line1.push(index); // CombNo
      line2.push('');
      if ('name' in item) {
        line1.push(item.name); // 荷重名称
      } else {
        line1.push('');
      }
      line2.push('');

      if (index == "1") {
        console.log("2番目の処理が正常に完了");
        console.log("1", line1)
      }

      let counter: number = 0;
      for (const key of Object.keys(item)) {
        if (key === 'row') { continue; }
        if (key === 'name') { continue; }
        line1.push(key.replace('C', ''));
        line2.push(item[key]);
        counter += 1;
        if (counter === 8) {
          body.push(line1); // 表の1行 登録
          body.push(line2);
          counter = 0;
          line1 = new Array();
          line2 = new Array();
          line1.push(''); // CombNo
          line2.push('');
          line1.push(''); // 荷重名称
          line2.push('');
        }
      }
      if (counter > 0) {
        body.push(line1); // 表の1行 登録
        body.push(line2);
      }
    }
    return body;
  }

  // PICKUEデータ  を印刷する
  private printPickup(json): any {


    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: any[] = new Array();
      line.push(index); // PickUpNo
      if ('name' in item) {
        line.push(item.name); // 荷重名称
      } else {
        line.push('');
      }

      let counter: number = 0;
      for (const key of Object.keys(item)) {
        if (key === 'row') { continue; }
        if (key === 'name') { continue; }
        line.push(item[key]);
        counter += 1;
        if (counter === 10) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(''); // PickUpNo
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
      }
    }
    return body;
  }

}


