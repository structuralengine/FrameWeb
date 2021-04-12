import { Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2 } from 'three';
import { Line2 } from '../../libs/Line2.js';
import { LineMaterial } from '../../libs/LineMaterial.js';
import { LineGeometry } from '../../libs/LineGeometry.js';

import { ThreeLoadDimension } from './three-load-dimension';
import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadAxial {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  private matLine: LineMaterial;
  private three_color: THREE.Color;
  private arrow_mat: THREE.MeshBasicMaterial;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
    this.matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });
    const line_color = 0xff0000;
    this.three_color = new THREE.Color(line_color);
    this.arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });

  }
  public create(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    localAxis: any,
    direction: string,
    L1: number,
    L2: number,
    P1: number,
    P2: number,
    row: number
  ): THREE.Group {

    const offset: number = 0.1;

    const child = new THREE.Group();

    // 線の色を決める
    //const line_color = 0xff0000;
    //const three_color = new THREE.Color(line_color);

    const LL = nodei.distanceTo(nodej);
    const L: number = LL - L1 - L2;

    // 線を描く
    const points = [];
    points.push(0, 0, 0);
    points.push(L, 0, 0);
    const colors = [];
    colors.push(this.three_color.r, this.three_color.g, this.three_color.b);
    colors.push(this.three_color.r, this.three_color.g, this.three_color.b);

    const geometry = new LineGeometry();
    geometry.setPositions( points );
    geometry.setColors( colors );
    /*
    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });
    */
    const line2 = new Line2( geometry, this.matLine );
    line2.computeLineDistances();
    line2.position.x = L1;
    line2.name = 'line2';

    child.add(line2);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    //const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, this.arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.x = L1 + L;
    arrow.name = "arrow";

    child.add(arrow);
    child.name = "child";

    /*/ 寸法線
    const dim = this.getDim(L1, L, L2, offset);
    //dim.visible = false;
    dim.visible = true;
    child.add(dim);
    */
    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    /*/ 文字を追加する
    for (const text of this.getText(P1, P2, L1, L1 + L, offset)) {
      text.visible = false;
      group0.add(text);
    }
    */
    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = Math.max(Math.abs(P1), Math.abs(P2)); // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    let A = Math.asin(XY.y);

      if( XY.x < 0){
       A = Math.PI - A;
      }
    group.rotateZ(A);

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    group.rotateY(-Math.asin(XZ.y));

    group.name = "AxialLoad" + row.toString();
    return group;
  }

  /*/ 寸法線
  private getDim(L1: number, L: number, L2: number, offset: number): THREE.Group {

    const L1L = L1 + L;
    const L1LL2 = L1 + L + L2;

    const dim = new THREE.Group();

    let dim1: THREE.Group;
    let dim2: THREE.Group;
    let dim3: THREE.Group;

    if (L1 > 0) {
      const p = [
        new THREE.Vector2(0,  0),
        new THREE.Vector2(0,  1),
        new THREE.Vector2(L1, 1),
        new THREE.Vector2(L1, offset),
      ];
      dim1 = this.dim.create(p, L1.toFixed(3))
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
    dim2 = this.dim.create(p, L.toFixed(3))
    dim2.visible = true;
    dim2.name = "Dimension2";
    dim.add(dim2);

    if (L2 > 0) {
      const p = [
        new THREE.Vector2(L1L, offset),
        new THREE.Vector2(L1L, 1),
        new THREE.Vector2(L1LL2, 1),
        new THREE.Vector2(L1LL2, 0),
      ];
      dim3 = this.dim.create(p, L2.toFixed(3))
      dim3.visible = true;
      dim3.name = "Dimension3";
      dim.add(dim3);
    }

    // 登録
    dim.name = "Dimension";

    return dim;
  }
  */
  /*/ 文字
  private getText(P1: number, P2: number, pos1: number, pos2: number,  offset: number): THREE.Group[] {

    const result = [];

    const size: number = 0.1; // 文字サイズ

    const pos = new THREE.Vector2(0, 0);
    if (P1 !== 0) {
      const text = this.text.create(P1.toFixed(2), pos, size, 'left', 'bottom');
      text.rotateZ(Math.PI / 2);
      text.position.x = pos1;
      text.position.y = offset;
      text.name = "text";
      result.push(text);
    }

    if (P2 !== 0) {
      const text = this.text.create(P2.toFixed(2), pos, size, 'left', 'top');
      text.rotateZ(Math.PI / 2);
      text.position.x = pos2;
      text.position.y = offset;
      text.name = "text";
      result.push(text);
    }

    return result;
  }
  */

  // 大きさを反映する
  public setSize(group: any, scale: number): void {
    for (const item of group.children) {
      item.scale.set(1, scale, scale);
    }
  }

  // 大きさを反映する
  public setScale(group: any, scale: number): void {
    group.scale.set(1, scale, scale);
  }

}
