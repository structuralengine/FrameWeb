import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputElementsService } from './input-elements.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import{ UserInfoService } from '../../../providers/user-info.service'
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-elements',
  templateUrl: './input-elements.component.html',
  styleUrls: ['./input-elements.component.scss','../../../app.component.scss']
})

export class InputElementsComponent implements OnInit, AfterViewInit {

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
              case "Iz":
                  changes[i][3] = value.toFixed(6);
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
      if (this.initialFlg===true){
        return;
      }
      this.three.chengeData('elements', this.page );
    }
  };

  private initialFlg = true;
  constructor(
    private data: InputElementsService,
    private helper: DataHelperModule,
    private three: ThreeService,
    public user:UserInfoService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {
    this.initialFlg = true;
    this.loadPage(1);
  }
  ngAfterViewInit() {
    this.initialFlg = false;
  }
  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
    console.log('aa')
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
