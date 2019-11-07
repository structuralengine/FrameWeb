import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeService } from 'src/app/three---bkup/three.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  public scene: THREE.Scene;

  public selectiveObjects: THREE.Mesh[]; // 選択可能なアイテム
  // public splinePointsLength: number;
  // public positions: any[];

  // public geometry: THREE.BoxBufferGeometry;

  private selectionItem: any;

  public constructor(three: ThreeService) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // this.geometry = new THREE.BoxBufferGeometry(20, 20, 20);
    this.selectiveObjects = [];
    // this.splinePointsLength = 4;
    // this.positions = [];

    this.selectionItem = null;
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {

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

  }

  /*******
  * Curves
  *********//*
  defultTestObject() {
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.addSplineObject(this.positions[i]);
    }
    this.positions = [];
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.positions.push(this.selectiveObjects[i].position);
    }
  }

  addSplineObject(position) {
    const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const object = new THREE.Mesh(this.geometry, material);
    if (position) {
      object.position.copy(position);
    } else {
      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600;
      object.position.z = Math.random() * 800 - 400;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    this.scene.add(object);
    this.selectiveObjects.push(object);

    return object;
  }

  addPoint(): void {
    this.splinePointsLength++;
    this.positions.push(this.addSplineObject(undefined).position);
  }

  removePoint() {
    if (this.splinePointsLength <= 4) {
      return;
    }
    this.splinePointsLength--;
    this.positions.pop();
    this.scene.remove(this.selectiveObjects.pop());
  }
*/


}
