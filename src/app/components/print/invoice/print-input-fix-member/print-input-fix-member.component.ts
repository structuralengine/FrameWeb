import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { PrintInputFixMemberService } from "./print-input-fix-member.service";

@Component({
  selector: "app-print-input-fix-member",
  templateUrl: "./print-input-fix-member.component.html",
  styleUrls: [
    "./print-input-fix-member.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputFixMemberComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  countCell: number;
  countHead: number;
  countTotal: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public fixMember_dataset = [];
  public fixMember_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: PrintInputFixMemberService
  ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("fix_member" in inputJson) {
      const tables = this.printFixmember(inputJson); // {body, title}
      this.fixMember_dataset = tables.body;
      this.fixMember_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this.countTotal);
    }
  }

  ngAfterViewInit() {}

  // バネデータ fix_member を印刷する
  private printFixmember(inputJson): any {
    const body: any = [];
    const json: {} = inputJson["fix_member"];
    const keys: string[] = Object.keys(json);

    const title: string[] = new Array();
    for (const index of keys) {
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
      this.countCell = (elist.length + 1) * 20;
      body.push(table);
    }
    this.countHead = keys.length * 2 * 20;
    this.countTotal = this.countCell + this.countHead + 40;
    return { body, title, this: this.countTotal };
  }
}
