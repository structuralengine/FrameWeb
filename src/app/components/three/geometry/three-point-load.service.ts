import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';
import { InputLoadService } from '../../../components/input/input-load/input-load.service';
import { ThreeNodesService } from './three-nodes.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreePointLoadService {

  private pointLoadList: any[];
  private selectionItem: THREE.Mesh;     // 選択中のアイテム

  constructor(private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private member: InputMembersService,
              private load: InputLoadService) {
    this.pointLoadList = new Array();
    this.selectionItem = null;
  }

  public baseScale(): number {
    const scale = this.nodeThree.baseScale() * 80; // 最も距離の近い2つの節点距離
    return scale * 0.75; // 最も値の大きい荷重の大きさ
  }

  public chengeData(scene: SceneService, index: number): void {

    // 一旦全排除
    this.ClearData(scene);

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // 節点荷重データを入手
    const targetCase: string = index.toString();
    const nodeLoadData = this.load.getNodeLoadJson('unity-loads:' + targetCase);
    if (Object.keys(nodeLoadData).length <= 0) {
      this.ClearNodeLoad(scene);
      return;
    }

    // サイズを調整しオブジェクトを登録する
    this.createNodeLoad(scene, nodeLoadData[targetCase], nodeData);

    // メンバーデータを入手
    const memberData = this.member.getMemberJson('calc');
    const memberKeys = Object.keys(memberData);
    if (memberKeys.length <= 0) {
      this.ClearMemberLoad(scene);
      return;
    }
  }

  // 節点荷重の矢印を描く
  private createNodeLoad(scene: SceneService, nodeLoadData: any, nodeData: object): void {

    // 新しい入力を適用する
    const targetNodeLoad = nodeLoadData;
    // スケールを決定する 最大の荷重を 1とする
    let pMax = 0;
    let mMax = 0;
    for (const load of targetNodeLoad) {
      pMax = Math.max(pMax, Math.abs(load.tx));
      pMax = Math.max(pMax, Math.abs(load.ty));
      pMax = Math.max(pMax, Math.abs(load.tz));
      mMax = Math.max(mMax, Math.abs(load.rx));
      mMax = Math.max(mMax, Math.abs(load.ry));
      mMax = Math.max(mMax, Math.abs(load.rz));
    }

    const scale: number = this.baseScale();

    // 集中荷重の矢印をシーンに追加する
    for (const load of targetNodeLoad) {
      // 節点座標 を 取得する
      const i = nodeData[load.n];
      if (i === undefined) {
        continue;
      }
      // x方向の集中荷重
      const xArrow = this.setPointLoad(load.tx, pMax / scale, i, 0xFF0000, 'px');
      if (xArrow !== null) {
        this.pointLoadList.push(xArrow);
        scene.add(xArrow);
      }
      // y方向の集中荷重
      const yArrow = this.setPointLoad(load.ty, pMax / scale, i, 0x00FF00, 'py');
      if (yArrow !== null) {
        this.pointLoadList.push(yArrow);
        scene.add(yArrow);
      }
      // z方向の集中荷重
      const zArrow = this.setPointLoad(load.tz, pMax / scale, i, 0x0000FF, 'pz');
      if (zArrow !== null) {
        this.pointLoadList.push(zArrow);
        scene.add(zArrow);
      }

      // x軸周りのモーメント
      const xMoment = this.setMomentLoad(load.rx, mMax / scale, i, 0xFF0000, 'mx');
      if (xMoment !== null) {
        this.pointLoadList.push(xMoment);
        scene.add(xMoment);
      }

    }
  }

  // 節点荷重の矢印を作成する
  private setMomentLoad(value: number, mMax: number, node: any, color: number, name: string): THREE.Line {

    if (Math.sign(value) === 0) {
      return null;
    }

    const curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      10, 10,           // xRadius, yRadius
      0,  1.5 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    const points = curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const material = new THREE.LineBasicMaterial( { color } );

    // Create the final object to add to the scene
    const ellipse = new THREE.Line( geometry, material );
    ellipse.position.x = node.x;
    ellipse.position.y = node.y;
    ellipse.position.z = node.z;

    return ellipse;

    const length: number = value / mMax;
    let vector: THREE.Vector3;
    let origin: THREE.Vector3;
    switch (name) {
      case 'mx':
        vector = new THREE.Vector3(Math.sign(value) * 1, 0, 0);
        origin = new THREE.Vector3(node.x - length, node.y, node.z);
        break;
      case 'my':
        vector = new THREE.Vector3(0, Math.sign(value) * 1, 0);
        origin = new THREE.Vector3(node.x, node.y - length, node.z);
        break;
      case 'mz':
        vector = new THREE.Vector3(0, 0, Math.sign(value) * 1);
        origin = new THREE.Vector3(node.x, node.y, node.z - length);
        break;
    }
    const Arrow = new THREE.ArrowHelper(vector, origin, Math.abs(length), color);
    Arrow.name = name;
    // return Arrow;
  }

  // 節点荷重の矢印を作成する
  private setPointLoad(value: number, pMax: number, node: any, color: number, name: string): THREE.ArrowHelper {

    if (Math.sign(value) === 0) {
      return null;
    }

    const length: number = value / pMax;
    let vector: THREE.Vector3;
    let origin: THREE.Vector3;
    switch (name) {
      case 'px':
        vector = new THREE.Vector3(Math.sign(value) * 1, 0, 0);
        origin = new THREE.Vector3(node.x - length, node.y, node.z);
        break;
      case 'py':
        vector = new THREE.Vector3(0, Math.sign(value) * 1, 0);
        origin = new THREE.Vector3(node.x, node.y - length, node.z);
        break;
      case 'pz':
        vector = new THREE.Vector3(0, 0, Math.sign(value) * 1);
        origin = new THREE.Vector3(node.x, node.y, node.z - length);
        break;
    }
    const Arrow = new THREE.ArrowHelper(vector, origin, Math.abs(length), color);
    Arrow.name = name;
    return Arrow;
  }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    this.ClearMemberLoad(scene);
    this.ClearNodeLoad(scene);
  }

  // データをクリアする
  private ClearNodeLoad(scene: SceneService): void {
    for (const mesh of this.pointLoadList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      scene.remove(mesh);
    }
    this.pointLoadList = new Array();
  }

  // データをクリアする
  private ClearMemberLoad(scene: SceneService): void {
  }
  
}

