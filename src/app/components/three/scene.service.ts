import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeComponent } from './three.component';
import { GUI } from './libs/dat.gui.module.js';
import { OrbitControls } from './libs/OrbitControls.js';


@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // シーン
  private scene: THREE.Scene;

  // レンダラー
  private renderer: THREE.WebGLRenderer;

  // カメラ
  private camera: THREE.PerspectiveCamera;



  // 初期化
  public constructor() {
    // シーンを作成
    this.scene = new THREE.Scene();
    // シーンの背景を白に設定
    this.scene.background = new THREE.Color(0xf0f0f0);
    // レンダラーをバインド
    this.render = this.render.bind(this);

  }

  public OnInit(aspectRatio: number,
                canvasElement: HTMLCanvasElement,
                deviceRatio: number,
                Width: number,
                Height: number): void {
        // カメラ
        this.createCamera(aspectRatio);
        // 環境光源
        this.add(new THREE.AmbientLight(0xf0f0f0));
        // レンダラー
        this.createRender(canvasElement,
                          deviceRatio,
                          Width,
                          Height);
        // コントロール
        this.addControls();
  }

  // コントロール
  public addControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', this.render);
  }

   // 物体とマウスの交差判定に用いるレイキャスト
  public getRaycaster(mouse: THREE.Vector2): THREE.Raycaster { 
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    return raycaster;
  }

  // カメラの初期化
  public createCamera(aspectRatio: number ) {
    this.camera = new THREE.PerspectiveCamera(
      70,
      aspectRatio,
      0.1,
      1000
    );
    this.camera.position.set(0, -50, 20);
    this.scene.add(this.camera);
    
    // const gui = new GUI();
    // const self = this;
    // gui.add( {tension: 0.5}, 'tension', 0, 1 ).step( 0.01 ).onChange( (value) => {
    //   self.scale = value;
    // } );

  }

  // レンダラーを初期化する
  public createRender(canvasElement: HTMLCanvasElement,
                      deviceRatio: number,
                      Width: number,
                      Height: number): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setPixelRatio(deviceRatio);
    this.renderer.setSize(Width, Height);
    this.renderer.shadowMap.enabled = true;
  }

  // リサイズ
  public onResize(deviceRatio: number,
                  Width: number,
                  Height: number): void {
    this.camera.aspect = deviceRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Width, Height);
    this.render();
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(mouse: THREE.Vector2 , action: string): void {

    // 物体とマウスの交差判定に用いるレイキャスト
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.selectiveObjects);

    switch (action) {
      case 'click':
        this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'select':
          this.selectionItem = null;
          this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 1.00;
            this.selectionItem = item;
          } else {
            // それ以外は元の色にする
            item.material['color'].setHex(0x000000);
            item.material['opacity'] = 1.00;
          }
        });
        break;

      case 'hover':
        this.selectiveObjects.map(item => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            item.material['color'].setHex(0xff0000);
            item.material['opacity'] = 0.25;
          } else {
            if ( item === this.selectionItem ) {
              item.material['color'].setHex(0xff0000);
              item.material['opacity'] = 1.00;
            } else {
              // それ以外は元の色にする
              item.material['color'].setHex(0x000000);
              item.material['opacity'] = 1.00;
            }
          }
        });
        break;

      default:
        return;
    }
    this.render();
  }

  // レンダリングする
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  // レンダリングのサイズを取得する
  public getBoundingClientRect(): ClientRect | DOMRect  {
    return this.renderer.domElement.getBoundingClientRect();
  }

  // シーンにオブジェクトを追加する
  public add(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.add(obj);
    }
  }
  
  // シーンのオブジェクトを削除する
  public remove(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.remove(obj);
    }
  }

  // シーンにオブジェクトを削除する
  public removeByName(...threeName: string[]): void {
    for (const name of threeName) {
      const target = this.scene.getObjectByName(name);
      if (target === undefined) {
        continue;
      }
      this.scene.remove(target);
    }
  }

}
