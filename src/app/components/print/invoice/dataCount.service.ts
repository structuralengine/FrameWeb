import { Injectable, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class DataCountService implements OnInit {
  currentY: number = 0;
  currentType: number;

  constructor(private router: Router) {
    this.currentY = 0;
    this.currentType = 0;
  }

  ngOnInit(){
    this.clear();
  }

  //全部の行の行数を管理している
  public clear(): void {
    this.currentY = 0;
  }

  setCurrentY(tableHeight: number, lastHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 54 /*行*/) {
      this.currentY = lastHeight;
      return true;
    } else {
      return false;
    }
  }


  //データが空だった時にfalseを返す
  setData(id) {
    // this.dataExists[id] = false;
  }
}
