import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintInputLoadService {
  currentY_basic : number;
  currentY_actual : number;

  constructor(){
    this.currentY_basic = 0;
    this.currentY_actual = 0;
  }

  setCurrentY_basic(tableHeight:number):boolean{
    this.currentY_basic += tableHeight;
    if(this.currentY_basic > 1140){
      this.currentY_basic = 0;
      return true;
    }else{
      return false;
    }
  }
  
  setCurrentY_actual(tableHeight:number):boolean{
    this.currentY_actual += tableHeight;
    if(this.currentY_actual > 1140){
      this.currentY_actual = 0;
      return true;
    }else{
      return false;
    }
  }
}
