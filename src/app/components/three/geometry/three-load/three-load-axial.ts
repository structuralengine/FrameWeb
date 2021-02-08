import { Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2 } from 'three';
import { ThreeLoadDimension } from './three-load-dimension';

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadAxial {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
  }
  public create(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    localAxis: any,
    direction: string,
    L1: number,
    L2: number,
    P1: number,
    P2: number
  ): THREE.Group {

    const offset: number = 0.1;

    const child = new THREE.Group();

    // 線の色を決める
    const line_color = 0xff0000;
    const LL = nodei.distanceTo(nodej);
    const L: number = LL - L1 - L2;
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)];

    // 線を描く
    const line_mat = new THREE.LineDashedMaterial({
      color: line_color,
      dashSize: 0.1,
      gapSize: 0.1,
      linewidth: 1,
    });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.position.x = L1;
    line.name = "line";

    child.add(line);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.x = 1 + L1;
    arrow.name = "arrow";

    child.add(arrow);
    child.name = "child";

    // 寸法線
    child.add(this.getDim(L1, L, L2, offset));

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    // 文字を追加する
    for (const text of this.getText(P1, P2, L1, L1 + L, offset)) {
      group0.add(text);
    }

    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = Math.max(Math.abs(P1), Math.abs(P2)); // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    group.rotateZ(Math.asin(XY.y));

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    group.rotateY(-Math.asin(XZ.y));

    group.name = "AxialLoad";
    return group;
  }

  // 寸法線
  private getDim(_L1: number, _L: number, _L2: number, offset: number): THREE.Group {

    const LL = _L1 + _L + _L2;
    const L1 = _L1 / LL;
    const L1L = (_L1 + _L) / LL;
    
    const dim = new THREE.Group();

    let dim1: THREE.Group;
    let dim2: THREE.Group;
    let dim3: THREE.Group;

    if (_L1 > 0) {
      const p = [
        new THREE.Vector2(0,  0),
        new THREE.Vector2(0,  1),
        new THREE.Vector2(L1, 1),
        new THREE.Vector2(L1, offset),
      ];
      dim1 = this.dim.create(p, _L1.toFixed(3))
      dim1.visible = true;
      dim1.name = "Dimension1";
      dim.add(dim1);
    }

    const p = [
      new THREE.Vector2(L1,  offset),
      new THREE.Vector2(L1,  1),
      new THREE.Vector2(L1L, 1),
      new THREE.Vector2(L1L, offset),
    ];
    dim2 = this.dim.create(p, _L.toFixed(3))
    dim2.visible = true;
    dim2.name = "Dimension2";
    dim.add(dim2);

    if (_L2 > 0) {
      const p = [
        new THREE.Vector2(L1L, offset),
        new THREE.Vector2(L1L, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, 0),
      ];
      dim3 = this.dim.create(p, _L2.toFixed(3))
      dim3.visible = true;
      dim3.name = "Dimension3";
      dim.add(dim3);
    }

    // 登録
    dim.name = "Dimension";

    return dim;
  }

  // 文字
  private getText(P1: number, P2: number, pos1: number, pos2: number,  offset: number): THREE.Group[] {

    const result = [];

    const size: number = 0.1; // 文字サイズ

    const pos = new THREE.Vector2(0, 0);
    if (P1 !== 0) {
      const text = this.text.create(P1.toFixed(2), pos, size, 'left', 'bottom');
      text.rotateZ(Math.PI / 2);
      text.position.x = 0;
      text.position.y = offset;
      text.name = "text1";
      result.push(text);
    }

    if (P2 !== 0) {
      const text = this.text.create(P2.toFixed(2), pos, size, 'left', 'top');
      text.rotateZ(Math.PI / 2);
      text.position.x = 1;
      text.position.y = offset;
      text.name = "text2";
      result.push(text);
    }

    return result;
  }

}
