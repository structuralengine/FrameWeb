import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-joint',
  templateUrl: './input-joint.component.html',
  styleUrls: ['./input-joint.component.scss']
})
export class InputJointComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const joint = this.input.getJointColumns(this.page, i);
      this.dataset.push(joint)
    }

  }

}