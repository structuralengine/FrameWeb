import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-members',
  templateUrl: './input-members.component.html',
  styleUrls: ['./input-members.component.scss']
})
  
export class InputMembersComponent implements OnInit {
  
  dataset: any[];
  page: number;
  
  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const member = this.input.getMemberColumns(i);
      this.dataset.push(member)
    }

  }

}