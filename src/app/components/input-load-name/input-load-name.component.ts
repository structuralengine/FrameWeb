import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

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

  constructor(private input: InputDataService,
    private unity: UnityConnectorService) {
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

    for (var i = a1; i <= a2; i++) {
      const load_name = this.input.getLoadNameColumns(i);
      this.dataset.push(load_name);
      this.rowHeaders.push(i);
    }
  }

  hotTableSettings = {

    beforeChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('load_name');
      }
    }
  }
}
