import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener, Renderer2 } from '@angular/core';
import * as THREE from 'three';

import Stats from './libs/stats.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { DragControls } from './libs/DragControls.js';
import { TransformControls } from './libs/TransformControls.js';

import { SceneService } from './scene.service';
import { ThreeService } from './three.service';
import { SafeHtml } from '@angular/platform-browser';

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

    // ラベルを表示する用のレンダラーを HTML に配置する
    const element = this.scene.labelRendererDomElement();
    // element.addEventListener('mouseDown', this.onMouseDown());
    // element.addEventListener('mouseUp', this.onMouseUp());
    // element.addEventListener('mouseMove', this.onMouseMove());
    
    const div = document.getElementById('myCanvas'); // ボタンを置きたい場所の手前の要素を取得
    div.parentNode.insertBefore(element, div.nextSibling); // ボタンを置きたい場所にaタグを追加

    // 床面を生成する
    this.createHelper();

    // レンダリングする
    this.scene.render();
  }

  // 床面を生成する
  private createHelper() {
    const floor = new THREE.GridHelper(200, 200);
    floor.geometry.rotateX(Math.PI / 2);
    floor.material['opacity'] = 0.25;
    floor.material['transparent'] = true;
    this.scene.add(floor);
  }

  // マウスクリック時のイベント
  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'click');
  }

  // マウスクリック時のイベント
  @HostListener('mouseup', ['$event'])
  public onMouseUp(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'select');
  }

  // マウス移動時のイベント
  @HostListener('mousemove', ['$event'])
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
