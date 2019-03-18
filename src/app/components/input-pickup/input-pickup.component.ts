import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss']
})
export class InputPickupComponent implements OnInit {

  pickupData: any[];
  pickupColums: any[];

  constructor(private input: InputDataService) {

    this.pickupData = new Array();
    this.pickupColums = new Array();
    for (var i = 1; i <= InputDataService.PICKUP_CASE_COUNT; i++) {
      this.pickupColums.push("C" + i.toString());
    }

  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const pickup = this.input.getPickUpDataColumns(i);
      this.pickupData.push(pickup);
    }

  }

}
