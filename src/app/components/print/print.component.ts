import { Component, OnInit } from '@angular/core';
import { DataCountService } from './invoice/dataCount.service';
import { PrintService } from './print.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss','../../app.component.scss']
})
export class PrintComponent implements OnInit {
  currentY : number = 0;

  constructor(public printService: PrintService,public countArea: DataCountService) {
   }

  ngOnInit(): void {
  }

  public onPrintInvoice() {
    const invoiceIds = ['101'];
    this.countArea.clear();
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
