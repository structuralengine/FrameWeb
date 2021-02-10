import { Injectable, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class DataCountService {
  currentY: number;
  currentType: number;
  dataExists:any = [];

  constructor(private router: Router) {
    this.currentY = 0;
    this.currentType = 0;
    this.dataExists = [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ];
  }


  //全部の行の行数を管理している
  setCurrentY(tableHeight: number, lastHeight: number): boolean {
    this.currentY += tableHeight;
    if (this.currentY > 54 /*行*/) {
      this.currentY = lastHeight;
      return true;
    } else {
      return false;
    }
  }

  public clear(): void {
    this.dataExists = [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ];
  }

  //データが空だった時にfalseを返す
  setData(id) {
    this.dataExists[id] = false;
  }
}
