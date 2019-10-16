import { ThreeService } from './three.service';
import {
  Component, Input, ElementRef, OnInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'


@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  constructor(private three: ThreeService) { }

  ngOnInit() {
    this.three.createScene(this.canvas);
    this.three.animate();
  }

}
