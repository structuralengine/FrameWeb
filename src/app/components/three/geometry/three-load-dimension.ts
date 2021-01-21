import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadDimension { 

  private text: ThreeLoadText;

  constructor(text: ThreeLoadText) {
    this.text = text;
  }


  // 寸法線を作成する
  public createDimension(): THREE.Group {
    const group = new THREE.Group();

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, 0, 0),
    ];

    const line_color = 0x000000;

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const length = 0.5; // 長さ
    const origin = new THREE.Vector3(length, 1, 0);

    const dir1 = new THREE.Vector3(-1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow1 = new THREE.ArrowHelper(dir1, origin, length, line_color);
    arrow1.name = "arrow1";
    group.add(arrow1);

    const dir2 = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    const arrow2 = new THREE.ArrowHelper(dir2, origin, length, line_color);
    arrow2.name = "arrow2";
    group.add(arrow2);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    return group;
  }


  // 寸法線を編集する
  public changeDimension(
    target: THREE.Group,
    points: THREE.Vector2[],
    textStr: string
  ): void {
    const pos0: THREE.Vector2 = points[0];
    const pos1: THREE.Vector2 = points[1];
    const pos2: THREE.Vector2 = points[2];
    const pos3: THREE.Vector2 = points[3];

    // 線の位置を更新する
    const line: any = target.getObjectByName("line");
    const line_geo = line.geometry;
    const array = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const j = i * 3;
      const p = points[i];
      array[j + 0] = p.x;
      array[j + 1] = p.y;
      array[j + 2] = 0;
    }
    line_geo.attributes.position.array = array;
    line_geo.attributes.position.needsUpdate = true;

    // 矢印の位置を更新する
    const arrow1: any = target.getObjectByName("arrow1");
    arrow1.position.set(pos1.x + 0.5, pos1.y, 0);

    const arrow2: any = target.getObjectByName("arrow2");
    arrow2.position.set(pos2.x - 0.5, pos2.y, 0);

    // 文字を描く
    const oldText: any = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
    }
    const x = pos1.x + (pos2.x - pos1.x) / 2;
    const y = pos1.y + (pos2.y - pos1.y) / 2;
    const horizontal: string = 'center';
    const vartical: string = (pos1.y > pos0.y) ? 'bottom' : 'top';

    const text = this.text.createText(textStr, new THREE.Vector2(x, y), 0.1, horizontal, vartical);
    text.name = "text";

    target.add(text);
  }


}
