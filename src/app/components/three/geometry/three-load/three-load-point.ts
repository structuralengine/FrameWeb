import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadPoint {

  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
  }

  /// 節点荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(tx, ty, tz)
  public create(
    node: any,
    offset: number,
    value: number,
    length: number,
    direction: string
  ): THREE.Group {


    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ty") {
      line_color = 0x00ff00;
    } else if (direction === "tz") {
      line_color = 0x0000ff;
    }

    const child = new THREE.Group();
    child.name = "child";

    // 色を変更する
    const origin = new THREE.Vector3(-1, 0, 0);
    const dir = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow = new THREE.ArrowHelper(dir, origin, 1, line_color);
    arrow.name = "arrow";
    child.add(arrow);

    // 長さを修正する
    if (value < 0) {
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(length, length, length);

    const group = new THREE.Group();

    // 文字を追加する
    const textStr: string = value.toFixed(2);
    const size: number = 0.2;
    const vartical: string = 'bottom';
    let horizontal: string;
    let pos: THREE.Vector2;
    if (value < 0) {
      horizontal = 'right';
      pos = new THREE.Vector2(length, 0);
    } else {
      horizontal = 'left';
      pos = new THREE.Vector2(-length, 0);
    }
    const text = this.text.create(textStr, pos, size, horizontal, vartical);
    text.name = "text";
    group.add(text);

    child.position.y = offset;

    group.add(child);
    group.name = "PointLoad";
    group['value'] = Math.abs(value); //値を保存

    // 向きを変更する
    if (direction === "ty") {
      group.rotation.set(Math.PI/2, Math.PI/2, 0);
    } else if (direction === "tz") {
      group.rotation.set(-Math.PI/2, 0, -Math.PI/2);
    }

    // 位置を修正する
    group.position.set(node.x, node.y, node.z);


    return group;
  }


}
