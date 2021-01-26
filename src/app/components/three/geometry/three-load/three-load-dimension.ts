import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadDimension {

  private text: ThreeLoadText;

  private line: THREE.Line;
  private arrow1: THREE.ArrowHelper;
  private arrow2: THREE.ArrowHelper;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.create();
  }

  public clone(): THREE.Group {
    const group = new THREE.Group();

    const line_mat: any = this.line.material;
    const line_geo: any = this.line.geometry;
    const line = new THREE.Line(line_geo.clone(), line_mat.clone());
    line.name = "line";

    group.add(line);
    group.add(this.arrow1.clone());
    group.add(this.arrow2.clone());

    return group;
  }

  // 寸法線を作成する
  private create(): void {

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
    this.line = new THREE.Line(line_geo, line_mat);
    this.line.name = "line";

    // 矢印を描く
    const length = 0.5; // 長さ
    const origin = new THREE.Vector3(length, 1, 0);

    const dir1 = new THREE.Vector3(-1, 0, 0); // 矢印の方向（単位ベクトル）
    this.arrow1 = new THREE.ArrowHelper(dir1, origin, length, line_color);
    this.arrow1.name = "arrow1";

    const dir2 = new THREE.Vector3(1, 0, 0); // 矢印の方向（単位ベクトル）
    this.arrow2 = new THREE.ArrowHelper(dir2, origin, length, line_color);
    this.arrow2.name = "arrow2";
  }


  // 寸法線を編集する
  public change(
    target: THREE.Group,
    points: THREE.Vector2[],
    textStr: string
  ): void {

    // 線の位置を更新する
    const line: any = target.getObjectByName("line");
    const positions = line.geometry.attributes.position.array;
    let index = 0;
    for (let i = 0; i < points.length; i++) {
      positions[ index ++ ] = points[i].x;
      positions[ index ++ ] = points[i].y;
      positions[ index ++ ] = 0;
    }

    line.geometry.attributes.position.needsUpdate = true; // required after the first render

    // 矢印の位置を更新する
    const arrow1: any = target.getObjectByName("arrow1");
    arrow1.position.set(points[1].x + 0.5, points[1].y, 0);

    const arrow2: any = target.getObjectByName("arrow2");
    arrow2.position.set(points[2].x - 0.5, points[2].y, 0);

    // 文字を描く
    const oldText: any = target.getObjectByName("text");
    if (oldText !== undefined) {
      target.remove(oldText);
    }
    const x = points[1].x + (points[2].x - points[1].x) / 2;
    const y = points[1].y + (points[2].y - points[1].y) / 2;
    const horizontal: string = 'center';
    let vartical: string = 'bottom';
    if(points[1].y >= 0 ){
      if( points[1].y < points[0].y) vartical = 'top';
    } else {
      if( points[1].y > points[0].y) vartical = 'top';
    }

    const text = this.text.create(textStr, new THREE.Vector2(x, y), 0.1, horizontal, vartical);
    text.name = "text";

    target.add(text);
  }


}
