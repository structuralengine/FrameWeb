import { Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2, Vector3 } from 'three';

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from './three-load-dimension';
import { ThreeLoadMoment } from './three-load-moment';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadTorsion {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;
  private moment: ThreeLoadMoment;

  constructor(
    text: ThreeLoadText,
    dim: ThreeLoadDimension,
    moment: ThreeLoadMoment) {
    this.text = text;
    this.dim = dim;
    this.moment = moment;
  }

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

    const radius: number = 0.5;

    // 線の色を決める
    const my_color = this.getColor([P1, P2]);

    const child = new THREE.Group();

    // 長さを決める
    const p = this.getPoints(
      nodei, nodej, direction, pL1, pL2, P1, P2, radius);

    const points: THREE.Vector3[] = p.points;
    const L1 = p.L1;
    const L = p.L;
    const L2 = p.L2;

    // 面
    for (const mesh of this.getFace(my_color, points)){
      child.add(mesh);
    }

    // 線
    for (const arrow of this.getArrow([P1, P2], my_color, [points[0], points[2]])) {
      child.add(arrow);
    }

    // 寸法線
    const dim = this.getDim(points, L1, L, L2);
    dim.visible = false;
    child.add(dim);

    // 全体
    child.name = "child";

    const group = new THREE.Group();
    group.add(child);
    group.name = "TorsionLoad";

    // 全体の位置を修正する
    group['value'] = p.Pmax; // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
    group.rotateZ(Math.asin(XY.y));

    const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
    const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
    group.rotateY(-Math.asin(XZ.y));

    group.name = "TorsionLoad";

    return group;
  }
  
  private getColor(target: number[]): number[] {
    const my_color = [];
    target.forEach(value => {
      my_color.push(
        (Math.sign(value) > 0 ? 0xff0000
       : Math.sign(value) < 0 ? 0x0000ff
       : 0x000000 )
      );
    })
    if (my_color[0] === 0x000000 || my_color[1] === 0x000000) {
      if (my_color[0] === 0x000000){
        my_color[0] = my_color[1];
      } else if (my_color[1] === 0x000000) {
        my_color[1] = my_color[0];
      }
    }
    return my_color;
  }

  // 座標
  private getPoints(
    nodei: THREE.Vector3,
    nodej: THREE.Vector3,
    direction: string,
    L1: number,
    L2: number,
    P1: number,
    P2: number,
    radius: number,
  ): any {

    const LL = nodei.distanceTo(nodej);

    const L: number = LL - L1 - L2;

    // 荷重の各座標
    let x1 = L1;
    let x3 = L1 + L;
    let x2 = (x1 + x3) / 2;

    // y座標 値の大きい方がradiusとなる
    const Pmax = (Math.abs(P1) > Math.abs(P2)) ? P1: P2;
    let bigP = Math.abs(Pmax);
    const y1 = (P1 / bigP) * radius;
    const y3 = (P2 / bigP) * radius;
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
      points: [
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
        new THREE.Vector3(x3, y3, 0),
      ],
      L1,
      L,
      L2,
      Pmax
    };
  }

  // 面
  private getFace(
    my_color: number[], points: THREE.Vector3[]): THREE.Mesh[] {

    const result: THREE.Mesh[] = new Array();;

    for (let i = 0; i < my_color.length; i++) {

      const cylinder_mat = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        color: my_color[i],
        opacity: 0.3,
      });

      const height = points[i + 1].x - points[i].x;
      const cylinder_geo = new THREE.CylinderBufferGeometry(
        Math.abs(points[i].y), Math.abs(points[i + 1].y), height, // radiusTop, radiusBottom, height
        12, 1, true, // radialSegments, heightSegments, openEnded
        -Math.PI / 2, Math.PI * 1.5 // thetaStart, thetaLength
      );
      const mesh = new THREE.Mesh(cylinder_geo, cylinder_mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.x = (height / 2) + points[i].x;
      mesh.name = "mesh" + (i + 1).toString();

      result.push(mesh);
    }

    return result;

  }

  // 矢印
  private getArrow( values: number[],
    my_color: number[], points: THREE.Vector3[]): THREE.Group[] {

    const result: THREE.Group[] = new Array();;

    for (let i = 0; i < values.length; i++) {

      const arrow: THREE.Group = this.moment.create(
        new THREE.Vector3(points[i].x, 0, 0),
        0,
        values[i],
        Math.abs(points[i].y),
        "rx",
        my_color[i]
      );

      if (values[i] < 0) {
        arrow.rotation.set(-Math.PI / 2, 0, 0);
      }

      result.push(arrow);

    }
    return result;
  }

  // 寸法線
  private getDim(points: THREE.Vector3[],
    L1: number, L: number, L2: number): THREE.Group {

    const dim = new THREE.Group();

    let dim1: THREE.Group;
    let dim2: THREE.Group;
    let dim3: THREE.Group;

    const size: number = 0.1; // 文字サイズ

    const y1a = Math.abs(points[0].y);
    const y3a = Math.abs(points[2].y);
    const y4a = Math.max(y1a, y3a) + (size * 10);
    const a = (y1a > y3a) ? Math.sign(points[0].y) : Math.sign(points[2].y);
    const y4 = a * y4a;

    if (L1 > 0) {
      const x0 = points[0].x - L1;
      const p = [
        new THREE.Vector2(x0, 0),
        new THREE.Vector2(x0, y4),
        new THREE.Vector2(points[0].x, y4),
        new THREE.Vector2(points[0].x, points[0].y),
      ];
      dim1 = this.dim.create(p, L1.toFixed(3))
      dim1.visible = true;
      dim1.name = "Dimension1";
      dim.add(dim1);
    }

    const p = [
      new THREE.Vector2(points[0].x, points[0].y),
      new THREE.Vector2(points[0].x, y4),
      new THREE.Vector2(points[2].x, y4),
      new THREE.Vector2(points[2].x, points[2].y),
    ];
    dim2 = this.dim.create(p, L.toFixed(3))
    dim2.visible = true;
    dim2.name = "Dimension2";
    dim.add(dim2);

    if (L2 > 0) {
      const x4 = points[2].x + L2;
      const p = [
        new THREE.Vector2(points[2].x, points[2].y),
        new THREE.Vector2(points[2].x, y4),
        new THREE.Vector2(x4, y4),
        new THREE.Vector2(x4, 0),
      ];
      dim3 = this.dim.create(p, L2.toFixed(3))
      dim3.visible = true;
      dim3.name = "Dimension3";
      dim.add(dim3);
    }

    // 登録
    dim.name = "Dimension";

    return dim;
  }
  
  // 大きさを反映する
  public setSize(group: any, scale: number): void {
    for (const item of group.children) {
      item.scale.set(1, scale, scale);
    }
  }

  // 大きさを反映する
  public setScale(group: any, scale: number): void {
    group.scale.set(1, scale, scale);
  }

}
