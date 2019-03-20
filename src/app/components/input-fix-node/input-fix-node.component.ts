import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { FrameDataService } from '../../providers/frame-data.service';

@Component({
  selector: 'app-input-fix-node',
  templateUrl: './input-fix-node.component.html',
  styleUrls: ['./input-fix-node.component.scss']
})
  
export class InputFixNodeComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  constructor(private input: InputDataService,
    private frame: FrameDataService) {
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

    for (var i = 1; i <= InputFixNodeComponent.ROWS_COUNT; i++) {
      const fix_node = this.input.getFixNodeColumns(i, this.page);
      this.dataset.push(fix_node)
    }

  }

  hotTableSettings = {
    beforeChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.frame.chengeData('fix_node');
      }
    }
  }

}
