import { Injectable } from '@angular/core';
import * as THREE from "three";
import { ThreeLoadDimension } from './three-load-dimension';
import { ThreeLoadMoment } from './three-load-moment';

import { ThreeLoadText } from "./three-load-text";

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadTorsion {

  private text: ThreeLoadText;
  private dim: ThreeLoadDimension;
  private moment: ThreeLoadMoment;

  private mesh1: THREE.Mesh;
  private mesh2: THREE.Mesh;

  private ellipse1 = new THREE.Line
  private ellipse2 = new THREE.Line
  private arrow1: THREE.Mesh;
  private arrow2: THREE.Mesh;

  private dim1: THREE.Group;
  private dim2: THREE.Group;
  private dim3: THREE.Group;

  constructor(
    text: ThreeLoadText,
    dim: ThreeLoadDimension,
    moment: ThreeLoadMoment) {
    this.text = text;
    this.dim = dim;
    this.moment = moment;
    this.create(); // ねじり分布荷重のテンプレート
  }

  public clone(): THREE.Group {

    const child = new THREE.Group();

    for (const target of [this.mesh1, this.mesh2, this.ellipse1, this.ellipse2, this.arrow1, this.arrow2 ]) {
      const mesh = target.clone();
      const mesh_mat: any = target.material;
      mesh.material = mesh_mat.clone();
      child.add(mesh);
    }

    for (const target of [this.dim1, this.dim2, this.dim3]) {
      child.add(target.clone());
    }

    child.name = "child";

    const group = new THREE.Group();
    group.add(child);

    group.name = "TorsionLoad";

    return group;

  }

  // ねじり分布荷重の雛形をX軸周りに生成する
  private create(): void {

    const face_color = 0x00cc00;

    const cylinder_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: face_color,
      opacity: 0.3,
    });

    // i端側のコーン
    const cylinder_geo = new THREE.CylinderBufferGeometry(
      1,
      1, // radiusTop, radiusBottom
      0.5,
      12, // height, radialSegments
      1,
      true, // heightSegments, openEnded
      -Math.PI / 2,
      Math.PI * 1.5 // thetaStart, thetaLength
    );
    this.mesh1 = new THREE.Mesh(cylinder_geo, cylinder_mat);
    this.mesh1.rotation.z = Math.PI / 2;
    this.mesh1.position.set(0.25, 0, 0);
    this.mesh1.name = "mesh1";

    this.mesh2 = this.mesh1.clone();
    this.mesh2.position.set(0.75, 0, 0);
    this.mesh2.name = "mesh2";

    // 矢印を描く
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
    const line_mat = new THREE.LineBasicMaterial({ color: face_color });
    const arrow_geo = new THREE.ConeBufferGeometry(0.05, 0.25, 3, 1, false);
    const arrow_mat = new THREE.MeshBasicMaterial({ color: face_color });

    this.ellipse1 = new THREE.Line(line_geo, line_mat);
    this.ellipse1.name = "line1";

    this.arrow1 = new THREE.Mesh(arrow_geo, arrow_mat);
    this.arrow1.rotation.x = Math.PI;
    this.arrow1.position.set(1, 0, 0);
    this.arrow1.name = "arrow1";

    this.ellipse2 = this.ellipse1.clone();
    this.ellipse2.name = "line1";

    this.arrow2 = this.arrow1.clone();
    this.arrow2.position.set(1, 0, 0);
    this.arrow2.name = "arrow2";

    // 寸法線を描く
    //this.dim1 = this.dim.clone();
    //this.dim1.name = "Dimension1";

    //this.dim2 = this.dim.clone();
    //this.dim2.name = "Dimension2";

    this.dim3 = this.dim.create(
      [
        new THREE.Vector2(1, 1.1),
        new THREE.Vector2(1, 2),
        new THREE.Vector2(2, 2),
        new THREE.Vector2(2, 0.1),
      ],
      "1.003"
    );
    this.dim3.name = "Dimension3";

  }

}
