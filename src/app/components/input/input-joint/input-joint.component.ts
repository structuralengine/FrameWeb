import { Component, OnInit } from '@angular/core';
import { InputJointService } from './input-joint.service';
import { ThreeService } from '../../three/three.service';

@Component({
  selector: 'app-input-joint',
  templateUrl: './input-joint.component.html',
  styleUrls: ['./input-joint.component.scss']
})
export class InputJointComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;


  hotTableSettings = {
    beforeChange: (...x: any[]) => {
    },
    afterChange: (...x: any[]) => {
      this.three.chengeData('joints');
    }
  };


  constructor(private input: InputJointService,
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

    for (let i = 1; i <= InputJointComponent.ROWS_COUNT; i++) {
      const joint = this.input.getJointColumns(this.page, i);
      this.dataset.push(joint);
    }
    this.three.ChengeMode('joints', currentPage);
  }
}
