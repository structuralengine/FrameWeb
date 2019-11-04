import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  public scene: THREE.Scene;

  public splineHelperObjects: THREE.Mesh[];
  public splinePointsLength: number;
  public positions: any[];

  public geometry: THREE.BoxBufferGeometry;
  public meshList: any[];

  public constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.geometry = new THREE.BoxBufferGeometry(20, 20, 20);
    this.splineHelperObjects = [];
    this.splinePointsLength = 4;
    this.positions = [];

    this.meshList = [];
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster): void {
    const intersects = raycaster.intersectObjects(this.splineHelperObjects);
    // 交差しているオブジェクトが1つ以上存在し、
    // 交差しているオブジェクトの1番目(最前面)のものだったら
    this.splineHelperObjects.map(mesh => {
      // 交差しているオブジェクトが1つ以上存在し、
      // 交差しているオブジェクトの1番目(最前面)のものだったら
      if (intersects.length > 0 && mesh === intersects[0].object) {
        // 色を赤くする
        mesh.material['color'].setHex(0xff0000);
        mesh.material['opacity'] = 0.25;

      } else {
        // それ以外は元の色にする
        mesh.material['color'].setHex(0x000000);
        mesh.material['opacity'] = 1.00;
      }
    });
  }

  /*******
  * Curves
  *********/
  defultTestObject() {
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.addSplineObject(this.positions[i]);
    }
    this.positions = [];
    for (let i = 0; i < this.splinePointsLength; i++) {
      this.positions.push(this.splineHelperObjects[i].position);
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
    this.splineHelperObjects.push(object);

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
    this.scene.remove(this.splineHelperObjects.pop());
  }


}
