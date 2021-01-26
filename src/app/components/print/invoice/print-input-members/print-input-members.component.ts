import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { PrintInputMembersService } from "./print-input-members.service";

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

  public member_dataset = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: PrintInputMembersService
  ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("member" in inputJson) {
      const tables = this.printMember(inputJson);
      this.member_dataset = tables.body;
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  //要素データ member を印刷する
  private printMember(inputJson): any {
    const body: any = [];
    const json: {} = inputJson["member"]; // inputJsonからnodeだけを取り出す
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
    this.countTotal = (keys.length + 1) * 20 + 40;
    return {body,this:this.countTotal};
  }
}
