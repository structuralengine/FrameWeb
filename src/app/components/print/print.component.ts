import { Component, OnInit } from '@angular/core';
import { PrintService } from './print.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss','../../app.component.scss']
})
export class PrintComponent implements OnInit {

  constructor(public printService: PrintService) { }

  ngOnInit(): void {
  }

  public onPrintInvoice() {
    const invoiceIds = ['101'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }

}
