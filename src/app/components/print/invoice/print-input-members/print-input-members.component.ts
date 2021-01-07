import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-print-input-members',
  templateUrl: './print-input-members.component.html',
  styleUrls: ['./print-input-members.component.scss','../../../../app.component.scss','../invoice.component.scss']
})
export class PrintInputMembersComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public member_dataset = [];

  constructor(
    private InputData: InputDataService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

    if ('member' in inputJson) {
      this.member_dataset = this.printMember(inputJson);
    }
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
  

}
