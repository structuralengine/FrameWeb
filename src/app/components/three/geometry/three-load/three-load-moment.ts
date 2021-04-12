import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadMoment {

  private text: ThreeLoadText;
  private arrow_mat_Red: THREE.MeshBasicMaterial;
  private arrow_mat_Green: THREE.MeshBasicMaterial;
  private arrow_mat_Blue: THREE.MeshBasicMaterial;
  
  private line_mat_Red: THREE.LineBasicMaterial;
  private line_mat_Green: THREE.LineBasicMaterial;
  private line_mat_Blue: THREE.LineBasicMaterial;

  private point_mat: THREE.PointsMaterial;

  constructor(text: ThreeLoadText) {
    this.text = text;
    this.arrow_mat_Red = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.arrow_mat_Green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.arrow_mat_Blue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.line_mat_Red = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line_mat_Green = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    this.line_mat_Blue = new THREE.LineBasicMaterial({ color: 0x0000ff });
    this.point_mat = new THREE.PointsMaterial({ size: 0.1, color: 0x080808 });

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
    direction: string,
    row: number,
    color: number = null
  ): THREE.Group {

    //線の色を決める
    let line_color = color;
    let arrow_mat: THREE.MeshBasicMaterial;
    let line_mat: THREE.LineBasicMaterial;

    if (color === null) {
      line_color = 0xff0000;
      arrow_mat = this.arrow_mat_Red;
      line_mat = this.line_mat_Red;
      if (direction === "ry") {
        line_color = 0x00ff00;
        arrow_mat = this.arrow_mat_Green;
        line_mat = this.line_mat_Green;
      } else if (direction === "rz") {
        line_color = 0x0000ff;
        arrow_mat = this.arrow_mat_Blue;
        line_mat = this.line_mat_Blue;
      }
    }

    const child = new THREE.Group();
    child.name = "child";

    // 色を変更する
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    //const arrow_mat = new THREE.MeshBasicMaterial({ color: line_color });
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
    //const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const ellipse = new THREE.Line(line_geo, line_mat);
    ellipse.name = "line";
    child.add(ellipse);

    // 長さを修正する
    //if (value < 0) {
      //child.rotation.set(-Math.PI, 0, -Math.PI);
    //}

    if (direction === 'rx' || direction === 'ry') {
      if (value > 0) {
        child.rotation.set(0, 0, 0);
      } else if (value < 0) {
        child.rotation.set(-Math.PI, 0, -Math.PI);
      }
    } else if (direction === 'rz') { //zのみ挙動が異なるため追加
      if (value > 0) {
        child.rotation.set(-Math.PI, 0, -Math.PI);
      } else if (value < 0) {
        child.rotation.set(0, 0, 0);
      }
    }
    child.scale.set(radius, radius, radius);

    const group0 = new THREE.Group();

    /*/ 文字を追加する
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
    text.visible = false;
    group0.add(text);
    */
    
    child.position.z = offset;

    // 向きを変更する
    if (direction === "rx") {
      group0.rotation.x = Math.PI / 2;
      group0.rotation.y = -Math.PI / 2;
    } else  if (direction === "ry") {
      group0.rotation.x = Math.PI / 2;
    }

    //中心点を作成
    const point_geo = new THREE.Geometry();
    point_geo.vertices.push(new THREE.Vector3(0,0,0));
    // const point_mat = new THREE.PointsMaterial({size: 0.1, color: 0x080808});
    const point_mesh = new THREE.Points(point_geo, this.point_mat);
    point_mesh.name = 'points_center';
    point_mesh.visible = false;
    group0.add(point_mesh);

    group0.add(child);
    group0.name = "group";

    const group = new THREE.Group();
    group.add(group0);

    // 位置を修正する
    group.position.set(node.x, node.y, node.z);

    group.name = "MomentLoad" + row.toString() + direction.toString();
    group['value'] = Math.abs(value); //値を保存

    return group;
  }

  // 大きさを反映する
  public setSize(group: any, scale: number): void {
    for (const item of group.children) {
      item.scale.set(scale, scale, scale);
    }
  }
  // オフセットを反映する
  public setOffset(group: THREE.Group, offset: number): void {
    for (const item of group.children) {
      item.position.z = offset;
    }
  }

  // スケールを反映する
  public setScale(group: any, scale: number): void {
    group.scale.set(scale, scale, scale);
  }


}
