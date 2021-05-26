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
export class ThreeLoadTemperature {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  private colors: number[];
  private arrow_mat: THREE.MeshBasicMaterial;

  private matLine: LineMaterial;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;

    // 線の色を決める
    const line_color = 0xff0000;
    const three_color = new THREE.Color(line_color);

    //this.colors = [];
    this.colors = [1, 1, 1, 1, 1, 1]
    //this.colors.push(three_color.r, three_color.g, three_color.b);
    //this.colors.push(three_color.r, three_color.g, three_color.b);

    //this.arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    this.arrow_mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    this.matLine = new LineMaterial({
      color: 0xff0000,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });
  }
  public create(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    localAxis: any,
    P1: number,
    row: number
  ): THREE.Group {

    const offset: number = 0.1;

    const child = new THREE.Group();

    // 線の色を決める
    // const line_color = 0xff0000;
    // const three_color = new THREE.Color(line_color);

    const L = nodei.distanceTo(nodej);

    // 線を描く
    const points = [];
    points.push(0, 0, 0);
    points.push(L, 0, 0);
    // const colors = [];
    // colors.push(three_color.r, three_color.g, three_color.b);
    // colors.push(three_color.r, three_color.g, three_color.b);

    const geometry = new LineGeometry();
    geometry.setPositions(points);
    geometry.setColors(this.colors);

    /*
    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    });
    */

    const line2 = new Line2(geometry, this.matLine);
    line2.computeLineDistances();
    line2.name = 'line2';

    child.add(line2);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    // const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, this.arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.name = "arrow";

    child.add(arrow);
    child.name = "child";

    /*/ 寸法線
    const dim = this.getDim(L, offset);
    dim.visible = false;
    child.add(dim);
    */

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    /*/ 文字を追加する
    const text = this.getText(P1, L, offset);
    text.visible = false;
    group0.add(text);
    */

    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = Math.abs(P1); // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    group.rotateZ(Math.asin(XY.y));

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    group.rotateY(-Math.asin(XZ.y));

    group.name = "TemperatureLoad-" + row.toString();
    return group;
  }

  /*/ 寸法線
  private getDim(L: number, offset: number): THREE.Group {

    const dim = new THREE.Group();

    let dim2: THREE.Group;

    const p = [
      new THREE.Vector2(0, offset),
      new THREE.Vector2(0, 1),
      new THREE.Vector2(L, 1),
      new THREE.Vector2(L, offset),
    ];
    dim2 = this.dim.create(p, L.toFixed(3))
    dim2.visible = true;
    dim2.name = "Dimension2";
    dim.add(dim2);

    // 登録
    dim.name = "Dimension";

    return dim;
  }
  */
  /*/ 文字
  private getText(P1: number, L: number,  offset: number): THREE.Group {

    const size: number = 0.1; // 文字サイズ

    const pos = new THREE.Vector2(0, 0);
    const title = P1.toFixed(2) + 'ｰ';
    const text = this.text.create(title, pos, size);
    text.rotateZ(Math.PI / 2);
    text.position.x = L/2;
    text.position.y = offset;
    text.name = "text";

    return text;
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
  public setColor(group: any, n: string): void {

    //置き換えるマテリアルを生成 -> colorを設定し，対象オブジェクトのcolorを変える
    const matLine_Pick = new LineMaterial({
      color: 0x00ffff,
      linewidth: 0.001, // in pixels
      vertexColors: true,
      dashed: false
    })
    const arrow_mat_Pick = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    for (let target of group.children[0].children[0].children) {
      if (n === 'clear') {
        if (target.name === 'line2') {
          target.material = this.matLine; //デフォルトのカラー
        } else if (target.name === 'arrow') {
          target.material = this.arrow_mat //デフォルトのカラー
        }
      } else if (n === "select") {
        if (target.name === 'line2') {
          target.material = matLine_Pick; //ハイライト用のカラー
        } else if (target.name === 'arrow') {
          target.material = arrow_mat_Pick; //ハイライト用のカラー
        }
      }
    }
  }
  
}
