import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ThreeService } from './three.service';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  constructor(private three: ThreeService) { }

  ngOnInit() {
    this.three.createScene(this.rendererCanvas);
    this.three.animate();
  }

}
