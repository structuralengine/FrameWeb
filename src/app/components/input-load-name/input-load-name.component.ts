import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-load-name',
  templateUrl: './input-load-name.component.html',
  styleUrls: ['./input-load-name.component.scss']
})
export class InputLoadNameComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const load_name = this.input.getLoadNameColumns(i);
      this.dataset.push(load_name)
    }

  }

}
