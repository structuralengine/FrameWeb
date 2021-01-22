import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadAxial {

  private TEMPLATE: THREE.Group; // 軸方向荷重のテンプレート
  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.TEMPLATE = this.create(); // 軸方向荷重のテンプレート
  }

  public clone(): THREE.Group {
    return this.TEMPLATE.clone();
  }

  // 軸方向荷重の雛形を X軸に生成する
  private create(): THREE.Group {
    const group = new THREE.Group();

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
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(1, 0, 0);
    arrow.name = "arrow";
    group.add(arrow);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "mAxial";
    return group;
  }


}
