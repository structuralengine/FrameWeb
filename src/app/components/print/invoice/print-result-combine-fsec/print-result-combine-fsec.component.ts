import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-print-result-combine-fsec',
  templateUrl: './print-result-combine-fsec.component.html',
  styleUrls: ['../../../../app.component.scss','../invoice.component.scss','../invoice.component.scss']
})

export class PrintResultCombineFsecComponent implements OnInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public combFesc_dataset = [];

 
  constructor( private InputData: InputDataService ) {
   }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

  
  }

}

