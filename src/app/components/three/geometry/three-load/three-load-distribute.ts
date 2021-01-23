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

    for (const target of [this.mesh, this.line]) {
      const mesh = target.clone();
      const mesh_mat: any = target.material;
      mesh.material = mesh_mat.clone();
      child.add(mesh);
    }

    for (const target of [this.arrow1, this.arrow2]) {
      const arrow = target.clone();
      const line_mat: any = target.line.material;
      const cone_mat: any = target.cone.material;
      arrow.line.material = line_mat.clone();
      arrow.cone.material = cone_mat.clone();
      child.add(arrow);
    }

    for (const target of [this.dim1, this.dim2, this.dim3]) {
      child.add(target.clone());
    }

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


}
