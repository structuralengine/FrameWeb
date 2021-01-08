import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-print-result-combine-reac',
  templateUrl: './print-result-combine-reac.component.html',
  styleUrls: ['../../../../app.component.scss','../invoice.component.scss','../invoice.component.scss']
})
export class PrintResultCombineReacComponent implements OnInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public combReac_dataset = [];

  constructor(　private InputData: InputDataService　) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

  }

}



