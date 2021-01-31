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

  setCurrentY(tableHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 1160/*px*/) {
        this.currentY = 0;
        return true;
    } else {
      return false;
    }
  }

  setCurrentLastY(tableHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 59/*行*/) {
        this.currentY = 0;
        return true;
    } else {
      return false;
    }
  }

  setCurrentElements(typeHeight:number):boolean{
    this.currentType += typeHeight;
    if(this.currentType > 1160){
      this.currentType = 0;
      return true;
    }else{
      return false;
    }
  }
}
