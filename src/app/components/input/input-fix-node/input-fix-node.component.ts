import { Component, OnInit } from '@angular/core';
import { InputFixNodeService } from './input-fix-node.service';

@Component({
  selector: 'app-input-fix-node',
  templateUrl: './input-fix-node.component.html',
  styleUrls: ['./input-fix-node.component.scss']
})

export class InputFixNodeComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        // this.unity.chengeModeData('unity-fix_nodes:' + this.page.toString());
      }
    }
  };

  constructor(private data: InputFixNodeService) {

    this.dataset = new Array();
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

    for (let i = 1; i <= InputFixNodeComponent.ROWS_COUNT; i++) {
      const fix_node = this.data.getFixNodeColumns(this.page, i);
      this.dataset.push(fix_node);
    }
    // this.unity.ChengeMode('fix_nodes:' + currentPage.toString());
  }
}
