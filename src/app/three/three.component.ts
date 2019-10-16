import { ThreeService } from './three.service';
import {
  Component, Input, ElementRef, OnInit, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'


@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  constructor(private three: ThreeService) { }

  private cx: CanvasRenderingContext2D;
  
  ngOnInit() {
    this.three.createScene(this.canvas);
    this.three.animate();
  }
  
  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // canvasEl.width = this.width;
    // canvasEl.height = this.height;

    // this.cx.lineWidth = 3;
    // this.cx.lineCap = 'round';
    // this.cx.strokeStyle = '#000';

    // this.captureEvents(canvasEl);
  }

  show(e: any){
    // console.log(e);
  }

}
