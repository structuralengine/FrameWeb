import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-elements',
  templateUrl: './input-elements.component.html',
  styleUrls: ['./input-elements.component.scss']
})
  
export class InputElementsComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const element = this.input.getElementColumns(this.page, i);
      this.dataset.push(element)
    }

  }

}
