import { Component, OnInit } from '@angular/core';
import { InputFixMemberService } from './input-fix-member.service';
import { UnityConnectorService } from '../../../unity/unity-connector.service';

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
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-fix_members:' + this.page.toString());
      }
    }
  };

  constructor(private data: InputFixMemberService,
              private unity: UnityConnectorService) {

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
    this.unity.ChengeMode('fix_members:' + currentPage.toString());
  }
}
