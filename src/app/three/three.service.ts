import { Injectable, ElementRef, OnInit, NgZone } from '@angular/core';

import * as THREE from 'three';
import Stats from './libs/stats.module.js';
import { GUI } from './libs/dat.gui.module.js';

import { DragControls } from './libs/DragControls.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { TransformControls } from './libs/TransformControls.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  public scene: THREE.Scene;

  public splineHelperObjects: any[];
  public splinePointsLength: number;
  public positions: any[];

  public geometry: THREE.BoxBufferGeometry;

  public constructor(private ngZone: NgZone) {
    this.geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    this.splineHelperObjects = [];
    this.splinePointsLength = 4;
    this.positions = [];
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
    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
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
