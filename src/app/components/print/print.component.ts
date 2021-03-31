import { Component, OnInit } from '@angular/core';
import { UserInfoService } from 'src/app/providers/user-info.service';
import { DataCountService } from './invoice/dataCount.service';
import { PrintService } from './print.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss','../../app.component.scss']
})
export class PrintComponent implements OnInit {
  currentY : number = 0;
  loggedIn:boolean;

  constructor(public printService: PrintService,public countArea: DataCountService,public user:UserInfoService) {
    this.loggedIn = this.user.loggedIn; 
  }

  ngOnInit(): void {
  }

  public onPrintInvoice() {
    if (this.loggedIn === true) {
    const invoiceIds = ['101'];
    this.countArea.clear();
    this.printService
      .printDocument('invoice', invoiceIds);
    }else{
      alert("ログインしてください");
    }
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
