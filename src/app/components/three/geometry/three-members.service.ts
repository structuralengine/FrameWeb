import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';
import * as THREE from 'three';
import { NumberValueAccessor } from '@angular/forms';
import { CSS2DRenderer, CSS2DObject } from '../libs/CSS2DRenderer.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeMembersService {

  private memberList: THREE.Line[];

  constructor(private node: InputNodesService,
              private member: InputMembersService) {
    this.memberList = new Array();
  }
  public getSelectiveObject(): THREE.Line[] {
    return this.memberList;
  }

  public chengeData(scene: SceneService): void {

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      this.ClearData(scene);
      return;
    }

    // メンバーデータを入手
    const jsonData = this.member.getMemberJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      this.ClearData(scene);
      return;
    }

    // 要素を排除する
    this.ClearData(scene);

    // 新しい入力を適用する
    for (const key of jsonKeys) {

      // 節点データを集計する
      const member = jsonData[key];
      const ni = member.ni;
      const nj = member.nj;
      const i = nodeData[ni];
      const j = nodeData[nj];
      if ( i === undefined || j === undefined ) {
        continue;
      }

      // 要素をシーンに追加
      const geometry = new THREE.Geometry();
      // 頂点座標の追加
      geometry.vertices.push( new THREE.Vector3( i.x, i.y, i.z) );
      geometry.vertices.push( new THREE.Vector3( j.x, j.y, j.z) );

      // 線オブジェクトの生成
      const line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x990000} ) );
      line.name = key;

      // sceneにlineを追加
      this.memberList.push(line);
      scene.add( line );

      // 文字をシーンに追加
      const moonDiv = document.createElement( 'div' );
      moonDiv.className = 'label';
      moonDiv.textContent = key;
      moonDiv.style.marginTop = '-1em';
      const moonLabel = new CSS2DObject( moonDiv );
      const x: number = (i.x + j.x) / 2;
      const y: number = (i.y + j.y) / 2;
      const z: number = (i.z + j.z) / 2;
      moonLabel.position.set( x, y, z );
      moonLabel.name = 'font';
      line.add( moonLabel );

      // ローカル座標を示す線を追加
      const zAxis = this.member.localZaxis(x, y, z, j.x, j.y, j.z, member.cg);

    }
  }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    for (const mesh of this.memberList) {
      // 文字を削除する
      while ( mesh.children.length > 0 ) {
        const object = mesh.children[ 0 ];
        object.parent.remove( object );
      }
      // 線を削除する
      scene.remove(mesh);
    }
    this.memberList = new Array();
  }


  // 文字を消す
  public Disable(): void {
    for (const mesh of this.memberList) {
      mesh.getObjectByName('font').visible = false;
    }
  }

  // 文字を表示する
  public Enable(): void {
    for (const mesh of this.memberList) {
      mesh.getObjectByName('font').visible = true;
    }
  }

}


