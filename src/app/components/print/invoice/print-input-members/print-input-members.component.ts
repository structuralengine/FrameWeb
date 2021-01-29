import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-members",
  templateUrl: "./print-input-members.component.html",
  styleUrls: [
    "./print-input-members.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputMembersComponent implements OnInit, AfterViewInit {
  load_name: string;
  collectionSize: number;
  countCell: number;
  countHead: number;
  countTotal: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public member_dataset = [];
  public member_page = [];

  public judge: boolean;
  public judgeLast: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("member" in inputJson) {
      const tables = this.printMember(inputJson);
      this.member_dataset = tables.splid;
      this.member_page = tables.page;
      this.judge = this.countArea.setCurrentY(tables.this);
      this.judgeLast = this.countArea.setCurrentY(tables.lastArrayCount);
    }
  }

  ngAfterViewInit() {}

  //要素データ member を印刷する
  private printMember(inputJson): any {
    let body: any = [];
    const splid: any = [];
    let page: number = 0;
    const json: {} = inputJson["member"]; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);

    let break_flg = true;

    while (break_flg) {
      for (let i = 0; i < 59; i++) {
        const line = ["", "", "", "", "", ""];
        let index: string = keys[i];
        const item = json[index]; // 1行分のnodeデータを取り出す
        const len: number = this.InputData.member.getMemberLength(index); // 部材長さ
        const j = page * 59 + i + 1;
        const s = j + 1;

        if (s > keys.length) {
          break_flg = false;
          break;
        }

        line[0] = index;
        line[1] = item.ni.toString();
        line[2] = item.nj.toString();
        line[3] = len.toFixed(3);
        line[4] = item.e.toString();
        line[5] = item.cg.toString();

        body.push(line);
      }

      if (body.length === 0) {
        break;
      }
      splid.push(body);
      body = [];
      page++;
    }

    // for (const index of keys) {
    //   const item = json[index]; // 1行分のnodeデータを取り出す
    //   const len: number = this.InputData.member.getMemberLength(index); // 部材長さ
    //   // 印刷する1行分のリストを作る
    //   const line: string[] = new Array();
    //   line.push(index);
    //   line.push(item.ni.toString());
    //   line.push(item.nj.toString());
    //   line.push(len.toFixed(3));
    //   line.push(item.e.toString());
    //   line.push(item.cg.toString());
    //   body.push(line);
    // }
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length;
    this.countTotal = (keys.length + 1) * 20 + 40;
    return { page, splid, this: this.countTotal, lastArrayCount };
  }
}
