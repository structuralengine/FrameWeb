import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss']
})
export class InputFixMemberComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  constructor(private input: InputDataService,
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

    for (var i = 1; i <= InputFixMemberComponent.ROWS_COUNT; i++) {
      const fix_member = this.input.getFixMemberColumns(this.page, i);
      this.dataset.push(fix_member)

    }

  }

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('fix_member');
      }
    }
  }

}
