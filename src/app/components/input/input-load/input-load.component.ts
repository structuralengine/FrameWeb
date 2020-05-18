import { Component, OnInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-load',
  templateUrl: './input-load.component.html',
  styleUrls: ['./input-load.component.scss']
})
export class InputLoadComponent implements OnInit {

  ROWS_COUNT = 20;
  collectionSize = 100;
  dataset: any[];
  page: number;
  load_name: string;

  hotTableSettings = {
    afterChange: (...x: any[]) => {
    this.three.chengeData('loads', this.page);
  }};

  constructor(private data: InputLoadService,
              private three: ThreeService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    let n: number = this.data.getLoadCaseCount();
    n += 5;
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (let i = 1; i <= this.ROWS_COUNT; i++) {
      const loadColumn = this.data.getLoadColumns(this.page, i);
      this.dataset.push(loadColumn);
    }
    const currentLoad: {} = this.data.getLoadNameColumns(currentPage);
    this.load_name = currentLoad['name'];

    this.three.ChengeMode('loads', currentPage);
  }


}
