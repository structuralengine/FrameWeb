import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-print-result-reac',
  templateUrl: './print-result-reac.component.html',
  styleUrls: ['../../../../app.component.scss', '../invoice.component.scss', '../invoice.component.scss']
})
export class PrintResultReacComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public reac_dataset = [];
  public reac_typeNum = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.reac.getReacJson();
    const tables = this.printReact(resultjson);
    this.reac_dataset = tables.body;
    this.reac_typeNum = tables.titleSum;
  }

  private printReact(json): any {
    const titleSum: any = [];
    const body: any = new Array();

    for (const index of Object.keys(json)) {

      const elist = json[index]; // 1行分のnodeデータを取り出す


      // 荷重名称
      const title: any = [];
      let loadName: string = '';
      const l: any = this.InputData.load.getLoadNameJson(null, index);
      if (index in l) {
        loadName = l[index].name;
        title.push(['Case' + index, loadName]);
      }

      const table: any = [];

      // 印刷する1行分のリストを作る
      //let line: any[] = new Array();
      // line.push('Case ' + index);
      //line.push({ content: loadName, styles: { halign: "left" } });
      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(item.id.toString());
        line.push(item.tx);
        line.push(item.ty);
        line.push(item.tz);
        line.push(item.mx);
        line.push(item.my);
        line.push(item.mz);
        table.push(line);
      }
      titleSum.push(title);
      console.log("titlesum--------", titleSum)
      body.push(table);
    }
    return { titleSum, body };
  }

}




