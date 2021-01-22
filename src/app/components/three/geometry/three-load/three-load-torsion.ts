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

  private TEMPLATE: THREE.Group; // ねじり分布荷重のテンプレート

  constructor(
    text: ThreeLoadText,
    dim: ThreeLoadDimension,
    moment: ThreeLoadMoment) {
    this.text = text;
    this.dim = dim;
    this.moment = moment;
    this.TEMPLATE = this.create(); // ねじり分布荷重のテンプレート
  }

  public clone(): THREE.Group {
    return this.TEMPLATE.clone();
  }

  // ねじり分布荷重の雛形をX軸周りに生成する
  private create(): THREE.Group {
    const group = new THREE.Group();

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
    const mesh1 = new THREE.Mesh(cylinder_geo, cylinder_mat);
    mesh1.rotation.z = Math.PI / 2;
    mesh1.position.set(0.25, 0, 0);
    mesh1.name = "mesh1";
    group.add(mesh1);

    const mesh2 = mesh1.clone();
    mesh1.position.set(0.75, 0, 0);
    mesh2.name = "mesh2";
    group.add(mesh2);

    //
    const arrow1 = this.moment.clone();
    arrow1.name = "arrow1";
    group.add(arrow1);

    const arrow2 = this.moment.clone();
    arrow2.name = "arrow2";
    arrow2.position.set(1, 0, 0);
    group.add(arrow2);

    // 寸法線を描く
    const dim1 = this.dim.clone();
    dim1.name = "Dimension1";
    group.add(dim1);

    const dim2 = this.dim.clone();
    dim2.name = "Dimension2";
    group.add(dim2);

    const dim3 = this.dim.clone();
    this.dim.change(
      dim3,
      [
        new THREE.Vector2(1, 1.1),
        new THREE.Vector2(1, 2),
        new THREE.Vector2(2, 2),
        new THREE.Vector2(2, 0.1),
      ],
      "1.003"
    );
    dim3.name = "Dimension3";
    group.add(dim3);

    ///////////////////////////////////////////
    // 文字は、後で変更が効かないので、後で書く //
    ///////////////////////////////////////////

    group.name = "DistributedMoment";
    return group;
  }


}
