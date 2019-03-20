import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-load',
  templateUrl: './input-load.component.html',
  styleUrls: ['./input-load.component.scss']
})
export class InputLoadComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;
  load_name: string;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (var i = 1; i <= InputLoadComponent.ROWS_COUNT; i++) {
      const load_name = this.input.getLoadColumns(this.page, i);
      this.dataset.push(load_name)
    }
    const currentLoad:{} = this.input.getLoadNameColumns(currentPage);
    this.load_name = currentLoad['name'];
  }

}