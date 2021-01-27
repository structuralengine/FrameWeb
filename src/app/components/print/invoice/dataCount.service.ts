import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DataCountService {
  currentY: number;

  constructor() {
    this.currentY = 0;
  }

  setCurrentY(tableHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 1060) {
        this.currentY = 0;
        return true;
    } else {
      return false;
    }
  }
}