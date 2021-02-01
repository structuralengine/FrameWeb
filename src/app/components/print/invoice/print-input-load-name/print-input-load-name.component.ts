import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-load-name",
  templateUrl: "./print-input-load-name.component.html",
  styleUrls: [
    "./print-input-load-name.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputLoadNameComponent implements OnInit {
  page: number;
  load_name: string;
  collectionSize: number;
  countCell: number;
  countHead: number;
  countTotal: number = 4;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public loadName_dataset = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);
    const LoadJson: any = this.InputData.load.getLoadJson();
    if (Object.keys(LoadJson).length > 0) {
      // 基本荷重データ
      const tables_basic = this.printLoadName(LoadJson);
      this.loadName_dataset = tables_basic.body;
      this.judge = this.countArea.setCurrentY(tables_basic.basic,
        tables_basic.last
        );
    }
  }

  ngAfterViewInit() {}

  // 基本荷重データ load name を印刷する
  private printLoadName(json): any {
    const body: any = [];
    const splid: any = [];

    const dataCount: number = Object.keys(json).length;
    for (const index of Object.keys(json)) {
      const item = json[index]; // 1行分のnodeデータを取り出す
      /*let rate: number
      if(item.rate !== null){
        rate = item.rate;
      } else {
        rate = 1;
      } */
      const rate: number = item.rate !== null ? item.rate : 1;
      const fix_node: number = item.fix_node !== null ? item.fix_node : 1;
      const fix_member: number = item.fix_member !== null ? item.fix_member : 1;
      const element: number = item.element !== null ? item.element : 1;
      const joint: number = item.joint !== null ? item.joint : 1;

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
    this.countTotal = dataCount * 2 ;

     //最後のページの行数だけ取得している
     const lastArray = splid.slice(-1)[0];
     const lastArrayCount = lastArray.length;
 
    return { body, basic: this.countTotal, last:lastArrayCount};
  }
}
