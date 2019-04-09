import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

@Component({
  selector: 'app-input-joint',
  templateUrl: './input-joint.component.html',
  styleUrls: ['./input-joint.component.scss']
})
export class InputJointComponent implements OnInit {

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

    for (var i = 1; i <= InputJointComponent.ROWS_COUNT; i++) {
      const joint = this.input.getJointColumns(this.page, i);
      this.dataset.push(joint)
    }

  }

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('joint');
      }
    }
  }

}