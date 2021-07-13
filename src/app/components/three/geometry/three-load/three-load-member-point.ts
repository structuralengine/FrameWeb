import { Injectable } from '@angular/core';
import * as THREE from "three";
import { Vector2 } from 'three';

import { ThreeLoadText } from "./three-load-text";
import { ThreeLoadDimension } from "./three-load-dimension";
import { ThreeLoadPoint } from './three-load-point';
import { RouterLinkWithHref } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadMemberPoint {


  private point: ThreeLoadPoint;
  
  private arrow_mat_Red: THREE.MeshBasicMaterial;
  private arrow_mat_Green: THREE.MeshBasicMaterial;
  private arrow_mat_Blue: THREE.MeshBasicMaterial;
  private arrow_mat_Pick: THREE.MeshBasicMaterial;  //ハイライト用のカラー
  private line_mat_Red: THREE.LineBasicMaterial;
  private line_mat_Green: THREE.LineBasicMaterial;
  private line_mat_Blue: THREE.LineBasicMaterial;
  private line_mat_Pick: THREE.LineBasicMaterial; //ハイライト用のカラー


  constructor() {
    this.point = new ThreeLoadPoint();
    this.arrow_mat_Red = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.arrow_mat_Green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.arrow_mat_Blue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    this.arrow_mat_Pick = new THREE.MeshBasicMaterial({ color: 0xafeeee });  //ハイライト用のカラー
    this.line_mat_Red = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line_mat_Green = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    this.line_mat_Blue = new THREE.LineBasicMaterial({ color: 0x0000ff });
    this.line_mat_Pick = new THREE.LineBasicMaterial({ color: 0xafeeee }); //ハイライト用のカラー
  }

  /// 部材途中集中荷重を編集する
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
    row: number
  ): THREE.Group {

    const offset: number = 0;
    const height: number = 1;

    const child = new THREE.Group();

    // 長さを決める
    const p = this.getPoints(
      nodei, nodej, direction, pL1, pL2, P1, P2, height);

    const points: THREE.Vector3[] = p.points;
    const L1 = p.L1;
    const L2 = p.L2;

    // 矢印
    for (const arrow of this.getArrow(direction, [P1, P2], [L1, L2])) {
      child.add(arrow);
    }

    // 寸法線
    // const dim = this.getDim(points, L1, L2);
    // dim.visible = false;
    // child.add(dim);

    // 全体
    child.name = "child";
    child.position.y = offset;

    const group0 = new THREE.Group();
    group0.add(child);
    group0.name = "group";

    // 全体の位置を修正する
    const group = new THREE.Group();
    group.add(group0);
    group['value'] = p.Pmax; // 大きい方の値を保存　

    group.position.set(nodei.x, nodei.y, nodei.z);

    // 全体の向きを修正する
    if (!direction.includes('g')) {
      const XY = new Vector2(localAxis.x.x, localAxis.x.y).normalize();
      let A = Math.asin(XY.y);

      if (XY.x < 0) {
        A = Math.PI - A;
      }
      group.rotateZ(A);

      const lenXY = Math.sqrt(Math.pow(localAxis.x.x, 2) + Math.pow(localAxis.x.y, 2));
      const XZ = new Vector2(lenXY, localAxis.x.z).normalize();
      group.rotateY(-Math.asin(XZ.y));

      if (localAxis.x.x === 0 && localAxis.x.y === 0) {
        // 鉛直の部材
        if (direction === "z") {
          group.rotateX(-Math.PI);
        } else if (direction === "y") {
          group.rotateX(Math.PI / 2);
        }
      } else {
        if (direction === "z") {
          group.rotateX(-Math.PI / 2);
        } else if (direction === "y") {
          group.rotateX(Math.PI);
        }
      }

    } else if (direction === "gx") {
      group.rotation.z = Math.asin(-Math.PI / 2);

    } else if (direction === "gz") {
      group.rotation.x = Math.asin(-Math.PI / 2);

    }
    group.name = "PointMemberLoad-" + row.toString() + '-' + direction.toString();

    return group;
  }

  // 荷重を削除する
  // public dispose(group: THREE.Group){

  //   const group0 = group.getObjectByName('group');
  //   const child = group0.getObjectByName('child');

  //   for (let target of child.children) {
  //     if ( target.name.includes('PointLoad')){
  //       this.point.dispose(target);
  //     } else if(target.name === 'Dimension'){
  //       this.dim.dispose(target);
  //     }
  //   }

  // }

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

    // 荷重の各座標
    const x1 = L1;
    const x2 = L2;

    // y座標 値の大きい方が１となる
    const Pmax = (Math.abs(P1) > Math.abs(P2)) ? P1 : P2;

    const bigP = Math.abs(Pmax);
    let y1 = (P1 / bigP) * height;
    let y2 = (P2 / bigP) * height;

    if (direction === "x") {
      y1 = (height / 10);
      y2 = (height / 10);
    }

    return {
      points: [
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
      ],
      L1,
      L2,
      Pmax
    };
  }


  // 両端の矢印
  private getArrow(
    direction: string,
    value: number[],
    points: number[]): THREE.Group[] {

    const result: THREE.Group[] = new Array();

    const key: string = 't' + direction;

    for (let i = 0; i < 2; i++) {

      const Px = value[i];
      if (Px === 0) {
        continue;
      }

      const pos1 = new THREE.Vector3(points[i], 0, 0);
      if (direction === 'x') {
        pos1.y = 0.1;
      }

      //6番目の代入値は不適切
      const arrow_1 = this.point.create(pos1, 0, Px, 1, key, 0)

      if (direction === 'y') {
        arrow_1.rotation.z += Math.PI;
      } else if (direction === 'z') {
        arrow_1.rotation.x += Math.PI / 2;
      }

      result.push(arrow_1);
    }

    return result;

  }

  /*/ 寸法線
  private getDim(points: THREE.Vector3[],
                L1: number, L2: number): THREE.Group {

    const dim = new THREE.Group();

    let dim1: THREE.Group;
    let dim3: THREE.Group;

    const size: number = 0.1; // 文字サイズ

    const y1a = Math.abs(points[0].y);
    let y3a = Math.abs(points[1].y);

    if(L1 > 0){
      const p = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, y1a),
        new THREE.Vector2(L1, y1a),
        new THREE.Vector2(L1, points[0].y),
      ];
      dim1 = this.dim.create(p, L1.toFixed(3))
      dim1.visible = true;
      dim1.name = "Dimension1";
      dim.add(dim1);
    }

    if(L2 > 0){
      if (y3a === y1a){
        y3a += 0.2;
      }
      const p = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, y3a),
        new THREE.Vector2(L2, y3a),
        new THREE.Vector2(L2, points[0].y),
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

  // ハイライトを反映させる
  public setColor(group: any, text, dim, status: string) {

    const group0 = group.getObjectByName('group');
    const child = group0.getObjectByName('child');

    for (let target of child.children) {
      if ( target.name.includes('PointLoad')){
        this.point.setColor(target, text, dim, status);
      } else if(target.name === 'Dimension'){
        if (status === 'clear') {
          target.visible = false;
        } else if (status === 'select') {
          target.visible = true;
        }
      }
    }

  }
}
