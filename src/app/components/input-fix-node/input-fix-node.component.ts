import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-fix-node',
  templateUrl: './input-fix-node.component.html',
  styleUrls: ['./input-fix-node.component.scss']
})
  
export class InputFixNodeComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const fix_node = this.input.getFixNodeColumns(this.page ,i);
      this.dataset.push(fix_node)
    }
  }


}
