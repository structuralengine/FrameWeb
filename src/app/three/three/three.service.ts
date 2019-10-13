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

  public constructor(private ngZone: NgZone) { }

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    this.objGroup = new THREE.Group();

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

    // 頭？
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const loader = new THREE.TextureLoader();
    const texture = loader.load('assets/img/logo.png');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    this.cubeHead = new THREE.Mesh(geometry, material);
    this.cubeHead.position.x = 2;

    // 左手？
    const geoLeftHand = new THREE.BoxGeometry(0.6, 0.1, 0.1);
    const matLeftHand = new THREE.MeshStandardMaterial({ color: 0x004f00 });
    this.cubeLeftHand = new THREE.Mesh(geoLeftHand, matLeftHand);
    this.cubeLeftHand.position.x = 1.3;

    // 右手？
    const geoRightHand = new THREE.BoxGeometry(0.6, 0.1, 0.1);
    const matRightHand = new THREE.MeshStandardMaterial({ color: 0x004f00 });
    this.cubeRightHand = new THREE.Mesh(geoRightHand, matRightHand);
    this.cubeRightHand.position.x = 2.8;

    // 胴体？
    const geoCone = new THREE.ConeGeometry(1, 2, 8);
    const matCone = new THREE.MeshStandardMaterial({ color: 0x774f77 });
    this.cone = new THREE.Mesh(geoCone, matCone);
    this.cone.position.x = 2;
    this.cone.position.y = -1;

    // 頭・左手・右手のグループ化
    this.objGroup.add(this.cubeHead, this.cubeLeftHand, this.cubeRightHand, this.cone);

    // シーン追加
    this.scene.add(this.objGroup);
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