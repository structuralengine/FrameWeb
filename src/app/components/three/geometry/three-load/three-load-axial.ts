import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadAxial {

  private line: THREE.Line;
  private arrow: THREE.Mesh;
  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.create();
  }

  public clone(): THREE.Group {

    const line = this.line.clone();
    const line_mat: any = this.line.material;
    line.material = line_mat.clone();

    const arrow = this.arrow.clone();
    const arrow_mat: any = this.arrow.material;
    arrow.material = arrow_mat.clone();

    const child = new THREE.Group();
    child.add(line);
    child.add(arrow);
    child.name = "child";

    const group = new THREE.Group();
    group.add(child);

    group.name = "mAxial";
    return group;
  }

  // 軸方向荷重の雛形を X軸に生成する
  private create(): void {

    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)];

    const line_color = 0xff0000;

    // 線を描く
    const line_mat = new THREE.LineDashedMaterial({
      color: line_color,
      dashSize: 0.1,
      gapSize: 0.1,
      linewidth: 1,
    });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    this.line = new THREE.Line(line_geo, line_mat);
    this.line.name = "line";

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    this.arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    this.arrow.rotation.z = -Math.PI / 2;
    this.arrow.position.set(1, 0, 0);
    this.arrow.name = "arrow";
  }

}
