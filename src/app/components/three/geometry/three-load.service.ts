import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeNodesService } from './three-nodes.service';

import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeLoadService {

  private isVisible: boolean[];

  private mDistribase: THREE.Group// 分布荷重のテンプレート
  private mMomentbase: THREE.Group// ねじり分布荷重のテンプレート

  constructor(private scene: SceneService,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private load: InputLoadService,
              private three_member: ThreeMembersService) {

    console.log('three load!', 'constructor');
    this.ClearData();
  }

  public visible(flag: boolean, gui: boolean): void {
    console.log('three load!', 'visible');
  }

  // guiを表示する
  private guiEnable(): void {
    console.log('three load!', 'guiEnable');
  }

  // guiを非表示にする
  private guiDisable(): void {
    console.log('three load!', 'guiDisable');
  }

  public baseScale(): number {
    console.log('three load!', 'baseScale');
    // 最も距離の近い2つの節点距離
    return this.nodeThree.minDistance;
  }

  public changeData(index: number): void {
    console.log('three load!', 'changeData');
    this.onResize();
  }

  // スケールを反映する
  private onResize(): void {
    console.log('three load!', 'onResize');
  }

  // データをクリアする
  public ClearData(): void {
    this.guiDisable();

    console.log('three load!', 'ClearData');
    this.mDistribase = this.createDistributedLoad();        // 分布荷重のテンプレート
    this.mMomentbase = this.createDistributedMomentLoad();  // ねじり分布荷重のテンプレート

    this.scene.add(this.mMomentbase);

  }

    // ねじり分布荷重の雛形をX軸周りに生成する
    private createDistributedMomentLoad(): THREE.Group {

      const group = new THREE.Group();
  
      const line_color = 0x0000ff;
      const face_color = 0x00cc00;

      const cylinder_mat = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        color: face_color,
        opacity: 0.3
      });

      // i端側のコーン
      const cylinder_geo = new THREE.CylinderBufferGeometry(
        1, 1,               // radiusTop, radiusBottom
        0.5, 12,            // height, radialSegments
        1, true,            // heightSegments, openEnded
        0, 1.5 * Math.PI    // thetaStart, thetaLength
      );
      const mesh1 = new THREE.Mesh(cylinder_geo, cylinder_mat);
      mesh1.rotation.z = Math.PI / 2;
      mesh1.position.set(0.25, 0, 0);
      mesh1.name = 'cylinder1';
      group.add(mesh1);

      const mesh2 = mesh1.clone();
      mesh1.position.set(0.75, 0, 0);
      mesh2.name = 'cylinder2';
      group.add(mesh2);

      // 
      const arrow1 = this.createMomentLoad();
      arrow1.name = 'arrow1';
      group.add( arrow1 );

      const arrow2 = arrow1.clone();
      arrow2.position.set(1,0,0);      
      arrow2.name = 'arrow2';      
      group.add( arrow2 );

      return group;
    }
  

  // 等分布荷重の雛形をX-Y平面上に生成する
  private createDistributedLoad(): THREE.Group {

    const group = new THREE.Group();

    const points = [
      new THREE.Vector3( 0,   0, 0 ),
      new THREE.Vector3( 0,   1, 0 ),
      new THREE.Vector3( 0.5, 1, 0 ),
      new THREE.Vector3( 1,   1, 0 ),
      new THREE.Vector3( 1,   0, 0 ),
    ];

    const line_color = 0x0000ff;
    const face_color = 0x00cc00;

    // 面を作成する
    const face_mat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: face_color,
      opacity: 0.3
    });
    const face_geo = new THREE.Geometry();
    face_geo.vertices = points;
    face_geo.faces.push( new THREE.Face3( 0, 1, 2 ) );
    face_geo.faces.push( new THREE.Face3( 2, 3, 4 ) );
    face_geo.faces.push( new THREE.Face3( 0, 2, 4 ) );
    const mesh = new THREE.Mesh( face_geo, face_mat );
    mesh.name = 'face';
    group.add(mesh);

    // 面の周りの枠線を描く
    const line_mat = new THREE.LineBasicMaterial({ color: line_color });
    const line_geo = new THREE.BufferGeometry().setFromPoints( [points[1],points[2],points[3]] );
    const line = new THREE.Line( line_geo, line_mat );
    line.name = 'line';
    group.add(line);

    // 矢印を描く
    const dir = new THREE.Vector3( 0, -1, 0 ); // 矢印の方向（単位ベクトル）
    const length = 1; // 長さ

    const origin1 = new THREE.Vector3( 0, 1, 0 );
    const arrow1 = new THREE.ArrowHelper( dir, origin1, length, line_color );
    arrow1.name = 'arrow1';
    group.add( arrow1 );

    const origin2 = new THREE.Vector3( 1, 1, 0 );
    const arrow2 = new THREE.ArrowHelper( dir, origin2, length, line_color );
    arrow2.name = 'arrow2';
    group.add( arrow2 );

    return group;
  }

    // 節点モーメント荷重の矢印を作成する
    private createMomentLoad(): THREE.Line {

      const line_color = 0x0000ff;

      const curve = new THREE.EllipseCurve(
        0, 0,             // ax, aY
        1, 1,             // xRadius, yRadius
        0, 1.5 * Math.PI, // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
      );
  
      const points = curve.getPoints(12);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: line_color });
      const ellipse = new THREE.Line(lineGeometry, lineMaterial);
  
      const arrowGeometry = new THREE.ConeBufferGeometry(0.1, 1, 3, 1, true);
      const arrowMaterial = new THREE.MeshBasicMaterial({ color: line_color });
      const cone = new THREE.Mesh(arrowGeometry, arrowMaterial);
      cone.rotateX(Math.PI);
      ellipse.add(cone);
  
      ellipse.rotation.y = Math.PI / 2;

      return ellipse;
  
    }

}

