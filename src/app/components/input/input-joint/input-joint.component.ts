import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputJointService } from './input-joint.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import{ UserInfoService } from '../../../providers/user-info.service'
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-joint',
  templateUrl: './input-joint.component.html',
  styleUrls: ['./input-joint.component.scss','../../../app.component.scss']
})
export class InputJointComponent implements OnInit, AfterViewInit {

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
            changes[i][3] = value.toFixed(0);
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
      this.three.chengeData('joints', this.page );
    }
  };

  private initialFlg = true;
  constructor(private input: InputJointService,
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

    for (let i = 1; i <= InputJointComponent.ROWS_COUNT; i++) {
      const joint = this.input.getJointColumns(this.page, i);
      this.dataset.push(joint);
    }
    this.three.ChengeMode('joints', currentPage);
  }
}
