import { Component, OnInit } from '@angular/core';
import { InputPickupService } from './input-pickup.service';
import { FrameDataService } from '../../providers/frame-data.service';
import { ReadDataService } from '../../providers/read-data.service';

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss']
})

export class InputPickupComponent implements OnInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  pickupData: any[];
  pickupColums: any[];
  pickupTitles: any[];
  rowHeaders: any[];

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.reault.isCombinePickupChenge = true;
      }
    }
  };

  constructor(private input: InputPickupService,
              private frame: FrameDataService,
              private reault: ReadDataService) {

    this.page = 1;
    this.pickupData = new Array();
    this.pickupColums = new Array();
    this.pickupTitles = new Array();
    this.rowHeaders = new Array();
  }

  ngOnInit() {
    this.COLUMNS_COUNT = this.frame.getCombineCaseCount();
    if (this.COLUMNS_COUNT <= 0) {
      this.COLUMNS_COUNT = this.frame.getLoadCaseCount();
    }
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.pickupColums.push('C' + i.toString());
      this.pickupTitles.push('C' + i.toString());
    }
    this.pickupColums.push('name');
    this.pickupTitles.push('名称　　　　　　　　　　　　　　');
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.pickupData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * this.ROWS_COUNT + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const pickup = this.input.getPickUpDataColumns(i, this.COLUMNS_COUNT + 1);
      this.pickupData.push(pickup);
      this.rowHeaders.push(i);
    }
  }
}
