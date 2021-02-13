import { Injectable, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class DataCountService implements OnInit, AfterViewInit {
  currentY: number = 0;
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

  ngOnInit(){
    this.currentY = 0;
  }

  ngAfterViewInit(){
    this.currentY = 0;
  }

  //全部の行の行数を管理している
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
    this.dataExists[id] = false;
  }
}
