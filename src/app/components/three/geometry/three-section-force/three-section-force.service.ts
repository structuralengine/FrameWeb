import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../../libs/Line2.js';
import { LineMaterial } from '../../libs/LineMaterial.js';
import { LineGeometry } from '../../libs/LineGeometry.js';

import { SceneService } from '../../scene.service';

import { DataHelperModule } from '../../../../providers/data-helper.module';

import { InputNodesService } from '../../../input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../input/input-members/input-members.service';

import { ThreeMembersService } from '../three-members.service';
import { ThreeNodesService } from '../three-nodes.service.js';
import { ThreeSectionForceMeshService } from './three-force-mesh';
import { Mesh } from 'three';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private ThreeObject1: THREE.Object3D;
  private ThreeObject2: THREE.Object3D;
  private currentIndex: string;
  private currentMode: string;

  private scale: number;
  private params: any;   // GUIの表示制御
  private radioButtons3D = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private radioButtons2D = ['axialForce', 'shearForceY', 'momentZ'];
  private radioButtons = this.radioButtons3D || this.radioButtons2D;
  private gui: any;
  private gui_dimension: number = null;

  private mesh: ThreeSectionForceMeshService;

  private nodeData: any;
  private memberData: any;
  private fsecData: any;
  private max_values: any = {};

  constructor(
    private scene: SceneService,
    private helper: DataHelperModule,
    private node: InputNodesService,
    private member: InputMembersService,
    private three_node: ThreeNodesService,
    private three_member: ThreeMembersService) {

    this.ThreeObject1 = new THREE.Object3D();
    this.ThreeObject1.visible = false; // 呼び出されるまで非表示
    this.ThreeObject2 = new THREE.Object3D();
    this.ThreeObject2.visible = false; // 呼び出されるまで非表示

    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.mesh = new ThreeSectionForceMeshService(font, this.helper.dimension);
      this.ClearData();
      this.scene.add(this.ThreeObject1);
      this.scene.add(this.ThreeObject2);
    });

    // gui
    this.scale = 100;
    this.gui = null;
  }

  public visibleChange(ModeName: string): void {

    if (this.currentMode === ModeName){
      return;
    }
    if( ModeName === 'fsec' ){
      this.ThreeObject1.visible = true;
      this.ThreeObject2.visible = false;
    } else if( ModeName === 'comb_fsec' ){
      this.ThreeObject1.visible = true;
      this.ThreeObject2.visible = true;
    } else if( ModeName === 'pik_fsec' ){
      this.ThreeObject1.visible = true;
      this.ThreeObject2.visible = true;
    } else{
      this.ThreeObject1.visible = false;
      this.ThreeObject2.visible = false;
      this.guiDisable();
      this.currentMode = ModeName;
      return;
    }
    this.currentMode = ModeName;
    this.changeMesh();
    this.guiEnable();
    this.onResize();
  }

  // データをクリアする
  public ClearData(): void {
    for (const mesh of this.ThreeObject1.children) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
    }
    // オブジェクトを削除する
    this.ThreeObject1.children = new Array();
  }

  private setGuiParams(): void {

    if (this.gui !== null && this.gui_dimension === this.helper.dimension) {
      return;
    }
    
    this.gui_dimension = this.helper.dimension;

    if (this.helper.dimension === 3){
      this.radioButtons = this.radioButtons3D;
    } else {
      this.radioButtons = this.radioButtons2D;
    }
    this.params = {
      forceScale: this.scale
    };
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }

    if (this.helper.dimension === 3){
      this.params.momentY = true; // 初期値（3D）
    } else {
      this.params.momentZ = true; // 初期値（2D） 
    }

  }

  private guiEnable(): void {

    if (this.gui !== null && this.gui_dimension === this.helper.dimension) {
      return;
    }

    const gui_step: number = 1;
    const gui_max_scale: number = 200;

    this.gui = {
      forceScale: this.scene.gui.add(this.params, 'forceScale', 0, gui_max_scale).step(gui_step).onChange((value) => {
        // guiによる設定
        this.scale = value;
        this.onResize();
        this.scene.render();
      })
    };
    
    for (const key of this.radioButtons) {
      this.gui[key] = this.scene.gui.add(this.params, key, this.params[key]).listen().onChange((value) => {
        if (value === true) {
          this.setGuiRadio(key);
        } else {
          this.setGuiRadio('');
        }
        this.changeMesh();
        this.onResize();
        this.scene.render();
      });
    }
  }

  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    for (const key of Object.keys(this.gui)) {
      this.scene.gui.remove(this.gui[key]);
    }
    this.gui = null;
  }

  // gui 選択されたチェックボックス以外をOFFにする
  private setGuiRadio(target: string): void {
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params[target] = true;
  }

  // 解析結果をセットする
  public setResultData(fsecJson: any, max_values: any): void {
    const keys =  Object.keys(fsecJson);
    if(keys.length === 0){
      this.ClearData();
      return;
    }

    this.nodeData = this.node.getNodeJson(0);
    this.memberData = this.member.getMemberJson(0);
    this.fsecData = { fsec: fsecJson };
    this.max_values = { fsec: max_values };
    this.currentMode = 'fsec';
    this.currentIndex = keys[0];
    this.changeMesh();
    this.currentMode = '';
  }
  // combine
  public setCombResultData(fsecJson: any, max_values: any): void {
    this.fsecData['comb_fsec'] = fsecJson;
    this.max_values['comb_fsec'] = max_values;
  }
  // pick up
  public setPickupResultData(fsecJson: any, max_values: any): void {
    this.fsecData['pik_fsec'] = fsecJson;
    this.max_values['pik_fsec'] = max_values;
  }

  private changeMesh(){

    if(this.currentIndex === undefined){
      return;
    }

    this.setGuiParams();

    let key1: string;
    let key2: string;
    if (this.params.axialForce === true) {
      key1 = 'fx';
      key2 = (this.helper.dimension === 3) ? 'z' : 'y' ;
    } else if (this.params.torsionalMoment === true) {
      // ねじり曲げモーメント
      key1 = 'mx';
      key2 = 'y';
    } else if (this.params.shearForceY === true) {
      // Y方向のせん断力
      key1 = 'fy';
      key2 = 'y';
    } else if (this.params.momentY === true) {
      // Y軸周りの曲げモーメント
      key1 = 'my';
      key2 = 'z';
    } else if (this.params.shearForceZ === true) {
      // Z方向のせん断力
      key1 = 'fz';
      key2 = 'z';
    } else if (this.params.momentZ === true) {
      // Z軸周りの曲げモーメント
      key1 = 'mz';
      key2 = 'y';
    } else {
      return;
    }

    // 最初のケースを代表として描画する
    if(!(this.currentMode in this.fsecData)){
      return;
    }
    const fsecList = this.fsecData[this.currentMode];
    const fsecDatas = [];
    if(this.currentMode === 'fsec'){
      fsecDatas.push(fsecList[this.currentIndex]);
    } else {
      const f = fsecList[this.currentIndex];
      for (const k of [key1 + '_max', key1 + '_min']){
        if( k in f ){
          fsecDatas.push(f[k]);
        }
      }
    }
    const ThreeObjects: THREE.Object3D[] = [this.ThreeObject1, this.ThreeObject2];

    for( let i = 0; i < fsecDatas.length; i++){

      const fsecData = fsecDatas[i];
      const ThreeObject = ThreeObjects[i];

      // オブジェクト方が多い場合、データとオブジェクトの数を合わせる
      for(let i = fsecData.length + 1; i < ThreeObject.children.length; i++){
        ThreeObject.children.splice(0, 1);
      }

      let nodei: THREE.Vector3;
      let nodej: THREE.Vector3;
      let localAxis: any;
      let len: number;
      let L1: number = 0;
      let L2: number = 0;
      let P1: number = 0;
      let P2: number = 0;
      let counter = 0;
      for(const fsec of fsecData){
        const id = fsec['m'].trim();
        if (id.length > 0) {
          // 節点データを集計する
          const m = this.memberData[id];
          const ni = this.nodeData[m.ni];
          const nj = this.nodeData[m.nj];
          nodei = new THREE.Vector3(ni.x, ni.y, ni.z);
          nodej = new THREE.Vector3(nj.x, nj.y, nj.z);
          // 部材の座標軸を取得
          localAxis = this.three_member.localAxis(ni.x, ni.y, ni.z, nj.x, nj.y, nj.z, m.cg);
          len = new THREE.Vector3(nj.x - ni.x, nj.y - ni.y, nj.z - ni.z).length();
          L1 = 0;
          P1 = fsec[key1];
        } else {
          let item = null;
          if(ThreeObject.children.length > counter) {
            item = ThreeObject.children[counter];
          }
          const LL = fsec['l'];
          P2 = fsec[key1] - 0;
          L2 = Math.round((len - LL) * 1000) / 1000;
          if(item === null){
            const mesh = (this.helper.dimension === 2 && key1 === 'fy') ? 
                            this.mesh.create(nodei, nodej, localAxis, key2, L1, L2, -P1, -P2) :
                            this.mesh.create(nodei, nodej, localAxis, key2, L1, L2, P1, P2) ;
            ThreeObject.add(mesh);
          } else {
            if (this.helper.dimension === 2 && key1 === 'fy'){
              this.mesh.change(item, nodei, nodej, localAxis, key2, L1, L2, -P1, -P2);
            } else {
              this.mesh.change(item, nodei, nodej, localAxis, key2, L1, L2, P1, P2);
            }
          }
          P1 = P2;
          L1 = LL;
          counter++;
        }
      }
    }
    
  }

  // データが変更された時に呼び出される
  // 変数 this.targetData に値をセットする
  public changeData(index: number, ModeName: string): void {

    this.currentIndex = index.toString();
    this.currentMode = ModeName;
    this.changeMesh();
    this.onResize();

  }

  private baseScale(): number {
    return this.three_node.baseScale * 5;
  }
  
  // 断面力図を描く
  private onResize(): void {
    if(!(this.currentMode in this.max_values)){
      return;
    }

    const scale1: number = this.scale / 100;
    const scale2: number = this.baseScale();
    const max_values = this.max_values[this.currentMode];
    const max_value = max_values[this.currentIndex];

    let scale3: number = 1;
    if (this.params.axialForce === true) {
      scale3 = max_value['fx'];
    } else if (this.params.torsionalMoment === true) {
      // ねじり曲げモーメント
      scale3 = max_value['mx'];
    } else if (this.params.shearForceY === true) {
      // Y方向のせん断力
      scale3 = max_value['fy'];
    } else if (this.params.momentY === true) {
      // Y軸周りの曲げモーメント
      scale3 = max_value['my'];
    } else if (this.params.shearForceZ === true) {
      // Z方向のせん断力
      scale3 = max_value['fz'];
    } else if (this.params.momentZ === true) {
      // Z軸周りの曲げモーメント
      scale3 = max_value['mz'];
    } else {
      return;
    }

    const scale: number = scale1 * scale2 / scale3;

    if(this.ThreeObject1.visible === true){
      this.ThreeObject1.children.forEach(item => {
        this.mesh.setScale(item, scale);
      });
    }
    if(this.ThreeObject2.visible === true){
      this.ThreeObject2.children.forEach(item => {
        this.mesh.setScale(item, scale);
      });
    }

  }

}

