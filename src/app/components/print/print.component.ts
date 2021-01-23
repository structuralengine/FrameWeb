import { Component, OnInit } from '@angular/core';
import { PrintService } from './print.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss','../../app.component.scss']
})
export class PrintComponent implements OnInit {

  constructor(public printService: PrintService) {
   }

  ngOnInit(): void {
  }

  public onPrintInvoice() {
    const invoiceIds = ['101'];
    this.printService
      .printDocument('invoice', invoiceIds);
  }

  toggleEditable(event,id) {
    if (event.target.checked) {
      this.printService.contentEditable1[id] = true;
    }else{
      this.printService.contentEditable1[id] = false;
    }

  console.log(this.printService.contentEditable1);
 }

}
