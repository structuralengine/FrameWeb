import { Component, OnInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-load-name',
  templateUrl: './input-load-name.component.html',
  styleUrls: ['./input-load-name.component.scss']
})
export class InputLoadNameComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;
  rowHeaders: any[];

  hotTableSettings = {
    afterSelection: (hotInstance, row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
    this.three.ChengeMode('loads', row + 1);
    }
  };


  constructor(private data: InputLoadService,
              private three: ThreeService) {
    this.page = 1;
  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputLoadNameComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputLoadNameComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const load_name = this.data.getLoadNameColumns(i);
      this.dataset.push(load_name);
      this.rowHeaders.push(i);
    }
  }

  
}
