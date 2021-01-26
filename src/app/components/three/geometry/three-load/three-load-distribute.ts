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

  private mesh: THREE.Mesh;
  private line: THREE.Line;
  private arrow1: THREE.ArrowHelper;
  private arrow2: THREE.ArrowHelper;
  private dim1: THREE.Group;
  private dim2: THREE.Group;
  private dim3: THREE.Group;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
    this.create();
  }

  public clone(): THREE.Group {

    const child = new THREE.Group();

    const mesh = this.mesh.clone();
    const mesh_mat: any = this.mesh.material;
    mesh.material = mesh_mat.clone();
    child.add(mesh);

    const line_mat: any = this.line.material;
    const line_geo: any = this.line.geometry;
    const line = new THREE.Line(line_geo.clone(), line_mat.clone());
    line.name = "line";
    child.add(line);

    for (const target of [this.arrow1, this.arrow2]) {
      const arrow = target.clone();
      const line_mat: any = target.line.material;
      const cone_mat: any = target.cone.material;
      arrow.line.material = line_mat.clone();
      arrow.cone.material = cone_mat.clone();
      child.add(arrow);
    }

    const dim = new THREE.Group();

    for (const target of [this.dim1, this.dim2, this.dim3]) {
      dim.add(target.clone());
    }
    dim.name = "Dimension";
    child.add(dim);

    child.name = "child";

    const group = new THREE.Group();
    group.add(child);
    group.name = "DistributeLoad";

    return group;
  }

  // 等分布荷重の雛形をX-Y平面上に生成する
  private create(): void {

    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0.5, 1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, 0, 0),
    ];

    const line_color = 0x0000ff;
    const face_color = 0x00cc00;

    // 面を作成する
    const face_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: face_color,
      opacity: 0.3,
    });
    const face_geo = new THREE.Geometry();
    face_geo.vertices = points;
    face_geo.faces.push(new THREE.Face3(0, 1, 2));
    face_geo.faces.push(new THREE.Face3(2, 3, 4));
    face_geo.faces.push(new THREE.Face3(0, 2, 4));
    this.mesh = new THREE.Mesh(face_geo, face_mat);
    this.mesh.name = "face";

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints([
      points[1],
      points[2],
      points[3],
    ]);
    this.line = new THREE.Line(line_geo, line_mat);
    this.line.name = "line";

    // 矢印を描く
    const dir = new THREE.Vector3(0, -1, 0); // 矢印の方向（単位ベクトル）
    const length = 1; // 長さ

    const origin1 = new THREE.Vector3(0, 1, 0);
    this.arrow1 = new THREE.ArrowHelper(dir, origin1, length, line_color);
    this.arrow1.name = "arrow1";

    const origin2 = new THREE.Vector3(1, 1, 0);
    this.arrow2 = new THREE.ArrowHelper(dir, origin2, length, line_color);
    this.arrow2.name = "arrow2";

    // 寸法線を描く
    this.dim1 = this.dim.clone();
    this.dim1.name = "Dimension1";

    this.dim2 = this.dim.clone();
    this.dim2.name = "Dimension2";

    this.dim3 = this.dim.clone();
    this.dim3.name = "Dimension3";

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
  public change(
    target: THREE.Group,
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
  ): void {

    const child: any = target.getObjectByName("child");
    const mesh: any = child.getObjectByName("face");
    const line: any = child.getObjectByName("line");
    const arrow1: any = child.getObjectByName("arrow1");
    const arrow2: any = child.getObjectByName("arrow2");
    const dim: any = child.getObjectByName("Dimension");
    const dim1: any = dim.getObjectByName("Dimension1");
    const dim2: any = dim.getObjectByName("Dimension2");
    const dim3: any = dim.getObjectByName("Dimension3");

    // 線の色を決める
    let my_color = 0xff0000;
    if (direction === "wy" || direction === "wgy") {
      my_color = 0x00ff00;
    } else if (direction === "wz" || direction === "wgz") {
      my_color = 0x0000ff;
    }

    // 線の色を変更する
    mesh.material.color.set(my_color);
    line.material.color.set(my_color);
    arrow1.line.material.color.set(my_color);
    arrow1.cone.material.color.set(my_color);
    arrow2.line.material.color.set(my_color);
    arrow2.cone.material.color.set(my_color);

    // 長さを決める
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

    // 長さを変更する
    // 面
    const face_geo = mesh.geometry;
    face_geo.vertices = points;
    // 線
    const positions = line.geometry.attributes.position.array;
    let index = 0;
    for (let i = 1; i <= 3; i++) {
      positions[ index ++ ] = points[i].x;
      positions[ index ++ ] = points[i].y;
      positions[ index ++ ] = points[i].z;
    }
    // 矢印
    arrow1.position.x = x1;
    arrow1.position.y = y1;
    arrow1.scale.set(y1, y1, y1);
    arrow2.position.x = x3;
    arrow2.position.y = y3;
    arrow2.scale.set(y3, y3, y3);

    // 寸法線
    const y4 = Math.max(y1, y3) * 2;
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

    dim2.visible = true;
    const p = [
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x1, y4),
      new THREE.Vector2(x3, y4),
      new THREE.Vector2(x3, y3),
    ];
    this.dim.change(dim2, p, L.toFixed(3))

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

    // 全体
    child.position.y = offset;

    // 文字を追加する
    const oldText1 = target.getObjectByName("text1");
    if (oldText1 !== undefined) {
      target.remove(oldText1);
    }
    const oldText2 = target.getObjectByName("text2");
    if (oldText2 !== undefined) {
      target.remove(oldText2);
    }

    const size: number = 0.1;
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
      target.add(text);
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
      target.add(text);
    }



    // 全体の位置を修正する
    const lP1 = this.getPointInBetweenByLen(nodei, nodej, L1);
    const lP3 = this.getPointInBetweenByLen(nodei, nodej, L1 + L);
    const lP2 = new THREE.Vector3((lP1.x + lP3.x)/2, 
                                  (lP1.y + lP3.y)/2,
                                  (lP1.z + lP3.z)/2);
    target.position.set(lP2.x, lP2.y, lP2.z);

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
    
}

  // 2点A, B を結ぶ直線上のA点からの距離Length の点
  private getPointInBetweenByLen(pointA: THREE.Vector3, pointB: THREE.Vector3, length) {
    const dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);
  }

}
