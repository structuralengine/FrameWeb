import { Injectable } from '@angular/core';
import * as THREE from "three";

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";

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
    /*
    const len = nodei.distanceTo(nodej);
    let LL: number = len;
    let y0 = 0;
    if (direction === "wgx") {
      LL = new THREE.Vector2(nodei.z, nodei.y).distanceTo(new THREE.Vector2(nodej.z, nodej.y));
      const xHeight = Math.abs(nodei.x - nodej.x);
      y0 = xHeight * LL / len;
    } else if (direction === "wgy") {
      LL = new THREE.Vector2(nodei.x, nodei.z).distanceTo(new THREE.Vector2(nodej.x, nodej.z));
      const yHeight = Math.abs(nodei.y - nodej.y);
      y0 = yHeight * LL / len;
    } else if (direction === "wgz") {
      LL = new THREE.Vector2(nodei.x, nodei.y).distanceTo(new THREE.Vector2(nodej.x, nodej.y));
      const zHeight = Math.abs(nodei.z - nodej.z);
      y0 = zHeight * LL / len;
    }
    const L1 = pL1 * len / LL;
    const L2 = pL2 * len / LL;

    const L: number = len - L1 - L2;
    let x1 = -L/2;
    let x3 = L/2;
    const y1 = P1 * scale + y0;
    const y3 = P2 * scale + y0;
    let y2 = (y1 + y3) / 2;
    if (Math.sign(P1) !== Math.sign(P2) ){
      const pp1 = Math.abs(P1);
      const pp2 = Math.abs(P2);
      x3 = L * pp2 / ( pp1 + pp2 )
      x1 = x3 - L;
      y2 = 0;
    }

    const points = [
      new THREE.Vector3(x1, y0, 0),
      new THREE.Vector3(x1, y1, 0),
      new THREE.Vector3( 0, y2, 0),
      new THREE.Vector3(x3, y3, 0),
      new THREE.Vector3(x3, y0, 0),
    ];
    */
    const points: THREE.Vector3[]  = this.getPoints( 
      nodei, nodej, direction, pL1, pL2, P1, P2, scale);

    // 面
    child.add(this.getFace(my_color, points));

    // 線
    child.add(this.getLine(my_color, points));

    // 矢印
    for(const arrow of this.getArrow(my_color, points)){
      child.add(arrow);
    }

    // 寸法線
    const dim = new THREE.Group();

    const dim1 = this.dim.clone();
    dim1.name = "Dimension1";

    const dim2 = this.dim.clone();
    dim2.name = "Dimension2";

    const dim3 = this.dim.clone();
    dim3.name = "Dimension3";

    const size: number = 0.1; // 文字サイズ
    const y1a = Math.abs(y1);
    const y3a = Math.abs(y3);
    const y4a = Math.max(y1a, y3a) + (size * 10);
    const a = (y1a>y3a) ? Math.sign(y1) : Math.sign(y3);
    const y4 = a * y4a;
    if(L1 === 0){
      dim1.visible = false;
    } else {
      dim1.visible = true;
      const x0 = x1 - L1;
      const p = [
        new THREE.Vector2(x0, 0),
        new THREE.Vector2(x0, y4),
        new THREE.Vector2(x1, y4),
        new THREE.Vector2(x1, y1),
      ];
      this.dim.change(dim1, p, L1.toFixed(3))
    }
    dim.add(dim1);

    dim2.visible = true;
    const p = [
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x1, y4),
      new THREE.Vector2(x3, y4),
      new THREE.Vector2(x3, y3),
    ];
    this.dim.change(dim2, p, L.toFixed(3))
    dim.add(dim2);

    if(L2 === 0){
      dim3.visible = false;
    } else {
      dim3.visible = true;
      const x4 = x3 + L2;
      const p = [
        new THREE.Vector2(x3, y3),
        new THREE.Vector2(x3, y4),
        new THREE.Vector2(x4, y4),
        new THREE.Vector2(x4, 0),
      ];
      this.dim.change(dim3, p, L2.toFixed(3))
    }
    dim.add(dim3);

    dim.name = "Dimension";
    child.add(dim);

    child.name = "child";


    // 全体
    child.position.y = offset;
    const group = new THREE.Group();
    group.add(child);
    group.name = "DistributeLoad";

    // 文字を追加する
    const pos = new THREE.Vector2(0, 0);
    if(P1 !== 0) {
      let text: THREE.Group;
      if (P1 > 0){
        text = this.text.create(P1.toFixed(2), pos, size, 'left', 'bottom');
        text.rotateZ(Math.PI/2);
        text.position.x = x1;
        text.position.y = y1;
      } else {
        text = this.text.create(P1.toFixed(2), pos, size, 'right', 'bottom');
        text.rotateZ(-Math.PI/2);
        text.position.x = x1;
        text.position.y = y1;
      }
      text.name = "text1";
      group.add(text);
    }

    if(P2 !== 0) {
      let text: THREE.Group;
      if (P2 > 0){
        text = this.text.create(P1.toFixed(2), pos, size, 'left', 'top');
        text.rotateZ(Math.PI/2);
        text.position.x = x3;
        text.position.y = y3;
      } else {
        text = this.text.create(P1.toFixed(2), pos, size, 'right', 'top');
        text.rotateZ(-Math.PI/2);
        text.position.x = x3;
        text.position.y = y3;
      }
      text.name = "text2";
      group.add(text);
    }


    // 全体の位置を修正する
    const lP1 = this.getPointInBetweenByLen(nodei, nodej, L1);
    const lP3 = this.getPointInBetweenByLen(nodei, nodej, L1 + L);
    const lP2 = new THREE.Vector3((lP1.x + lP3.x)/2,
                                  (lP1.y + lP3.y)/2,
                                  (lP1.z + lP3.z)/2);

    group.position.set(lP2.x, lP2.y, lP2.z);

    /*
    // 全体の向きを変更する


    const forward = new THREE.Vector3(localAxis.y.x, localAxis.y.y, localAxis.y.z);
    const viewTarget:THREE.Vector3 = lP2.add(forward);
    //target.up.set(1,0,0);
    target.lookAt(viewTarget);

    // 全体の向きを変更する
      //const v = new THREE.Vector3(nodej.x - nodei.x, nodej.y - nodei.y, nodej.z - nodei.z);
    //const la: THREE.Vector3 = localAxis.x;
    //const b = la.add(lP2);
      //target.lookAt(b);
        //target.rotation.z = Math.acos(v.x / len);
    //    target.rotation.y = Math.acos(v.x / len);

        //target.rotation.y = Math.acos(v.z / len);
        //target.rotation.y = 0.5 * Math.PI + Math.atan2(v.z, v.y);
    /*
        if (direction === "wy") {
          target.rotation.y = Math.acos(v.x / len);
        }else if (direction === "wz") {
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

  private getPoints(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    direction: string,
    pL1: number,
    pL2: number,
    P1: number,
    P2: number,
    scale: number,
  ): THREE.Vector3[] {
    
    const len = nodei.distanceTo(nodej);

    let LL: number = len;
    let y0 = 0;
    if (direction === "wgx") {
      LL = new THREE.Vector2(nodei.z, nodei.y).distanceTo(new THREE.Vector2(nodej.z, nodej.y));
      const xHeight = Math.abs(nodei.x - nodej.x);
      y0 = xHeight * LL / len;
    } else if (direction === "wgy") {
      LL = new THREE.Vector2(nodei.x, nodei.z).distanceTo(new THREE.Vector2(nodej.x, nodej.z));
      const yHeight = Math.abs(nodei.y - nodej.y);
      y0 = yHeight * LL / len;
    } else if (direction === "wgz") {
      LL = new THREE.Vector2(nodei.x, nodei.y).distanceTo(new THREE.Vector2(nodej.x, nodej.y));
      const zHeight = Math.abs(nodei.z - nodej.z);
      y0 = zHeight * LL / len;
    }
    const L1 = pL1 * len / LL;
    const L2 = pL2 * len / LL;

    const L: number = len - L1 - L2;
    let x1 = -L/2;
    let x3 = L/2;
    const y1 = P1 * scale + y0;
    const y3 = P2 * scale + y0;
    let y2 = (y1 + y3) / 2;
    if (Math.sign(P1) !== Math.sign(P2) ){
      const pp1 = Math.abs(P1);
      const pp2 = Math.abs(P2);
      x3 = L * pp2 / ( pp1 + pp2 )
      x1 = x3 - L;
      y2 = 0;
    }

    return [
      new THREE.Vector3(x1, y0, 0),
      new THREE.Vector3(x1, y1, 0),
      new THREE.Vector3( 0, y2, 0),
      new THREE.Vector3(x3, y3, 0),
      new THREE.Vector3(x3, y0, 0),
    ];
  }

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

}
