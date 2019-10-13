import { Component, OnInit } from '@angular/core';
import { InputElementsService } from './input-elements.service';

@Component({
  selector: 'app-input-elements',
  templateUrl: './input-elements.component.html',
  styleUrls: ['./input-elements.component.scss']
})

export class InputElementsComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        // this.unity.chengeModeData('unity-elements:' + this.page.toString());
      }
    }
  };

  constructor(private data: InputElementsService) {
    
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

    for (let i = 1; i <= InputElementsComponent.ROWS_COUNT; i++) {
      const element = this.data.getElementColumns(this.page, i);
      this.dataset.push(element);
    }
  }
}
