import { Component, OnInit } from '@angular/core';
import { InputNodesService } from './input-nodes.service';
import { UnityConnectorService } from '../../../unity/unity-connector.service';
import { DataHelperService } from '../../../providers/data-helper.service';

@Component({
  selector: 'app-input-nodes',
  templateUrl: './input-nodes.component.html',
  styleUrls: ['./input-nodes.component.scss']
})

export class InputNodesComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset1: any[];
  dataset2: any[];
  dataset3: any[];
  page: number;

  hotTableSettings1 = {
    beforeChange: (source, changes) => {
      try {
        for (let i = 0; i < changes.length; i++) {
          const value: number = this.helper.toNumber(changes[i][3]);
          changes[i][3] = value.toFixed(3);
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-nodes');
      }
    }
  };

  hotTableSettings2 = {
    beforeChange: (source, changes) => {
      try {
        for (let i = 0; i < changes.length; i++) {
          const value: number = this.helper.toNumber(changes[i][3]);
          changes[i][3] = value.toFixed(3);
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-nodes');
      }
    }
  };

  hotTableSettings3 = {
    beforeChange: (source, changes) => {
      try {
        for (let i = 0; i < changes.length; i++) {
          const value: number = this.helper.toNumber(changes[i][3]);
          changes[i][3] = value.toFixed(3);
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-nodes');
      }
    }
  };

  constructor(private data: InputNodesService,
              private unity: UnityConnectorService,
              private helper: DataHelperService) {
    this.page = 1;
  }

  ngOnInit() {
    this.loadPage(1);
    this.unity.ChengeMode('nodes');
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset1 = new Array()
    this.dataset2 = new Array()
    this.dataset3 = new Array()

    const a1: number = (currentPage - 1) * (InputNodesComponent.ROWS_COUNT * 3) + 1;
    const a2: number = a1 + InputNodesComponent.ROWS_COUNT - 1;
    const b1: number = a2 + 1;
    const b2: number = b1 + InputNodesComponent.ROWS_COUNT - 1;
    const c1: number = b2 + 1;
    const c2: number = c1 + InputNodesComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const node = this.data.getNodeColumns(i);
      this.dataset1.push(node);
    }
    for (let i = b1; i <= b2; i++) {
      const node = this.data.getNodeColumns(i);
      this.dataset2.push(node);
    }
    for (let i = c1; i <= c2; i++) {
      const node = this.data.getNodeColumns(i);
      this.dataset3.push(node);
    }
  }

}
