import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadTemperature { 

  private line: THREE.Line;

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
    this.create();
  }

  public clone(): THREE.Group {
    
    const line = this.line.clone();
    const line_mat: any = this.line.material;
    line.material = line_mat.clone();

    const child = new THREE.Group();
    child.add(line);
    child.name = "child";

    const group = new THREE.Group();
    group.add(child);

    group.name = "mTemp";
    return group;
  }

  // 温度荷重の雛形を X軸に生成する
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
  }

}
