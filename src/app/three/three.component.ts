import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ThreeService } from './three.service';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  @HostListener('document:mousemove', ['$event'])
    
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  constructor(private three: ThreeService) { }

  ngOnInit() {
    this.three.createScene(this.rendererCanvas);
    this.three.animate();
  }

  onMouseMove(e) {
    //https://ics.media/tutorial-three/raycast/
    console.log(e);
  }

}
