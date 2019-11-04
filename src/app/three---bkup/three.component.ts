import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import Stats from './libs/stats.module.js';
import { GUI } from './libs/dat.gui.module.js';

import { DragControls } from './libs/DragControls.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { TransformControls } from './libs/TransformControls.js';

import { ThreeService } from './three.service';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('myCanvas', { static: true }) public myCanvas: ElementRef;

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;

  private frameId: number = null;
  private stats: Stats;
  private transformControl;
  private hiding;

  constructor(private three: ThreeService) {
    THREE.Object3D.DefaultUp.set(0, 0, 1);
  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.canvas = this.myCanvas.nativeElement;
    this.createScene();
    /* テストコード */ this.three.defultTestObject();
    this.animate();
  }

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(): void {

    // create the scene
    this.three.scene = new THREE.Scene();
    this.three.scene.background = new THREE.Color(0xf0f0f0);

    // カメラの配置
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(0, -500, 500);
    this.three.scene.add(this.camera);

    // 環境光源
    this.three.scene.add(new THREE.AmbientLight(0xf0f0f0));

    // 床面
    const floor = new THREE.GridHelper(2000, 100);
    floor.geometry.rotateX(Math.PI / 2);
    floor.material['opacity'] = 0.25;
    floor.material['transparent'] = true;
    this.three.scene.add(floor);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.shadowMap.enabled = true;
    // this.renderer.setSize(window.innerWidth, window.innerHeight - 105);
    // 初期化のために実行
    this.onWindowResize();
    // リサイズイベント発生時に実行
    window.addEventListener('resize', this.onWindowResize);

    this.stats = new Stats();
    this.canvas.appendChild(this.stats.dom);


    // Controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', this.render);
    controls.addEventListener('start', () => {
      this.cancelHideTransform();
    });
    controls.addEventListener('end', () => {
      this.delayHideTransform();
    });

    // this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    // this.transformControl.addEventListener('change', this.render);
    // this.transformControl.addEventListener('dragging-changed', (event) => {
    //   controls.enabled = !event.value;
    // });

    // this.three.scene.add(this.transformControl);

    // Hiding transform situation is a little in a mess :()
    // this.transformControl.addEventListener('change', () => {
    //   this.cancelHideTransform();
    // });
    // this.transformControl.addEventListener('mouseDown', () => {
    //   this.cancelHideTransform();
    // });
    // this.transformControl.addEventListener('mouseUp', () => {
    //   this.delayHideTransform();
    // });

    const dragcontrols = new DragControls(this.three.splineHelperObjects, this.camera, this.renderer.domElement);
    dragcontrols.enabled = false;
    dragcontrols.addEventListener('hoveron', (event) => {
      // this.transformControl.attach(event.object);
      this.cancelHideTransform();
    });
    dragcontrols.addEventListener('hoveroff', () => {
      this.delayHideTransform();
    });

  }
  onWindowResize() {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;
    // レンダラーのサイズを調整する
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // カメラのアスペクト比を正す
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  delayHideTransform() {
    this.cancelHideTransform();
    this.hideTransform();
  }

  cancelHideTransform() {
    if (this.hiding) { clearTimeout(this.hiding); }
  }

  hideTransform() {
    const self = this;
    this.hiding = setTimeout(() => {
      // self.transformControl.detach(self.transformControl.object);
    }, 2500);
  }

  animate(): void {
    this.render();
    this.stats.update();
  }


  render() {
    this.frameId = requestAnimationFrame(() => {
      if (this.renderer) {
        this.render();
      }
    });
    if (this.renderer) {
      this.renderer.render(this.three.scene, this.camera);
    }
  }
}

