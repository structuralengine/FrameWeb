import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-print-input-nodes',
  templateUrl: './print-input-nodes.component.html',
  styleUrls: ['./print-input-nodes.component.scss', '../../../../app.component.scss','../invoice.component.scss']
})
export class PrintInputNodesComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public node_dataset = [];


  constructor(
    private InputData: InputDataService
  ) {}

  ngOnInit(): void {
  }


  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

    if ('node' in inputJson) {
      this.node_dataset = this.printNode(inputJson);
    }
  }

  // 格子点データ node を印刷する
  private printNode(inputJson): any {
    const minCount: number = 5; // これ以上なら２行書きとする
    const body: any = [];
    const json: {} = inputJson['node']; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);

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

}
