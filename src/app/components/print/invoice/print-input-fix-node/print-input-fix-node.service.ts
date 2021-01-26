import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class PrintInputFixNodeService {
  currentY : number;

  constructor(){
    this.currentY = 0;
  }

  setCurrentY(tableHeight:number):boolean{
    this.currentY += tableHeight;
    if(this.currentY > 1140){
      this.currentY = 0;
      return true;
    }else{
      return false;
    }
  }

}
