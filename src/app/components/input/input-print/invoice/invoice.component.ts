import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PrintService} from '../print.service';

import { InputDataService } from '../../../../providers/input-data.service'

import { InputCombineService } from '../../input-combine/input-combine.service';
import { InputDefineService } from '../../input-define/input-define.service';
import { InputNodesService } from '../../input-nodes/input-nodes.service';
import { InputElementsService } from '../../input-elements/input-elements.service';
import { InputFixMemberService } from '../../input-fix-member/input-fix-member.service';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
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
              private InputData:InputDataService,
              private comb: InputCombineService,
              private nodes: InputNodesService,
              private define: InputDefineService,
              private elements: InputElementsService,
              ) {
    this.invoiceIds = route.snapshot.params['invoiceIds']
      .split(',');
      this.dataset = new Array();
  }

  ngOnInit() {
    
    this.invoiceDetails = this.invoiceIds
      .map(id => this.getInvoiceDetails(id));
    Promise.all(this.invoiceDetails)
      .then(() => this.printService.onDataReady());
  }

  getInvoiceDetails(invoiceId) {
   
    const amount = Math.floor((Math.random() * 100));
    return new Promise(resolve =>
      setTimeout(() => resolve({amount}), 1000)
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
    
    
  }

}
