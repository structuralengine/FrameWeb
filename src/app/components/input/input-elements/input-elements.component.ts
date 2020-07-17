import { Component, OnInit } from '@angular/core';
import { InputElementsService } from './input-elements.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';

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
    beforeChange: (...x: any[]) => {
      try {
        let changes: any = undefined;
        for (let i = 0; i < x.length; i++) {
          if (Array.isArray(x[i])) {
            changes = x[i];
            break;
          }
        }
        if (changes === undefined) { return; }
        for (let i = 0; i < changes.length; i++) {
          const value: number = this.helper.toNumber(changes[i][3]);
          if( value !== null ) {
            switch(changes[i][1]){
              case "Xp":
                changes[i][3] = value.toExponential(2);
                break;
              case "A":
                changes[i][3] = value.toFixed(4);
                break;
              case "Iy":
                changes[i][3] = value.toFixed(5);
                break;
              case "Iz":
                changes[i][3] = value.toFixed(5);
                break;
              case "E":
                changes[i][3] = value.toExponential(2);
                break;
              case "G":
                changes[i][3] = value.toExponential(2);
                break;
              case "J":
                changes[i][3] = value.toFixed(4);
                break;
            }
          } else {
            changes[i][3] = null;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (...x: any[]) => {
      this.three.chengeData('elements', this.page );
    }
  };

  constructor(
    private data: InputElementsService,
    private helper: DataHelperModule,
    private three: ThreeService) {
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

    this.three.ChengeMode('elements', currentPage);
  }
}