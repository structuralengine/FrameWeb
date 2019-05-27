import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';
import { FrameDataService } from '../../providers/frame-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

@Component({
  selector: 'app-input-members',
  templateUrl: './input-members.component.html',
  styleUrls: ['./input-members.component.scss']
})

export class InputMembersComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;

  hotTableSettings = {
    afterChange: (hotInstance, changes, source) => {
      if (changes != null) {
        this.unity.chengeData('unity-members');
        try {
          for (let i = 0; i < changes.length; i++) {
            const target = changes[i];
            const row: number = target[0];
            const column: string = target[1];
            const old_value: any = target[2];
            const new_value: any = target[3];
            if (column !== 'ni' && column !== 'nj') {
              continue;
            }
            if (old_value === new_value) {
              continue;
            }
            const member: {} = this.dataset[row];
            const m: string = member['id'];
            if (m === '') {
              continue;
            }
            const l: number = this.frame.getMemberLength(m);
            if (l != null) {
              this.dataset[row]['L'] = l.toFixed(3);
              hotInstance.render();
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  constructor(private input: InputDataService,
    private frame: FrameDataService,
    private unity: UnityConnectorService) {
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

    const a1: number = (currentPage - 1) * InputMembersComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputMembersComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const member = this.input.getMemberColumns(i);
      const m: string = member['id'];
      if (m !== '') {
        const l: any = this.frame.getMemberLength(m);
        member['L'] = (l != null) ? l.toFixed(3) : l;
      }
      this.dataset.push(member);
    }
  }
}
