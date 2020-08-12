import { NgModule } from '@angular/core';

import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

@NgModule({
  imports: [],
  exports: []
})
export class PrintDataModule {

  private defaultTableMargin = 30;

  constructor() { }

  public printInputData(inputJson: any): any {

    const doc = new jsPDF('p', 'pt', 'a4', false);
    doc.addFileToVFS("test.ttf", this.getFont());
    doc.addFont('test.ttf', 'test', 'normal');
    doc.setFont('test', 'normal');

    const fontsize: number = 10;
    doc.setFontSize(fontsize);
 
    let height = 80 + fontsize;
    let tablemargin = this.defaultTableMargin;
    let pageHeight = doc.internal.pageSize.height; // 841.89
    let pageWidth = doc.internal.pageSize.width;   // 595.31
    let aaa: any = null;
    
    // 格点(node) の印刷
    if('node' in inputJson){
      aaa = this.printNode(inputJson, doc, height);
    }

    height = aaa.table.finalY;


    if('member' in inputJson){
      aaa = this.printMember(inputJson, doc, height, fontsize, pageHeight, tablemargin);
    }

    height = aaa.table.finalY;
    pageHeight = doc.internal.pageSize.height;

    if('element' in inputJson){
      aaa = this.printElement(inputJson, doc, height, fontsize, pageHeight, tablemargin);
    }

    height = aaa.table.finalY;
    pageHeight = doc.internal.pageSize.height;

    if('fix_node' in inputJson){
      aaa = this.printFixnode(inputJson, doc, height, fontsize, pageHeight, tablemargin);
    }

    height = aaa.table.finalY;
    pageHeight = doc.internal.pageSize.height;

    if('notice_points' in inputJson){
      aaa = this.printNoticepoints(inputJson, doc, height, fontsize, pageHeight, tablemargin);
    }

    height = aaa.table.finalY;
    pageHeight = doc.internal.pageSize.height;


    return doc;
  }

  // 格子点データ node を印刷する
  private printNode(inputJson, doc, height): any {
    
    let aaa: any;

    const json: {} = inputJson['node']; // inputJsonからnodeだけを取り出す

      const body: any = [];

      for (const index of Object.keys(json)) {
        const item = json[index]; // 1行分のnodeデータを取り出す

        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(index);
        line.push(item.x.toFixed(3));
        line.push(item.y.toFixed(3));
        line.push(item.z.toFixed(3));
        body.push(line);
      }
      doc.text(80, height, "NODE DATA")
      doc.autoTable({
        margin: {
          left: 80,
          right: 80,
        },
        theme: ['plain'],
        styles:{font:'test'},
        startY: 10 + height,
        head: [['No.', 'X(m)', 'Y(m)','Z(m)']],
        body: body,
        didParseCell: function (CellHookData) {
          aaa = CellHookData;
        }
      })
      return aaa;
  }

  private printMember(inputJson, doc, height, fontsize, pageHeight, tablemargin): any {

    let aaa: any;

    const json: {} = inputJson['member']; // inputJsonからnodeだけを取り出す

        // あらかじめテーブルの高さを計算する
        const dataCount:number = Object.keys(json).length;
        const TableHeight: number = (dataCount + 1) * (fontsize * 2.15);

        // はみ出るなら改ページ
        if(height + TableHeight > (pageHeight-160)){ // はみ出るなら改ページ
          if(pageHeight - height < (pageHeight-160)/2){ // かつ余白が頁の半分以下ならば
          doc.addPage();
          height = 80 + fontsize;
          tablemargin = 0;
          }
        }

        const body: any = [];
        for (const index of Object.keys(json)) {
          const item = json[index]; // 1行分のnodeデータを取り出す
          // 印刷する1行分のリストを作る
          const line: string[] = new Array();
          line.push(index);
          line.push(item.ni.toString());
          line.push(item.nj.toString());
          line.push('5.000'); // 部材長さ 後ほど
          line.push(item.e.toString());
          line.push(item.cg.toString());
          body.push(line);
        }
        doc.text(80, height + tablemargin, "MEMBER DATA")
        doc.autoTable({
          theme: ['plain'],
          margin: {
            left: 80,
            right: 80,
          },
          styles:{font:'test'},
          startY: 10 + height + tablemargin,
          head: [['No.', 'I-TAN', 'J-TAN', 'L(m)', '材料番号', 'コードアングル']],
          body: body,
          didParseCell: function (CellHookData) {
            aaa = CellHookData
          }
        })
        tablemargin = this.defaultTableMargin;
        
        return aaa;
  }

