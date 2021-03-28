import { Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2 } from 'three';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceMeshService {

  private font: THREE.Font;

  private face_mat_Red: THREE.MeshBasicMaterial;
  private face_mat_Green: THREE.MeshBasicMaterial;
  private face_mat_Blue: THREE.MeshBasicMaterial;

  private line_mat_Red: THREE.LineBasicMaterial;
  private line_mat_Green: THREE.LineBasicMaterial;
  private line_mat_Blue: THREE.LineBasicMaterial;


  constructor(font: THREE.Font) {
    this.font = font;

    this.face_mat_Red =  new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0xff0000,
      opacity: 0.3,
    });
    this.face_mat_Green = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00ff00,
      opacity: 0.3,
    });
    this.face_mat_Blue = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x0000ff,
      opacity: 0.3,
    });

    this.line_mat_Red = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line_mat_Green = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    this.line_mat_Blue = new THREE.LineBasicMaterial({ color: 0x0000ff });

  }

  /// 等分布荷重を編集する
  // target: 編集対象の荷重,
  // nodei: 部材始点,
  // nodej: 部材終点,
  // localAxis: 部材座標系
  // direction: 荷重の向き(wy, wz, wgx, wgy, wgz)
  // L1: 始点からの距離
  // L2: 終点からの距離
  // P1: 始点側の荷重値
  // P2: 終点側の荷重値
  // offset: 配置位置（その他の荷重とぶつからない位置）
  // scale: スケール
  public create(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    localAxis: any,
    direction: string,
    pL1: number,
    pL2: number,
    P1: number,
    P2: number
  ): THREE.Group {

    const offset: number = 0;
    const height: number = 1;

    // 線の色を決める
    const my_color = this.getColor(direction);

    const child = new THREE.Group();

    // 長さを決める
    const p  = this.getPoints(
      nodei, nodej, direction, pL1, pL2, P1, P2, height);

    const points: THREE.Vector3[] = p.points;
    const L1 = p.L1;
    const L  = p.L;
    const L2 = p.L2;

    // 面
    child.add(this.getFace(my_color, points));

    // 線
    child.add(this.getLine(my_color, points));

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    /*/ 文字を追加する
    for(const text of this.getText(points, P1, P2)){
      text.visible = false;
      group0.add(text);
    }
    */
    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = p.Pmax; // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する

    if (direction.indexOf('g') < 0){
      const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
      group.rotateZ(Math.asin(XY.y));

      const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
      const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
      group.rotateY(-Math.asin(XZ.y));


      if (direction === "z") {
        group.rotateX(-Math.PI / 2);
      } else if (direction === "y") {
        group.rotateX(Math.PI);
      }

    } else if (direction === "gx") {
      group.rotation.z = Math.asin(-Math.PI/2);

    } else if (direction === "gz") {
      group.rotation.x = Math.asin(-Math.PI/2);

    }

    group.name = "DistributeLoad";

    return group;
  }

  private getColor(direction: string): number {
    let my_color = 0xff0000;
    if (direction === "y" || direction === "gy") {
      my_color = 0x00ff00;
    } else if (direction === "z" || direction === "gz") {
      my_color = 0x0000ff;
    }
    return my_color;
  }

  // 座標
  private getPoints(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    direction: string,
    pL1: number,
    pL2: number,
    P1: number,
    P2: number,
    height: number,
  ): any {

    const len = nodei.distanceTo(nodej);

    let LL: number = len;

    // 絶対座標系荷重の距離変換を行う
    if (direction === "gx") {
      LL = new THREE.Vector2(nodei.z, nodei.y).distanceTo(new THREE.Vector2(nodej.z, nodej.y));
    } else if (direction === "gy") {
      LL = new THREE.Vector2(nodei.x, nodei.z).distanceTo(new THREE.Vector2(nodej.x, nodej.z));
    } else if (direction === "gz") {
      LL = new THREE.Vector2(nodei.x, nodei.y).distanceTo(new THREE.Vector2(nodej.x, nodej.y));
    }
    const L1 = pL1 * len / LL;
    const L2 = pL2 * len / LL;
    const L: number = len - L1 - L2;

    // 荷重原点
    let y0 = 0;
    // 絶対座標系における荷重原点
    if (direction === "gx") {
      const xHeight = Math.abs(nodei.x - nodej.x);
      y0 = xHeight  * (L / len) * (LL / len);
    } else if (direction === "gy") {
      const yHeight = Math.abs(nodei.y - nodej.y);
      y0 = yHeight  * (L / len) * (LL / len);
    } else if (direction === "gz") {
      const zHeight = Math.abs(nodei.z - nodej.z);
      y0 = zHeight  * (L / len) * (LL / len);
    }

    // 荷重の各座標
    let x1 = L1;
    let x3 = L1 + L;
    let x2 = (x1 + x3) / 2;

    // y座標 値の大きい方が１となる
    const Pmax = (Math.abs(P1) > Math.abs(P2)) ? P1 : P2;

    let bigP = Math.abs(Pmax);
    const y1 = (P1 / bigP) * height + y0;
    const y3 = (P2 / bigP) * height + y0;
    let y2 = (y1 + y3) / 2;

    const sg1 = Math.sign(P1);
    const sg2 = Math.sign(P2);
    if (sg1 !== sg2 && sg1 * sg2 !== 0) {
      const pp1 = Math.abs(P1);
      const pp2 = Math.abs(P2);
      x2 = L * pp1 / (pp1 + pp2) + x1;
      y2 = 0;
    }

    return {
      points:[
        new THREE.Vector3(x1, y0, 0),
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
        new THREE.Vector3(x3, y3, 0),
        new THREE.Vector3(x3, y0, 0),
      ],
      L1,
      L,
      L2,
      Pmax
    };
  }

  // 面
  private getFace(
    my_color: number , points: THREE.Vector3[]): THREE.Mesh {

    let face_mat: THREE.MeshBasicMaterial;
    if (my_color === 0xff0000){
      face_mat = this.face_mat_Red;
    } else if (my_color === 0x00ff00) {
      face_mat = this.face_mat_Green;
    } else {
      face_mat = this.face_mat_Blue;
    }

    const face_geo = new THREE.Geometry();
    face_geo.vertices = points;

    face_geo.faces.push(new THREE.Face3(0, 1, 2));
    face_geo.faces.push(new THREE.Face3(2, 3, 4));
    face_geo.faces.push(new THREE.Face3(0, 2, 4));

    const mesh = new THREE.Mesh(face_geo, face_mat);
    mesh.name = "face";
    return mesh;

  }

  // 枠線
  private getLine(
    my_color: number , points: THREE.Vector3[]): THREE.Line {

    let line_mat: THREE.LineBasicMaterial;
    if (my_color === 0xff0000) {
      line_mat = this.line_mat_Red;
    } else if (my_color === 0x00ff00) {
      line_mat = this.line_mat_Green;
    } else {
      line_mat = this.line_mat_Blue;
    }

    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";

    return line;
  }

  /*/ 文字
  private getText(points: THREE.Vector3[], P1: number, P2: number): THREE.Group[] {

    const result = [];

    const size: number = 0.1; // 文字サイズ

    const pos = new THREE.Vector2(0, 0);
    if(P1 !== 0) {
      let text: THREE.Group;
      if (P1 > 0){
        text = this.text.create(P1.toFixed(2), pos, size, 'left', 'bottom');
        text.rotateZ(Math.PI/2);
        text.position.x = points[1].x;
        text.position.y = points[1].y;
      } else {
        text = this.text.create(P1.toFixed(2), pos, size, 'right', 'bottom');
        text.rotateZ(-Math.PI/2);
        text.position.x = points[1].x;
        text.position.y = points[1].y;
      }
      text.name = "text";
      result.push(text);
    }

    if(P2 !== 0) {
      let text: THREE.Group;
      if (P2 > 0){
        text = this.text.create(P2.toFixed(2), pos, size, 'left', 'top');
        text.rotateZ(Math.PI/2);
        text.position.x = points[3].x;
        text.position.y = points[3].y;
      } else {
        text = this.text.create(P2.toFixed(2), pos, size, 'right', 'top');
        text.rotateZ(-Math.PI/2);
        text.position.x = points[3].x;
        text.position.y = points[3].y;
      }
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

  // オフセットを反映する
  public setOffset(group: THREE.Group, offset: number): void {
    for (const item of group.children) {
      item.position.y = offset;
    }
  }

  public setGlobalOffset(group: THREE.Group, offset: number, key: string): void {
    const k = key.replace('wg', '');
    for (const item of group.children) {
      item.position[k] = offset;
    }
  }

  // 大きさを反映する
  public setScale(group: any, scale: number): void {
    group.scale.set(1, scale, scale);
  }


}
