import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss']
})
export class InputFixMemberComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const fix_member = this.input.getFixMemberColumns(this.page, i);
      this.dataset.push(fix_member)
    }

  }

}
