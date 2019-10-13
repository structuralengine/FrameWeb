import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';

import * as THREE from 'three';
import { Vector3, Object3D, Font } from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private lightDirec: THREE.DirectionalLight;

  private cubeHead: THREE.Mesh;
  private cubeLeftHand: THREE.Mesh;
  private cubeRightHand: THREE.Mesh;
  private cone: THREE.Mesh;
  private objGroup: THREE.Group;
  private isRotate: boolean;

  private frameId: number = null;


  // マウス座標管理用のベクトルを作成
  private mouse: THREE.Vector2;


  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {

    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    // カメラの配置
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    // 環境光源
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    // 平行光源
    this.lightDirec = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.lightDirec.position.set(0, 10, 10);
    this.scene.add(this.lightDirec);

    // データ
    this.objGroup = new THREE.Group();
  
    const meshList = [];
    for (let i = 0; i < 200; i++) {
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const geometry = new THREE.BoxBufferGeometry(50, 50, 50);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 800;
      mesh.position.y = (Math.random() - 0.5) * 800;
      mesh.position.z = (Math.random() - 0.5) * 800;
      mesh.rotation.x = Math.random() * 2 * Math.PI;
      mesh.rotation.y = Math.random() * 2 * Math.PI;
      mesh.rotation.z = Math.random() * 2 * Math.PI;
      // 配列に保存
      this.objGroup.add(mesh);

       // マウスとの交差を調べたいものは配列に格納する
      meshList.push(mesh);
    }

    // シーン追加
    this.scene.add(this.objGroup);

    // マウス
    this.mouse = new THREE.Vector2();

  }


  animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('DOMContentLoaded', () => {
        this.render();
      });

      window.addEventListener('resize', () => {
        this.resize();
      });

      
    });
  }

  render() {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    // VTuberを回す
    if (this.isRotate) {
      this.objGroup.rotation.x += 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  rotate() {
    // 回転オン
    this.isRotate = true;
  }

  rotateOff() {
    // 回転オフ
    this.isRotate = false;
  }

}
