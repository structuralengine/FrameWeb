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

  static id = 'AxialLoad';
  private matLine: LineMaterial;
  private matLine_Pick: LineMaterial;
  private arrow_mat: THREE.MeshBasicMaterial;
  private arrow_mat_Pick: THREE.MeshBasicMaterial;

  constructor() {
    this.matLine = new LineMaterial({
      //color: 0xffffff,  //65行目付近のcolor.pushと同時に削除
      color: 0xff0000,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });
    this.matLine_Pick  = new LineMaterial({
      color: 0x00ffff,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });

    this.arrow_mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.arrow_mat_Pick = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  }

  public create( nodei: THREE.Vector3, nodej: THREE.Vector3, localAxis: any,
    direction: string, L1: number, L2: number, P1: number, P2: number,
    row: number ): THREE.Group {

    const offset: number = 0.1;

    const child = new THREE.Group();

    const LL = nodei.distanceTo(nodej);
    const L: number = LL - L1 - L2;

    // 線を描く
    const points = [];
    points.push(0, 0, 0);
    points.push(L, 0, 0);
    const colors = [1, 1, 1, 1, 1, 1];

    const geometry = new LineGeometry();
    geometry.setPositions(points);
    geometry.setColors(colors);

    const line2 = new Line2(geometry, this.matLine);
    line2.computeLineDistances();
    line2.position.x = L1;
    line2.name = 'line2';

    child.add(line2);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow = new THREE.Mesh(arrow_geo, this.arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.x = L1 + L;
    arrow.name = "arrow";

    child.add(arrow);
    child.name = "child";

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group["points"] = points;
    group["L1"] = L1;
    group["L"] = L;
    group["L2"] = L2;
    group["P1"] = P1;
    group["P2"] = P2;
    group["nodei"] = nodei;
    group["nodej"] = nodej;
    group["direction"] = direction;
    group["localAxis"] = localAxis;
    group["editor"] = this;
    group['value'] = Math.max(Math.abs(P1), Math.abs(P2)); // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    let A = Math.asin(XY.y);

    if (XY.x < 0) {
      A = Math.PI - A;
    }
    group.rotateZ(A);

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    group.rotateY(-Math.asin(XZ.y));

    group.name = ThreeLoadAxial.id + "-" + row.toString();
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

  // ハイライトを反映させる
  public setColor(group: any, text, dim, status: string): void {

    const group0 = group.getObjectByName('group');
    
    for(const child of  group0.children){
      if(child.name === 'child'){
        for(const target of child.children) {
          if (status === "clear") {
            if (target.name === 'line2') {
              target.material = this.matLine //デフォルトのカラー
            } else if (target.name === 'arrow') {
              target.material = this.arrow_mat //デフォルトのカラー
            }
            // 寸法線を非表示
            if (target.name === 'Dimension'){
              target.visible = false;
            }
          } else if (status === "select") {
            if (target.name === 'line2') {
              target.material = this.matLine_Pick; //ハイライト用のカラー
            } else if (target.name === 'arrow') {
              target.material = this.arrow_mat_Pick; //ハイライト用のカラー
            }
            // 寸法線を非表示
            if (target.name === 'Dimension'){
              target.visible = true;
            }
          }
        }
      } else if(child.name === 'text'){
        if (status === "clear"){
          child.visible = false;  // 文字を非表示
        } else if (status === "select"){
          child.visible = true; // 文字を表示
        }
      }
    }

  }
  
}
