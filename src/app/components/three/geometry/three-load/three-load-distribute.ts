import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";
import { groupEnd } from 'console';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadDistribute {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
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
    P2: number,
    offset: number,
    scale: number,
  ): THREE.Group {

    // 線の色を決める
    let my_color = this.getColor(direction);

    const child = new THREE.Group();

    // 長さを決める
    const p  = this.getPoints( 
      nodei, nodej, direction, pL1, pL2, P1, P2, scale);

    const points: THREE.Vector3[] = p.points;
    const L1 = p.L1;
    const L  = p.L;
    const L2 = p.L2;

    // 面
    child.add(this.getFace(my_color, points));

    // 線
    child.add(this.getLine(my_color, points));

    // 矢印
    for(const arrow of this.getArrow(my_color, points)){
      child.add(arrow);
    }

    // 寸法線
    child.add(this.getDim(points, L1, L, L2));

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group = new THREE.Group();
    group.add(child);
    group.name = "DistributeLoad";

    // 文字を追加する
    for(const text of this.getText(points, P1, P2)){
      group.add(text);
    }

    // 全体の位置を修正する
    //group.up.set(1, 0, 0);
    var up = new THREE.Vector3(localAxis.z.x, localAxis.z.y, localAxis.z.z).normalize();
    group.rotation.set(localAxis.x.x, localAxis.x.y, localAxis.x.z);
    //group.position.set(nodei.x, nodei.y, nodei.z);

    /*
    //「上」方向のベクトルを生成。サンプルでは「空」方向。
    var up = new THREE.Vector3(0, 1, 0);
    //var up = new THREE.Vector3(localAxis.z.x, localAxis.z.y, localAxis.z.z).normalize();

    //法線ベクトルを取得。サンプルではinput要素から取得。
    //var normalAxis = new THREE.Vector3(0, 1, 0).normalize();
    var normalAxis = new THREE.Vector3(localAxis.x.x, localAxis.x.y, localAxis.x.z).normalize();

    //回転軸用のベクトルを生成
    var dir = new THREE.Vector3();

    //「上」方向と法線ベクトルとの外積を計算。正規化。
    dir.crossVectors(up, normalAxis).normalize();

    //上記ベクトルとの内積（cosθ）
    var dot = up.dot(normalAxis);// / (up.length() * normalAxis.length());

    //acos関数を使ってラジアンに変換。
    var rad = Math.acos(dot);

    //クォータニオンオブジェクトを生成
    var q = new THREE.Quaternion();

    //計算した回転軸と角度を元にクォータニオンをセットアップ
    q.setFromAxisAngle(dir, rad);

    //適用したいオブジェクトに回転を適用
    group.rotation.setFromQuaternion(q);
    */




    // 全体の向きを変更する
    //group.rotation.y = -Math.PI / 2;
    //group.lookAt(nodej);
    /*
    if (direction === "wy") {
      group.up.set(0,1,0);
      group.lookAt(nodej);
    } else if (direction === "wz") {
      group.up.set(0,1,0);
      group.lookAt(nodej);
    } else if (direction === "wgx") {

    } else if (direction === "wgy") {

    } else if (direction === "wgz") {

    }
    */


   group.name = "DistributeLoad";

   return group;
}

  // 2点A, B を結ぶ直線上のA点からの距離Length の点
  private getPointInBetweenByLen(pointA: THREE.Vector3, pointB: THREE.Vector3, length) {
    const dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);
  }

  private getColor(direction: string): number {
    let my_color = 0xff0000;
    if (direction === "wy" || direction === "wgy") {
      my_color = 0x00ff00;
    } else if (direction === "wz" || direction === "wgz") {
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
    scale: number,
  ): any {
    
    const len = nodei.distanceTo(nodej);

    let LL: number = len;

    // 絶対座標系荷重の距離変換を行う
    if (direction === "wgx") {
      LL = new THREE.Vector2(nodei.z, nodei.y).distanceTo(new THREE.Vector2(nodej.z, nodej.y));
    } else if (direction === "wgy") {
      LL = new THREE.Vector2(nodei.x, nodei.z).distanceTo(new THREE.Vector2(nodej.x, nodej.z));
    } else if (direction === "wgz") {
      LL = new THREE.Vector2(nodei.x, nodei.y).distanceTo(new THREE.Vector2(nodej.x, nodej.y));
    }
    const L1 = pL1 * len / LL;
    const L2 = pL2 * len / LL;
    const L: number = len - L1 - L2;

    // 荷重原点
    let y0 = 0; 
    // 絶対座標系における荷重原点
    if (direction === "wgx") {
      const xHeight = Math.abs(nodei.x - nodej.x);
      y0 = xHeight  * (L / len) * (LL / len);
    } else if (direction === "wgy") {
      const yHeight = Math.abs(nodei.y - nodej.y);
      y0 = yHeight  * (L / len) * (LL / len);
    } else if (direction === "wgz") {
      const zHeight = Math.abs(nodei.z - nodej.z);
      y0 = zHeight  * (L / len) * (LL / len);
    }

    // 荷重の各座標
    let x1 = L1;
    let x3 = L1 + L;
    let x2 = (x1 + x3) / 2;

    const y1 = P1 * scale + y0;
    const y3 = P2 * scale + y0;
    let y2 = (y1 + y3) / 2;
    if (Math.sign(P1) !== Math.sign(P2) ){
      const pp1 = Math.abs(P1);
      const pp2 = Math.abs(P2);
      x2 = L * pp1 / ( pp1 + pp2 )
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
      L2
  };
  }

  // 面
  private getFace(
    my_color: number , points: THREE.Vector3[]): THREE.Mesh {

    const face_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: my_color,
      opacity: 0.3,
    });

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

    const line_mat = new THREE.LineBasicMaterial({ color: my_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints([
      points[1],
      points[2],
      points[3],
    ]);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";

    return line;
  }

  // 両端の矢印
  private getArrow(
    my_color: number , points: THREE.Vector3[]): THREE.ArrowHelper[] {

      
      const dir = new THREE.Vector3(0, -1, 0); // 矢印の方向（単位ベクトル）
      const length = 1; // 長さ

      const child: THREE.ArrowHelper[] = new Array();

      const origin1 = new THREE.Vector3(0, 1, 0);
      const arrow1 = new THREE.ArrowHelper(dir, origin1, length, my_color);
      arrow1.position.x = points[0].x;
      const y1 = points[1].y;
      arrow1.position.y = y1;
      arrow1.scale.set(y1, y1, y1);
      arrow1.name = "arrow1";
      child.push(arrow1);

      const origin2 = new THREE.Vector3(1, 1, 0);
      const arrow2 = new THREE.ArrowHelper(dir, origin2, length, my_color);
      arrow2.position.x = points[3].x;
      const y3 = points[3].y;
      arrow2.position.y = y3;
      arrow2.scale.set(y3, y3, y3);
      arrow2.name = "arrow2";
      child.push(arrow2);

      return child;

  }

  // 寸法線
  private getDim(points: THREE.Vector3[],
                L1: number, L: number, L2: number): THREE.Group {

    const dim = new THREE.Group();

    let dim1: THREE.Group;
    let dim2: THREE.Group;
    let dim3: THREE.Group;

    const size: number = 0.1; // 文字サイズ

    const y1a = Math.abs(points[1].y);
    const y3a = Math.abs(points[3].y);
    const y4a = Math.max(y1a, y3a) + (size * 10);
    const a = (y1a > y3a) ? Math.sign(points[1].y) : Math.sign(points[3].y);
    const y4 = a * y4a;
    if(L1 === 0){
      dim1 = new THREE.Group();
      dim1.visible = false;
    } else {
      const x0 = points[1].x - L1;
      const p = [
        new THREE.Vector2(x0, 0),
        new THREE.Vector2(x0, y4),
        new THREE.Vector2(points[1].x, y4),
        new THREE.Vector2(points[1].x, points[1].y),
      ];
      dim1 = this.dim.create(p, L1.toFixed(3))
      dim1.visible = true;
    }
    dim.add(dim1);

    const p = [
      new THREE.Vector2(points[1].x, points[1].y),
      new THREE.Vector2(points[1].x, y4),
      new THREE.Vector2(points[3].x, y4),
      new THREE.Vector2(points[3].x, points[3].y),
    ];
    dim2 = this.dim.create(p, L.toFixed(3))
    dim2.visible = true;
    dim.add(dim2);

    if(L2 === 0){
      dim3 = new THREE.Group();
      dim3.visible = false;
    } else {
      const x4 = points[3].x + L2;
      const p = [
        new THREE.Vector2(points[3].x, points[3].y),
        new THREE.Vector2(points[3].x, y4),
        new THREE.Vector2(x4, y4),
        new THREE.Vector2(x4, 0),
      ];
      dim3 = this.dim.create(p, L2.toFixed(3))
      dim3.visible = true;
    }

    // 登録
    dim1.name = "Dimension1";
    dim2.name = "Dimension2";
    dim3.name = "Dimension3";
    dim.add(dim1);
    dim.add(dim2);
    dim.add(dim3);

    dim.name = "Dimension";

    return dim;
  }

  // 文字
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
      text.name = "text1";
      result.push(text);
    }

    if(P2 !== 0) {
      let text: THREE.Group;
      if (P2 > 0){
        text = this.text.create(P1.toFixed(2), pos, size, 'left', 'top');
        text.rotateZ(Math.PI/2);
        text.position.x = points[3].x;
        text.position.y = points[3].y;
      } else {
        text = this.text.create(P1.toFixed(2), pos, size, 'right', 'top');
        text.rotateZ(-Math.PI/2);
        text.position.x = points[3].x;
        text.position.y = points[3].y;
      }
      text.name = "text2";
      result.push(text);
    }

    return result;
  }


}
