import { Component, OnInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

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

  hotTableSettings_point = {
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
          if (value !== null) {
            switch (changes[i][1]) {
              case "n":
                changes[i][3] = value.toFixed(0);
                break;
              default:
                changes[i][3] = value.toFixed(2);
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
      this.three.chengeData('load_points', this.page);
    }
  };

  hotTableSettings_member = {
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
          if (changes[i][1] === "direction") {

          } else {
            const value: number = this.helper.toNumber(changes[i][3]);
            if (value !== null) {
              switch (changes[i][1]) {
                case "n":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "m1":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "m2":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "mark":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "L1":
                  changes[i][3] = value.toFixed(3);
                  break;
                case "L2":
                  changes[i][3] = value.toFixed(3);
                  break;
                default:
                  changes[i][3] = value.toFixed(2);
                  break;
              }
            } else {
              changes[i][3] = null;
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (...x: any[]) => {
      this.three.chengeData('load_members', this.page);
    }
  };

  constructor(private data: InputLoadService,
              private three: ThreeService,
              private helper: DataHelperModule) {
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

    this.three.ChengeMode('load_poinsts', currentPage);
  }

  public loadPointsActive():void {
    this.three.ChengeMode('load_poinsts');
  }

  public loadMembersActive():void {
    this.three.ChengeMode('load_members');
  }

}
