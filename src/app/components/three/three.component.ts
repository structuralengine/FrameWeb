import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';

import Stats from './libs/stats.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { DragControls } from './libs/DragControls.js';
import { TransformControls } from './libs/TransformControls.js';

import { SceneService } from './scene.service';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit {

  @ViewChild('myCanvas', { static: true }) private canvasRef: ElementRef;

  // カメラの制御関数
  private fieldOfView = 70;
  private nearClippingPane = 1;
  private farClippingPane = 10000;

  // 物体とマウスの交差判定に用いるレイキャスト
  private raycaster: THREE.Raycaster;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(private scene: SceneService) {
    // this.scene.render = this.scene.render.bind(this);
    THREE.Object3D.DefaultUp.set(0, 0, 1);
  }

  ngAfterViewInit() {
    this.createScene();
    /* テストコード 
    this.scene.defultTestObject();
    */
    this.scene.render();
  }

  private createScene() {
    // カメラ
    this.createCamera();
    // 環境光源
    this.createLight();
    // 床面
    this.createFloor();
    // レンダラー
    this.createRender();
    // コントロール
    this.addControls();
  }

  private createCamera() {
    this.scene.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.getAspectRatio(),
      this.nearClippingPane,
      this.farClippingPane
    );
    this.scene.camera.position.set(0, -500, 500);
    this.scene.scene.add(this.scene.camera);
  }

  private createLight() {
    this.scene.scene.add(new THREE.AmbientLight(0xf0f0f0));
  }

  private createFloor() {
    const floor = new THREE.GridHelper(2000, 100);
    floor.geometry.rotateX(Math.PI / 2);
    floor.material['opacity'] = 0.25;
    floor.material['transparent'] = true;
    this.scene.scene.add(floor);
  }

  private createRender() {
    this.scene.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.scene.renderer.setPixelRatio(devicePixelRatio);
    this.scene.renderer.setSize(window.innerWidth, window.innerHeight - 120);
    this.scene.renderer.shadowMap.enabled = true;
  }

  public addControls() {
    const controls = new OrbitControls(this.scene.camera, this.scene.renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', this.scene.render);
  }

  public onMouseDown(event: MouseEvent) {
    // マウス位置とぶつかったオブジェクトを検出する
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.detectObject(mouse, 'click');
    // レンダリング
    this.scene.render();
  }

  public onMouseUp(event: MouseEvent) {
    // マウス位置とぶつかったオブジェクトを検出する
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.detectObject(mouse, 'select');
    // レンダリング
    this.scene.render();
  }

  public onMouseMove(event: MouseEvent) {
    // マウス位置とぶつかったオブジェクトを検出する
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.detectObject(mouse, 'hover');
    // レンダリング
    this.scene.render();
  }

  private getMousePosition(event: MouseEvent): THREE.Vector2 {
    event.preventDefault();
    const rect = this.scene.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    return mouse;
  }

  // マウス位置とぶつかったオブジェクトを検出する
  private detectObject(mouse: THREE.Vector2 , action: string): void {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.scene.camera);
    this.scene.detectObject(raycaster, action);
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.scene.camera.aspect = this.getAspectRatio();
    this.scene.camera.updateProjectionMatrix();
    this.scene.renderer.setSize(window.innerWidth, window.innerHeight - 120);
    this.scene.render();
  }



  private getAspectRatio(): number {
    if (this.canvas.clientHeight === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

}
