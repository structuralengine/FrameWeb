import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeComponent } from './three.component';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // シーン
  private scene: THREE.Scene;

  // レンダラー
  public renderer: THREE.WebGLRenderer;

  // カメラ
  public camera: THREE.PerspectiveCamera;
  private fieldOfView = 70;
  private nearClippingPane = 1;
  private farClippingPane = 10000;

  // アイテム
  private Node: THREE.CircleBufferGeometry; // 節点
  private Member: THREE.Line; // メンバー
  private FixNode: THREE.BoxBufferGeometry; // 支点
  private FixMember: THREE.BoxBufferGeometry; // 分布バネ
  private Joint: THREE.RingBufferGeometry; // 結合
  private PointLoad: THREE.BoxBufferGeometry; // 集中荷重
  private PointMomentLoad: THREE.BoxBufferGeometry; // 集中モーメント荷重
  private MemberLoad: THREE.BoxBufferGeometry; // 分布荷重
  private MemberAxsialLoad: THREE.BoxBufferGeometry; // 平行方向分布荷重
  private MemberMomentLoad: THREE.BoxBufferGeometry; // ねじりモーメント荷重
  private result: THREE.BoxBufferGeometry; // モーメント図

  // 選択可能なアイテム
  public selectiveObjects: THREE.Mesh[];

  // 選択中のアイテム
  private selectionItem: any;

  // 初期化
  public constructor() {
    // シーンを作成
    this.scene = new THREE.Scene();
    // シーンの背景を白に設定
    this.scene.background = new THREE.Color(0xf0f0f0);
    // レンダラーをバインド
    this.render = this.render.bind(this);
    // 選択可能なアイテムを初期化
    this.selectiveObjects = [];
    // 選択中のアイテム null に
    this.selectionItem = null;
  }

  // シーンにオブジェクトを追加する
  public add(...threeObject: THREE.Object3D[]): void {
      for (const obj of threeObject) {
        this.scene.add(obj);
      }
  }


  // カメラの初期化
  public createCamera(aspectRatio: number ) {
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.set(0, -500, 500);
    this.scene.add(this.camera);
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

}
