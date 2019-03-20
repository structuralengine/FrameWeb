import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss']
})
export class InputPickupComponent implements OnInit {

  static ROWS_COUNT = 20;
  page: number;
  pickupData: any[];
  pickupColums: any[];
  rowHeaders: any[];

  constructor(private input: InputDataService) {

    this.page = 1;
    this.pickupData = new Array();
    this.pickupColums = new Array();
    this.rowHeaders = new Array();

    for (var i = 1; i <= InputDataService.PICKUP_CASE_COUNT; i++) {
      this.pickupColums.push("C" + i.toString());
    }

  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.pickupData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputPickupComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputPickupComponent.ROWS_COUNT - 1;

    for (var i = a1; i <= a2; i++) {
      const pickup = this.input.getPickUpDataColumns(i);
      this.pickupData.push(pickup);
      this.rowHeaders.push(i);
    }
  }

}
