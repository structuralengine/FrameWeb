import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadPoint {

  private TEMPLATE: THREE.Group; // 節点荷重のテンプレート
  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.TEMPLATE = this.create(); // 節点荷重のテンプレート
  }

  public clone(): THREE.Group {
    return this.TEMPLATE.clone();
  }

  // 節点荷重の矢印を作成する
  private create(): THREE.Group {
    const group = new THREE.Group();
    const line_color = 0x0000ff;

    const length = 1; // 長さ
    const origin = new THREE.Vector3(-1, 0, 0);

    const dir = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow = new THREE.ArrowHelper(dir, origin, length, line_color);
    arrow.name = "arrow";

    // 矢印の原点を先端に変更する
    const child = new THREE.Group();
    child.add(arrow);
    child.name = "child";

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.add(child);
    group.name = "PointLoad";
    return group;
  }

  /// 節点荷重を編集する
  // target: 編集対象の荷重,
  // node: 基準点,
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // value: 荷重値,
  // length: 表示上の長さ,
  // direction: 荷重の向き(tx, ty, tz)
  public change(
    target: THREE.Group,
    node: any,
    offset: THREE.Vector2,
    value: number,
    length: number,
    direction: string
  ): void {


    //線の色を決める
    let line_color = 0xff0000;
    if (direction === "ty") {
      line_color = 0x00ff00;
    } else if (direction === "tz") {
      line_color = 0x0000ff;
    }

    const child: any = target.getObjectByName("child");

    // 色を変更する
    const arrow: any = child.getObjectByName("arrow");
    arrow.line.material.color.set(line_color);
    arrow.cone.material.color.set(line_color);

    // 長さを修正する
    if (value < 0) {
      child.rotation.set(-Math.PI, 0, -Math.PI);
    }
    child.scale.set(length, length, length);

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
      pos = new THREE.Vector2(length + offset.x, 0);
    } else {
      horizontal = 'left';
      pos = new THREE.Vector2(-length + offset.x, 0);
    }
    const text = this.text.create(textStr, pos, size, horizontal, vartical);
    text.name = "text";
    target.add(text);

    child.position.x = offset.x;
    child.position.y = offset.y;


    // 向きを変更する
    if (direction === "ty") {
      target.rotation.set(Math.PI/2, Math.PI/2, 0);
    } else if (direction === "tz") {
      target.rotation.set(-Math.PI/2, 0, -Math.PI/2);
    }

    // 位置を修正する
    target.position.set(node.x, node.y, node.z);

  }
  

}
