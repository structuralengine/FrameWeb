import { Inject, Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2 } from 'three';
import { ThreeLoadText } from '../three-load/three-load-text';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceMeshService {

  private font: THREE.Font;
  private text: ThreeLoadText;
  private dimension: number

  private face_mat: THREE.MeshBasicMaterial;
  private line_mat: THREE.LineBasicMaterial;

  constructor(font: THREE.Font, @Inject(Number) dim: number) {
    this.dimension = dim;
    this.text = new ThreeLoadText(font);
    this.font = font;

    this.face_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x0000ff,
      opacity: 0.1,
    });

    this.line_mat = new THREE.LineBasicMaterial({ color: 0x0000ff });

  }

  /// 断面力を編集する
  // target: 編集対象の荷重,
  // nodei: 部材始点,
  // nodej: 部材終点,
  // localAxis: 部材座標系
  // direction: 荷重の向き(wy, wz)
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

    const child = new THREE.Group();

    // 長さを決める
    const p  = this.getPoints(
      nodei, nodej, direction, pL1, pL2, P1, P2);

    const points: THREE.Vector3[] = p.points;

    // 面
    child.add(this.getFace(points));

    // 線
    child.add(this.getLine(points));

    // 全体
    child.name = "child";

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    // 文字を追加する
    for(const text of this.getText(points, P1, P2)){
      text.visible = true;
      group0.add(text);
    }
    

     // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = p.Pmax; // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    /* change() 関数で向きを修正するからここでは、必要ない */

    group.name = "SectionForce";

    return group;
  }


  // 座標
  private getPoints(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    direction: string,
    pL1: number,
    pL2: number,
    P1: number,
    P2: number
  ): any {

    const len = nodei.distanceTo(nodej);

    let LL: number = len;
    const L1 = pL1 * len / LL;
    const L2 = pL2 * len / LL;
    const L: number = len - L1 - L2;

     // 荷重の各座標
    let x1 = L1;
    let x3 = L1 + L;
    let x2 = (x1 + x3) / 2;

    // y座標 値の大きい方が１となる
    const Pmax = (Math.abs(P1) > Math.abs(P2)) ? P1 : P2;

    const y1 = P1;
    const y3 = P2;
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
        new THREE.Vector3(x1, 0, 0),
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
        new THREE.Vector3(x3, y3, 0),
        new THREE.Vector3(x3, 0, 0),
      ],
      L1,
      L,
      L2,
      Pmax
    };
  }

  // 面
  private getFace(points: THREE.Vector3[]): THREE.Mesh {

    const face_geo = new THREE.Geometry();
    face_geo.vertices = points;

    face_geo.faces.push(new THREE.Face3(0, 1, 2));
    face_geo.faces.push(new THREE.Face3(2, 3, 4));
    face_geo.faces.push(new THREE.Face3(0, 2, 4));

    const mesh = new THREE.Mesh(face_geo, this.face_mat);
    mesh.name = "face";
    return mesh;

  }

  // 枠線
  private getLine(points: THREE.Vector3[]): THREE.Line {

    const line_geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(line_geo, this.line_mat);
    line.name = "line";

    return line;
  }

  // 文字
  private getText(points: THREE.Vector3[], P1: number, P2: number): THREE.Group[] {

    const result = [];

    // if(this.dimension===3) {
      return result;
    // }

    const size: number = 100; // 文字サイズ

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



  // 大きさを反映する
  public setScale(target: any, scale: number): void {

    target.scale.set(1, scale, scale);

    const group: THREE.Group = target.getObjectByName("group");

    const text = group.getObjectByName("text");
    if(text !== undefined){
      text.scale.set(1, scale, 1);
    }

  }

  public change(
    target: any,
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    localAxis: any,
    direction: string,
    pL1: number,
    pL2: number,
    P1: number,
    P2: number
  ): THREE.Group {

    // 長さを決める
    const p  = this.getPoints(
      nodei, nodej, direction, pL1, pL2, P1, P2);
    const points: THREE.Vector3[] = p.points;

    const group: THREE.Group = target.getObjectByName("group");

    let text = group.getObjectByName("text");
    while(text !== undefined){
      group.remove(text);
      text = group.getObjectByName("text");
    }

    const child = group.getObjectByName("child");

    // 面
    const mesh = child.getObjectByName("face");
    const geo: THREE.Geometry = mesh["geometry"];
    for(let i= 0; i < geo.vertices.length; i++){
      geo.vertices[i].x = points[i].x;
      geo.vertices[i].y = points[i].y;
      geo.vertices[i].z = points[i].z;
    }
    geo.verticesNeedUpdate = true;

     // 線
    const line: any = child.getObjectByName("line");
    const positions = line.geometry.attributes.position.array;
    let index = 0;
    for(const pos of points) {
        positions[ index ++ ] = pos.x;
        positions[ index ++ ] = pos.y;
        positions[ index ++ ] = pos.z;
    }
    line.geometry.attributes.position.needsUpdate = true;

    target.position.set(nodei.x, nodei.y, nodei.z);

    // 文字を追加する
    for(const text of this.getText(points, P1, P2)){
      text.visible = true;
      group.add(text);
    }
    

    // 全体の向きを修正する
    target.rotation.set(0, 0, 0); 

    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    let A = Math.asin(XY.y) 

    if( XY.x < 0){
      A = Math.PI - A;
    }
    target.rotateZ(A);

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    target.rotateY(-Math.asin(XZ.y));

    if (localAxis.x.x === 0 && localAxis.x.y === 0) {
      // 鉛直の部材
      if (direction === "z") {
        target.rotateX(Math.PI);
      } else if (direction === "y") {
        target.rotateX(Math.PI / 2);
      }
    } else {
      if (direction === "z") {
        target.rotateX(-Math.PI / 2);
      } else if (direction === "y") {
        target.rotateX(Math.PI);
      }
    }

    return target;
  }

}
