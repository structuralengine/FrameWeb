import { Component, OnInit } from '@angular/core';
import { InputFixMemberService } from './input-fix-member.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss']
})

export class InputFixMemberComponent implements OnInit {

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
      this.three.chengeData('fix_member', this.page );
    }
  };

  constructor(private data: InputFixMemberService,
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

    for (let i = 1; i <= InputFixMemberComponent.ROWS_COUNT; i++) {
      const fix_member = this.data.getFixMemberColumns(this.page, i);
      this.dataset.push(fix_member);
    }
    this.three.ChengeMode('fix_member', currentPage);
  }
}
