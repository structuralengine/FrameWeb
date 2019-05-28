import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { FrameDataService } from '../../providers/frame-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

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
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-loads:' + this.page.toString());
      }
    }
  };

  constructor(private input: InputDataService,
    private frame: FrameDataService,
    private unity: UnityConnectorService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    let n: number = this.frame.getLoadCaseCount();
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
      const load_name = this.input.getLoadColumns(this.page, i);
      this.dataset.push(load_name)
    }
    const currentLoad:{} = this.input.getLoadNameColumns(currentPage);
    this.load_name = currentLoad['name'];

    this.unity.ChengeMode('loads:' + currentPage.toString());
  }
}
