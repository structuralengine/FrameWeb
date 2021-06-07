import { SceneService } from '../scene.service';
import { InputNodesService } from '../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../input/input-members/input-members.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { InputPanelService } from '../../input/input-panel/input-panel.service';
import { ThreeNodesService } from './three-nodes.service';
import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ThreeMembersService } from './three-members.service';
import { R3TargetBinder } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ThreePanelService {

  private panelList: any[];
  private isVisible: boolean;
  private currentIndex: string;
  private currentIndex_sub: string;
  private face_material: THREE.MeshBasicMaterial;
  private selectcolors: any[];

  private selectionItem: THREE.Object3D;     // 選択中のアイテム

  constructor(private scene: SceneService,
    private nodeThree: ThreeNodesService,
    private node: InputNodesService,
    private member: InputMembersService,
    private panel: InputPanelService,
    private three_member: ThreeMembersService) {
    this.panelList = new Array();
    this.isVisible = null;
    this.currentIndex = null;
    this.currentIndex_sub = null;
    /*this.face_material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x7f8F9F,
      opacity: 0.7,
    });*/
  }

  public visibleChange(flag: boolean): void {
    if (this.isVisible === flag) {
      return;
    }
    for (const mesh of this.panelList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;
  }

  public changeData(index: number): void {

    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    if (Object.keys(nodeData).length <= 0) {
      return;
    }
    // 要素データを入手
    const memberData = this.member.getMemberJson(0);
    if (Object.keys(memberData).length <= 0) {
      return;
    }
    
    // パネルデータを入手
    const panelData = this.panel.getPanelJson(0);
    if (Object.keys(panelData).length <= 0) {
      return;
    }

    // createPanelLoadを実行させる
    // const targetpanel = panelData;

    for (const key of Object.keys(panelData)) {
      const target = panelData[key];
      if (target.nodes.length <= 2) {
        continue
      }

      //対象のnodeDataを入手
      const vertexlist = [];
      for (const check of target.nodes) {
        if (check - 1 in Object.keys(nodeData)) {   //nodeData.key=>0~7, nodeData=>1~8のため（-1）で調整
          const n = nodeData[check];
          const x = n.x;
          const y = n.y;
          const z = n.z;
          vertexlist.push([x, y, z]);
        } else if (!(check - 1 in Object.keys(nodeData))) {
          continue;
        }
      }

      this.createPanel(vertexlist, key);
    }
  }

  //シートの選択行が指すオブジェクトをハイライトする
  //public selectChange(index_row, index_column): void {
  public selectChange(index_row): void {

    //[0]はハイライト用のカラー、[1]はデフォルトカラー
    this.selectcolors = [0x00AFAF, 0x7F8F9F]

    //if (this.currentIndex === index_row && this.currentIndex_sub === index_column) {
    if (this.currentIndex === index_row) {
      //選択行及び列の変更がないとき，何もしない
      return
    }

    //全てのハイライトを元に戻し，選択行のオブジェクトのみハイライトを適応する
    for (let item of this.panelList) {

      item['material']['color'].setHex(this.selectcolors[1]); //処理の変更あり

      if (item.name === 'panel-' + index_row.toString()) {

        item['material']['color'].setHex(this.selectcolors[0]); //処理の変更あり
      }
    }

    this.currentIndex = index_row;
    //this.currentIndex_sub = index_column;

    this.scene.render();
  }

  // 通常のgeometry(buffergeometryではない)
  private createPanel(vertexlist, row): void {

    const geometry = new THREE.Geometry();

    for(const p of vertexlist){
      geometry.vertices.push(new THREE.Vector3(p[0], p[1], p[2]))
    }
    for (let length = 0; length < geometry.vertices.length - 2; length++){
      geometry.faces.push( new THREE.Face3( 0, length + 1, length + 2 ) );
    }
    //const material = this.face_material;
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x7f8F9F,
      opacity: 0.7,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'panel-' + row.toString();

    this.panelList.push(mesh);
    this.scene.add(mesh);
  }

  // データをクリアする
  public ClearData(): void {

    for (const mesh of this.panelList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
      // オブジェクトを削除する
      this.scene.remove(mesh);
    }
    this.panelList = new Array();
  }

  // マウス位置とぶつかったオブジェクトを検出する
  public detectObject(raycaster: THREE.Raycaster, action: string): void {

    if (this.panelList.length === 0) {
      return; // 対象がなければ何もしない
    }
    //[0]はハイライト用のカラー、[1]はデフォルトカラー
    this.selectcolors = [0x00AFAF, 0x7F8F9F];

    // 交差しているオブジェクトを取得
    const intersects = raycaster.intersectObjects(this.panelList);
    if ( intersects.length <= 0 ){
      return;
    }
    switch (action) {
      case "click":
        this.panelList.map((item) => {
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            //const material = intersects[0].object['material'];
            const material = item['material'];
            material['vertexColors'] = true;
            material['color'].setHex(this.selectcolors[0]);
            material["opacity"] = 0.7;
          }
        });
        break;

      case "select":
        if (intersects.length > 0) {
          this.selectionItem = null;
          this.panelList.map((item) => {
            const material = item['material'];
            material['vertexColors'] = true;
            if (item === intersects[0].object) {
              // 色を赤くする
              material['color'].setHex(this.selectcolors[0]);
              material["opacity"] = 0.7;
              this.selectionItem = item;
            } else {
              // それ以外は元の色にする
              material['color'].setHex(this.selectcolors[1]);
              material["opacity"] = 0.7;
            }
          });
        }
        break;

      case "hover":
        this.panelList.map((item) => {
          const material = item['material'];
          material['vertexColors'] = true;
          if (intersects.length > 0 && item === intersects[0].object) {
            // 色を赤くする
            material['color'].setHex(this.selectcolors[0]);
            material["opacity"] = 0.7;
          } else {
            if (item === this.selectionItem) {
              material['vertexColors'] = true;
              material['color'].setHex(this.selectcolors[0]);
              material["opacity"] = 0.7;
            } else {
              // それ以外は元の色にする
              material['vertexColors'] = true;
              material['color'].setHex(this.selectcolors[1]);
              material["opacity"] = 0.7;
            }
          }
        });
        break;

      default:
        return;
    }
    this.scene.render();
  }

}
