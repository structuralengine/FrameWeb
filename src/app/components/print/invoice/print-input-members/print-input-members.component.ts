import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { PrintService } from "../../print.service";

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
  countCell: number  = 0;
  countHead: number  = 0;
  countTotal: number = 0;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public member_dataset = [];
  public member_page: number;

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private printService: PrintService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.member_dataset = new Array();
    this.member_page = 0;
  }

  ngOnInit(): void {
    const inputJson: any = this.printService.inputJson;

    if ("member" in inputJson) {
      const tables = this.printMember(inputJson);
      this.member_dataset = tables.splid;
      this.member_page = tables.page;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(1);
    }
  }

  ngAfterViewInit() { }

  //要素データ member を印刷する
  private printMember(inputJson): any {
    let body: any[] = new Array();
    const splid: any[] = new Array();
    let page: number = 0;
    const json: {} = inputJson["member"]; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);

    let break_flg = true;

    while (break_flg) {
      for (let i = 0; i < 50; i++) {
        const j = page * 50 + i;

        const line = ["", "", "", "", "", ""];
        let index: string = keys[j];
        const item = json[index]; // 1行分のnodeデータを取り出す
        const len: number = this.InputData.member.getMemberLength(index); // 部材長さ
        const s = j + 1;

        if (s > keys.length) {
          break_flg = false;
          this.countHead = (page + 1) * 3;
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

    //最後のページの行数だけ取得している
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length + 2;

    //全部の行数を取得している。
    this.countTotal = keys.length + this.countHead + 3;

    return { page, splid, this: this.countTotal, last: lastArrayCount };
  }
}
