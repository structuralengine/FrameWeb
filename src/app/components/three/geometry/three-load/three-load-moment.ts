import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadMoment {

  private TEMPLATE: THREE.Group; // 節点モーメントのテンプレート
  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.TEMPLATE = this.create(); // 節点モーメントのテンプレート
  }

  public clone(): THREE.Group{
    return this.TEMPLATE.clone();
  }

  // 節点モーメントの矢印を作成する
  private create(): THREE.Group {
    const group = new THREE.Group();

    const child = new THREE.Group();

    const line_color = 0x0000ff;

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
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: line_color });
    const ellipse = new THREE.Line(lineGeometry, lineMaterial);
    ellipse.rotation.y = Math.PI / 2;
    ellipse.name = "line";
    child.add(ellipse);

    // 矢印を描く
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
    const arrow = new THREE.Mesh(arrow_geo, arrow_mat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.rotation.x = Math.PI / 6;
    arrow.position.set(-0.125, -1, 0);
    arrow.name = "arrow";
    child.add(arrow);
    child.name = "child";


    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.add(child);
    group.name = "MomentLoad";
    return group;
  }
  
  /// 節点モーメント荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(rx, ry, rz)
  public change(
    target: THREE.Group,
    node: any,
    offset: THREE.Vector2,
    value: number,
    radius: number,
    direction: string
  ): void {

/*
    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ry") {
      line_color = 0x00ff00;
    } else if (direction === "rz") {
      line_color = 0x0000ff;
    }

    const child: any = target.getObjectByName("child");

    // 色を変更する
    const arrow: any = child.getObjectByName("arrow");
    arrow.material.color.set(line_color);
    const ellipse: any = child.getObjectByName("line");
    ellipse.material.color.set(line_color);

    // 長さを修正する
    if (value < 0) {
      child.rotation.set(-Math.PI, -Math.PI, 0);
    }
    child.scale.set(radius, radius, radius);

    // 文字を追加する
    const oldText = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
    }
    const textStr: string = value.toFixed(2);
    const size: number = 0.2;
    const vartical: string = 'bottom';
    let horizontal: string;
    let pos: THREE.Vector2;
    if (value < 0) {
      horizontal = 'right';
      pos = new THREE.Vector2(radius + offset.x, 0);
    } else {
      horizontal = 'left';
      pos = new THREE.Vector2(-radius + offset.x, 0);
    }
    const text = this.text.create(textStr, pos, size, horizontal, vartical);
    text.name = "text";
    target.add(text);

    child.position.x = offset.x;
    child.position.y = offset.y;


    // 向きを変更する
    if (direction === "ry") {
      target.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    } else if (direction === "rz") {
      target.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    }
*/

    // 位置を修正する
    target.position.set(node.x, node.y, node.z);
  }

}
