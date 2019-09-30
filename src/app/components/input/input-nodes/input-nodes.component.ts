import { Component, OnInit } from '@angular/core';
import { InputNodesService } from './input-nodes.service';
import { UnityConnectorService } from '../../../unity/unity-connector.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Component({
  selector: 'app-input-nodes',
  templateUrl: './input-nodes.component.html',
  styleUrls: ['./input-nodes.component.scss']
})

export class InputNodesComponent implements OnInit {

  public ROWS_COUNT: number = 20;
  public dataset = [[], [], []];
  public page: number;

  hotTableSettings = {
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
        this.unity.chengeModeData('unity-nodes');
      }
    }
  };

  constructor(private data: InputNodesService,
              private unity: UnityConnectorService,
              private helper: DataHelperModule) {
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
    for (let i = 0; i < this.dataset.length; i++) {
      this.dataset[i] = new Array();
    }

    const a1: number = (currentPage - 1) * (this.ROWS_COUNT * 3) + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;
    const b1: number = a2 + 1;
    const b2: number = b1 + this.ROWS_COUNT - 1;
    const c1: number = b2 + 1;
    const c2: number = c1 + this.ROWS_COUNT - 1;

    const st: number[] = [a1, b1, c1];
    const ed: number[] = [a2, b2, c2];

    for (let i = 0; i < this.dataset.length; i++) {
      for (let j = st[i]; j <= ed[i]; j++) {
        const node = this.data.getNodeColumns(j);
        this.dataset[i].push(node);
      }
    }
  }

}
