import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputFixNodeService } from './input-fix-node.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import{ UserInfoService } from '../../../providers/user-info.service'

@Component({
  selector: 'app-input-fix-node',
  templateUrl: './input-fix-node.component.html',
  styleUrls: ['./input-fix-node.component.scss','../../../app.component.scss']
})

export class InputFixNodeComponent implements OnInit, AfterViewInit {

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
                changes[i][3] = value.toString();
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
          this.three.chengeData('fix_nodes', this.page );
        }
      };
  private initialFlg = true;
  constructor(private data: InputFixNodeService,
              private helper: DataHelperModule,
              private three: ThreeService,
              private user: UserInfoService) {

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

    for (let i = 1; i <= InputFixNodeComponent.ROWS_COUNT; i++) {
      const fix_node = this.data.getFixNodeColumns(this.page, i);
      this.dataset.push(fix_node);
    }
    this.three.ChengeMode('fix_nodes', currentPage);
  }
}
