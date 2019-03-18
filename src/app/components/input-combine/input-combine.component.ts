import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-combine',
  templateUrl: './input-combine.component.html',
  styleUrls: ['./input-combine.component.scss']
})
  
export class InputCombineComponent implements OnInit {

  combineData: any[];
  combineColums: any[];

  constructor(private input: InputDataService) {

    this.combineData = new Array();
    this.combineColums = new Array();
    for (var i = 1; i <= InputDataService.COMBINE_CASE_COUNT; i++) {
      this.combineColums.push("C" + i.toString());
    }

  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const combine = this.input.getCombineDataColumns(i);
      this.combineData.push(combine);
    }

  }

}