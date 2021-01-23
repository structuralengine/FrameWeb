import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadTemperature { 

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  private TEMPLATE: THREE.Group;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
    this.TEMPLATE = this.create(); // 温度荷重のテンプレート
  }

  public clone(): THREE.Group {
    return this.TEMPLATE.clone();
  }

  // 温度荷重の雛形を X軸に生成する
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

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "mTemp";
    return group;
  }

}
