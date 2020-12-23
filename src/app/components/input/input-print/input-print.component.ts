import { Component, OnInit } from '@angular/core';
import { PrintService } from './print.service';

@Component({
  selector: 'app-input-print',
  templateUrl: './input-print.component.html',
  styleUrls: ['./input-print.component.scss']
})
export class InputPrintComponent implements OnInit {

  constructor(public printService: PrintService) { }

  ngOnInit(): void {
  }

  public onPrintInvoice() {
    const invoiceIds = ['101', '102'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }

}
