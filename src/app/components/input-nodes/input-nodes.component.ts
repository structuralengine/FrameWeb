import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';


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

  constructor(private input: InputDataService,
    private unity: UnityConnectorService) {
    this.page = 1;
  }

  ngOnInit() {
    this.loadPage(1);
  }
  
  loadPage(currentPage: number) {
    if (currentPage != this.page) {
      this.page = currentPage;
    }
    this.dataset1 = new Array()
    this.dataset2 = new Array()
    this.dataset3 = new Array()

    const a1: number = (currentPage - 1) * (InputNodesComponent.ROWS_COUNT*3) + 1;
    const a2: number = a1 + InputNodesComponent.ROWS_COUNT - 1;
    const b1: number = a2 + 1;
    const b2: number = b1 + InputNodesComponent.ROWS_COUNT - 1;
    const c1: number = b2 + 1;
    const c2: number = c1 + InputNodesComponent.ROWS_COUNT - 1;

    for (var i = a1; i <= a2; i++) {
      const node = this.input.getNodeColumns(i);
      this.dataset1.push(node)
    }
    for (var i = b1; i <= b2; i++) {
      const node = this.input.getNodeColumns(i);
      this.dataset2.push(node)
    }
    for (var i = c1; i <= c2; i++) {
      const node = this.input.getNodeColumns(i);
      this.dataset3.push(node)
    }
  }

  hotTableSettings1 = {
    beforeChange: (source, changes) => {
      try {
        for (var i = 0; i < changes.length; i++) {
          let value: number = this.toNumber(changes[i][3]);
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
  }

  hotTableSettings2 = {
    beforeChange: (source, changes) => {
      try {
        for (var i = 0; i < changes.length; i++) {
          let value: number = this.toNumber(changes[i][3]);
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
  }

  hotTableSettings3 = {
    beforeChange: (source, changes) => {
      try {
        for (var i = 0; i < changes.length; i++) {
          let value: number = this.toNumber(changes[i][3]);
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
  }
  
  // 文字列string を数値にする
  private toNumber(num: string): number {
    let result: number = null;
    try {
      let tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch{
      result = null;
    }
    return result;
  }

}