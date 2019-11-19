import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';

import Stats from './libs/stats.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { DragControls } from './libs/DragControls.js';
import { TransformControls } from './libs/TransformControls.js';

import { SceneService } from './scene.service';
import { ThreeService } from './three.service';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit {

  @ViewChild('myCanvas', { static: true }) private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(private scene: SceneService,
              private three: ThreeService) {
    THREE.Object3D.DefaultUp.set(0, 0, 1);
  }

  ngAfterViewInit() {
    this.scene.OnInit(this.getAspectRatio(),
                      this.canvas,
                      devicePixelRatio,
                      window.innerWidth,
                      window.innerHeight - 120);
    // 床面を生成する
    this.createFloor();
    // レンダリングする
    this.scene.render();
  }

  // 床面を生成する
  private createFloor() {
    const floor = new THREE.GridHelper(200, 200);
    floor.geometry.rotateX(Math.PI / 2);
    floor.material['opacity'] = 0.25;
    floor.material['transparent'] = true;
    this.scene.add(floor);
  }

  // マウスクリック時のイベント
  public onMouseDown(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'click');
  }

  // マウスクリック時のイベント
  public onMouseUp(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'select');
  }

  // マウス移動時のイベント
  public onMouseMove(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'hover');
  }

  // マウス位置とぶつかったオブジェクトを検出する
  private getMousePosition(event: MouseEvent): THREE.Vector2 {
    event.preventDefault();
    const rect = this.scene.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    return mouse;
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.scene.onResize(this.getAspectRatio(),
                        window.innerWidth,
                        window.innerHeight - 120);
  }

  private getAspectRatio(): number {
    if (this.canvas.clientHeight === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

}
