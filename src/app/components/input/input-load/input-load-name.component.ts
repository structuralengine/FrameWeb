import { Component, OnInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

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
          switch(changes[i][1]){
            case "rate":
              if ( value !== null ) {
                changes[i][3] = value.toFixed(4);
                } else {
                changes[i][3] = null;
                }
              break;
            case "symbol":
            case "name":
              break;
              
            case "fix_node":
            case "fix_member":
            case "element":
            case "joint":
              if ( value !== null ) {
                changes[i][3] = value.toFixed(0);
                } else {
                changes[i][3] = null;
                }
              break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterSelection: (hotInstance, row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
    this.three.ChengeMode('loads', row + 1);
    }
  };


  constructor(private data: InputLoadService,
              private three: ThreeService,
              private helper: DataHelperModule) {
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
