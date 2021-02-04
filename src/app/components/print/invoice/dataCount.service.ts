import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DataCountService {
  currentY: number;
  currentType: number;

  constructor() {
    this.currentY = 0;
    this.currentType = 0;
  }

  //全部の行の行数を管理している
  setCurrentY(tableHeight: number, lastHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 59 /*行*/) {
      this.currentY = lastHeight;
      return true;
    } else {
      return false;
    }
  }
}