  private printElement(inputJson, doc, height, fontsize, pageHeight, tablemargin): any {
    
    let aaa: any;

    const json: {} = inputJson['element']; // inputJsonからnodeだけを取り出す

    // あらかじめテーブルの高さを計算する
    const dataCount:number = Object.keys(json).length;
    const TableHeight: number = (dataCount + 2) * (fontsize * 2.15);

    // はみ出るなら改ページ
    if(height + TableHeight > (pageHeight-160)){ // はみ出るなら改ページ
      if(pageHeight - height < (pageHeight-160)/2){ // かつ余白が頁の半分以下ならば
      doc.addPage();
      height = 80 + fontsize;
      tablemargin = 0;
      }
    }

    const body: any = [];
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      const item = elist['1'];

      // 印刷する1行分のリストを作る
      const line: string[] = new Array();
      line.push(index);
      line.push(item.A.toFixed(4));
      line.push(item.E.toExponential(2));
      line.push(item.G.toExponential(2));
      line.push(item.Xp.toExponential(2));
      line.push(item.Iy.toFixed(5));
      line.push(item.Iz.toFixed(5));
      line.push(item.J.toFixed(4));
      body.push(line);
    }
    doc.text(80, height + tablemargin, "ELEMENT DATA")
    doc.autoTable({
      theme: ['plain'],
      margin: {
        left: 80,
        right: 80,
      },
      styles:{font:'test'},
      startY: 10 + height + tablemargin,
      head: [['No.', 'A', 'E', 'G', 'ESP', {content: '断面二次モーメント', colSpan: 2}, 'ねじり剛性'],['', '(m2)', '(kN/m2)', '(kN/m2)', '', 'y軸周り', 'z軸周り', '']],
      body: body,
      didParseCell: function (CellHookData) {
        aaa = CellHookData
      }
    })
    tablemargin = this.defaultTableMargin;
    return aaa;
  }

  private printFixnode(inputJson, doc, height, fontsize, pageHeight, tablemargin): any {

    let aaa: any;

    const json: {} = inputJson['fix_node'];

    // あらかじめテーブルの高さを計算する
    const dataCount:number = Object.keys(json).length;
    const TableHeight: number = (dataCount + 1) * (fontsize * 2.15);

    // はみ出るなら改ページ
    if(height + TableHeight > (pageHeight-160)){ // はみ出るなら改ページ
      if(pageHeight - height < (pageHeight-160)/2){ // かつ余白が頁の半分以下ならば
      doc.addPage();
      height = 80 + fontsize;
      tablemargin = 0;
      }
    }
    const body: any = [];
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      const item = elist['0'];

      // 印刷する1行分のリストを作る
      const line: string[] = new Array();
      line.push(item.n);
      line.push(item.tx.toFixed(0));
      line.push(item.ty.toFixed(0));
      line.push(item.tz.toFixed(0));
      line.push(item.rx.toFixed(0));
      line.push(item.ry.toFixed(0));
      line.push(item.rz.toFixed(0));
      body.push(line);
    }
    doc.text(80, height + tablemargin, "支点データ")
    doc.autoTable({
      theme: ['plain'],
      margin: {
        left: 80,
        right: 80,
      },
      styles:{font:'test'},
      startY: 10 + height + tablemargin,
      head: [['格点No.', 'TX', 'TY', 'TZ', 'RX', 'RY', 'RZ']],
      body: body,
      didParseCell: function (CellHookData) {
        aaa = CellHookData
      }
    })
    tablemargin = this.defaultTableMargin;
    return aaa;
  }

  private printNoticepoints(inputJson, doc, height, fontsize, pageHeight, tablemargin): any {
    
    let aaa: any;
    
    const json: {} = inputJson['notice_points'];

    // あらかじめテーブルの高さを計算する
    const dataCount:number = Object.keys(json).length;
    const TableHeight: number = (dataCount + 1) * (fontsize * 2.15);

    // はみ出るなら改ページ
    if(height + TableHeight > (pageHeight-160)){ // はみ出るなら改ページ
      if(pageHeight - height < (pageHeight-160)/2){ // かつ余白が頁の半分以下ならば
      doc.addPage();
      height = 80 + fontsize;
      tablemargin = 0;
      }
    }

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す
      //const item = elist['1'];
      console.log(item);

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      line.push(item.m); // 部材No
      line.push("5.00"); // 部材長
    
      let counter: number = 0;
      for (const key of Object.keys(item.Points)){
        line.push(item.Points[key].toFixed(3));
        counter += 1;
        if(counter === 9){
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(''); // 部材No
          line.push(''); // 部材長
        }
      }
      if(counter > 0){
        body.push(line); // 表の1行 登録
      }
    }
    doc.text(80, height + tablemargin, "着目点")
    doc.autoTable({
      theme: ['plain'],
      margin: {
        left: 80,
        right: 80,
      },
      styles:{font:'test'},
      startY: 10 + height + tablemargin,
      head: [['部材No.', '部材長', 'L1','L2','L3','L4','L5','L6','L7','L8','L9']],
      body: body,
      didParseCell: function (CellHookData) {
        aaa = CellHookData
      }
    })
    tablemargin = this.defaultTableMargin;
    return aaa;
  }

  private getFont(): string {
  }

 }