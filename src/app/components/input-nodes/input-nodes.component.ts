import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';


@Component({
  selector: 'app-input-nodes',
  templateUrl: './input-nodes.component.html',
  styleUrls: ['./input-nodes.component.scss']
})
  
export class InputNodesComponent implements OnInit {

  dataset1: any[];
  dataset2: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset1 = new Array()
    this.dataset2 = new Array()
    this.page = 1;
  }

  ngOnInit() {


    for (var i = 1; i <= 20; i++) {
      const node = this.input.getNodeColumns(i);
      this.dataset1.push(node)
    }
    for (var i = 21; i <= 40; i++) {
      const node = this.input.getNodeColumns(i);
      this.dataset2.push(node)
    }
  }
  
  // hotTableSettings = {
  //   afterChange: (hotInstance, changes, source) => {
  //     this.input.chengeNode();
  //   }
  // }


}