import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintService } from '../print.service';

import { InputDataService } from '../../../../providers/input-data.service'

import { InputCombineService } from '../../input-combine/input-combine.service';
import { InputDefineService } from '../../input-define/input-define.service';
import { InputNodesService } from '../../input-nodes/input-nodes.service';
import { InputElementsService } from '../../input-elements/input-elements.service';
import { InputFixMemberService } from '../../input-fix-member/input-fix-member.service';
import { AfterViewInit } from '@angular/core';
import { ThreeService } from 'src/app/components/three/three.service';
import { SceneService } from 'src/app/components/three/scene.service';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss','../../../../app.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  public dataset = [];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  constructor(route: ActivatedRoute,
    private printService: PrintService,
    private InputData: InputDataService,
    private comb: InputCombineService,
    private nodes: InputNodesService,
    private define: InputDefineService,
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
    console.log('inputJson とは何か？');
    console.log(inputJson);
    const json: {} = inputJson['node']; // inputJsonからnodeだけを取り出す
    console.log('json とは何か？');
    console.log(json);
    const keys: string[] = Object.keys(json);
    const minCount: number = 5; // これ以上なら２行書きとする
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
        this.dataset.push(line);
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
        this.dataset.push(line);
      }


    }

  }
}
