import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { InputDataService } from '../../providers/input-data.service';
import { ReadDataService } from '../../providers/read-data.service';

@Component({
  selector: 'app-input-combine',
  templateUrl: './input-combine.component.html',
  styleUrls: ['./input-combine.component.scss']
})
  
export class InputCombineComponent implements OnInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  combineData: any[];
  combineColums: any[];
  combineTitles: any[];
  rowHeaders: any[];

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.reault.isCombinePickupChenge = true;
      }
    }
  };

  constructor(private input: InputDataService,
    private frame: FrameDataService,
    private reault: ReadDataService) {

    this.page = 1;
    this.combineData = new Array();
    this.combineColums = new Array();
    this.combineTitles = new Array();
    this.rowHeaders = new Array();

  }

  ngOnInit() {
    let head = 'D';
    this.COLUMNS_COUNT = this.frame.getDefineCaseCount();
    if (this.COLUMNS_COUNT <= 0) {
      this.COLUMNS_COUNT = this.frame.getLoadCaseCount();
      head = 'C';
    }
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.combineColums.push('C' + i.toString());
      this.combineTitles.push(head + i.toString());
    }
    this.combineColums.push('name');
    this.combineTitles.push('名称　　　　　　　　　　　　　　');
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.combineData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * this.ROWS_COUNT + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const combine = this.input.getCombineDataColumns(i, this.COLUMNS_COUNT + 1);
      this.combineData.push(combine);
      this.rowHeaders.push(i);
    }
  }
}