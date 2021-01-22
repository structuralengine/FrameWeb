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

  private mDistribase: THREE.Group;

  constructor(text: ThreeLoadText, dim: ThreeLoadDimension) {
    this.text = text;
    this.dim = dim;
    this.mDistribase = this.createDistributedLoad();
  }

  // 等分布荷重の雛形をX-Y平面上に生成する
  private createDistributedLoad(): THREE.Group {
    const group = new THREE.Group();

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
    const mesh = new THREE.Mesh(face_geo, face_mat);
    mesh.name = "face";
    group.add(mesh);

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints([
      points[1],
      points[2],
      points[3],
    ]);
    const line = new THREE.Line(line_geo, line_mat);
    line.name = "line";
    group.add(line);

    // 矢印を描く
    const dir = new THREE.Vector3(0, -1, 0); // 矢印の方向（単位ベクトル）
    const length = 1; // 長さ

    const origin1 = new THREE.Vector3(0, 1, 0);
    const arrow1 = new THREE.ArrowHelper(dir, origin1, length, line_color);
    arrow1.name = "arrow1";
    group.add(arrow1);

    const origin2 = new THREE.Vector3(1, 1, 0);
    const arrow2 = new THREE.ArrowHelper(dir, origin2, length, line_color);
    arrow2.name = "arrow2";
    group.add(arrow2);

    // 寸法線を描く
    const dim1 = this.dim.createDimension();
    dim1.name = "Dimension1";
    group.add(dim1);

    const dim2 = this.dim.createDimension();
    dim2.name = "Dimension2";
    group.add(dim2);

    const dim3 = this.dim.createDimension();
    dim3.name = "Dimension3";
    group.add(dim3);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "DistributedLoad";
    return group;
  }


}
