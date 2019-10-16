import { Component, OnInit } from '@angular/core';
import { InputFixMemberService } from './input-fix-member.service';

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss']
})
export class InputFixMemberComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  hotTableSettings = {};

  constructor(private data: InputFixMemberService) {

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
  }
}
