import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadMoment {

  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
  }
  
  /// 節点モーメント荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(rx, ry, rz)
  public create(
    node: any,
    offset: number,
    value: number,
    radius: number,
    direction: string
  ): THREE.Group {

    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ry") {
      line_color = 0x00ff00;
    } else if (direction === "rz") {
      line_color = 0x0000ff;
    }

    const child = new THREE.Group();
    child.name = "child";

    // 色を変更する
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.x = Math.PI;

    arrow.position.set(1, 0, 0);
    arrow.name = "arrow";
    child.add(arrow);

    const curve = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      1,
      1, // xRadius, yRadius
      0,
      1.5 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    const points = curve.getPoints(12);
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const ellipse = new THREE.Line(line_geo, line_mat);
    ellipse.name = "line";
    child.add(ellipse);

    // 長さを修正する
    if (value < 0) {
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(radius, radius, radius);

    const group = new THREE.Group();

    // 文字を追加する
    const textStr: string = value.toFixed(2);
    const size: number = 0.2;
    const vartical: string = 'bottom';
    let horizontal: string;
    let pos: THREE.Vector2;
    if (value < 0) {
      horizontal = 'right';
      pos = new THREE.Vector2(-radius, 0);
    } else {
      horizontal = 'left';
      pos = new THREE.Vector2(radius, 0);
    }
    const text = this.text.create(textStr, pos, size, horizontal, vartical);
    text.name = "text";
    group.add(text);

    child.position.z = offset;

    // 向きを変更する
    if (direction === "rx") {
      group.rotation.x = Math.PI / 2;
      group.rotation.y = -Math.PI / 2;
    } else  if (direction === "ry") {
      group.rotation.x = Math.PI / 2;
    }

    // 位置を修正する
    group.position.set(node.x, node.y, node.z);

    group.add(child);
    group.name = "MomentLoad";
    group['value'] = Math.abs(value); //値を保存
    return group;
  }

}
