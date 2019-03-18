import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-load',
  templateUrl: './input-load.component.html',
  styleUrls: ['./input-load.component.scss']
})
export class InputLoadComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const load_name = this.input.getLoadColumns(i);
      this.dataset.push(load_name)
    }

  }

}