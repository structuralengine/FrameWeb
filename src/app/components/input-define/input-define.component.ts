import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-define',
  templateUrl: './input-define.component.html',
  styleUrls: ['./input-define.component.scss']
})
export class InputDefineComponent implements OnInit {

  defineData: any[];
  defineColums: any[];

  constructor(private input: InputDataService) {

    this.defineData = new Array();
    this.defineColums = new Array();
    for (var i = 1; i <= InputDataService.DEFINE_CASE_COUNT; i++) {
      this.defineColums.push("C" + i.toString());
    }

  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const define = this.input.getDefineDataColumns(i);
      this.defineData.push(define);
    }

  }

}
