import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';

import { ResultFsecService } from '../../result/result-fsec/result-fsec.service';
import { ResultCombineFsecService } from '../../result/result-combine-fsec/result-combine-fsec.service';
import { ResultPickupFsecService } from '../../result/result-pickup-fsec/result-pickup-fsec.service';

import { ThreeMembersService } from './three-members.service';
import { ThreeNodesService } from './three-nodes.service.js';
import { Mesh } from 'three';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private isVisible: boolean;
  private lineList: THREE.Line[];
  private targetData: any;
  private targetIndex: string;
  private modeName: string;

  private scale: number;
  private params: any;   // GUIの表示制御
  private radioButtons = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private gui: any;
  private gui_max_scale: number;

  private font: THREE.Font;


  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private fsec: ResultFsecService,
              private comb_fsec: ResultCombineFsecService,
              private pik_fsec: ResultPickupFsecService,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_node: ThreeNodesService,
              private three_member: ThreeMembersService) {

    this.isVisible = null;

    this.lineList = new Array();
    this.ClearData();

    // gui
    this.scale = 0.5;
    this.params = {
      forceScale: this.scale
    };
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params.momentY = true; // 初期値
    //this.params.shearForceZ = true; // 初期値
    this.gui = null;
    this.gui_max_scale = 1;

    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
    });
  }

  public visible(flag: boolean): void {
    if (this.isVisible === flag) {
      return;
    }
    for (const mesh of this.lineList) {
      mesh.visible = flag;
    }
    this.isVisible = flag;
    if (flag === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
  }

  // データをクリアする
  public ClearData(): void {
    if (this.lineList.length > 0) {
      // 線を削除する
      for (const mesh of this.lineList) {
        // 文字を削除する
        while (mesh.children.length > 0) {
          const object = mesh.children[0];
          object.parent.remove(object);
        }
        this.scene.remove(mesh);
      }
      this.lineList = new Array();
    }
    this.targetData = {};
    this.targetIndex = '';
    this.modeName = '';
    this.scale = 1; //0.5;
  }

  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }
    const gui_step: number = this.gui_max_scale * 0.001;
    this.gui = {
      forceScale: this.scene.gui.add(this.params, 'forceScale', 0, this.gui_max_scale).step(gui_step).onChange((value) => {
        // guiによる設定
        this.scale = value;
        this.onResize();
        this.scene.render();
      })
    };
    for (const key of this.radioButtons) {
      this.gui[key] = this.scene.gui.add(this.params, key, this.params[key]).listen().onChange((value) => {
        if (value === true) {
          this.setGUIcheck(key);
        } else {
          this.setGUIcheck('');
        }
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
  private setGUIcheck(target: string): void {
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params[target] = true;
  }

  // データが変更された時に呼び出される
  // 変数 this.targetData に値をセットする
  public chengeData(index: number, ModeName: string): void {

    if (this.modeName === ModeName ){
      if (this.targetIndex === index.toString()) {
        // ケースが同じなら何もしない
        return;
      }

      if (ModeName === 'fsec' && this.lineList.length > 0) {
        // 既に Geometryを作成していたら リサイズするだけ
        this.targetIndex = index.toString();
        this.onResize();
        return;
      }
    }

    // 要素を排除する
    this.ClearData();

    // 格点データを入手
    const nodeData = this.node.getNodeJson(0);
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // メンバーデータを入手
    const memberData = this.member.getMemberJson(0);
    const memberKeys = Object.keys(memberData);
    if (memberKeys.length <= 0) {
      return;
    }

    // 断面力データを入手
    let allFsecgData: object;
    switch(ModeName){
      case 'comb_fsec':
        allFsecgData = this.comb_fsec.getFsecJson();
        break;
     case 'pik_fsec':
        allFsecgData = this.pik_fsec.getFsecJson();
        break;
      default:
        allFsecgData = this.fsec.getFsecJson();
        break;
    }

    this.targetIndex = index.toString();
    this.modeName = ModeName;

    if (!(this.targetIndex in allFsecgData)) {
      return;      // 荷重Case番号 this.targetIndex が 計算結果 this.targetData に含まれていなかったら何もしない
    }

    const maxValue = {
      fx: 0,
      fy: 0,
      fz: 0,
      mx: 0,
      my: 0,
      mz: 0
    }

    for (const targetKey of Object.keys(allFsecgData)) {

      const targetCase: any = allFsecgData[targetKey]; // 対象ケースのデータを複製して扱っている

      let targetFsecName: string[];
      if ( ModeName === 'comb_fsec' || ModeName === 'pik_fsec'){
        targetFsecName = ['max', 'min']
      } else {
        if (!Array.isArray(targetCase)){
          continue;
        }
        targetFsecName = ['']
      }

      // 新しい入力を適用する
      const targetList = new Array();

      for(const key of targetFsecName){

        let fsecData: any[];
        if(key.length === 0){
          fsecData = targetCase.slice();
        } else {
          fsecData = new Array();
          const fx_obj: object = targetCase['fx_' + key];
          const fy_obj: object = targetCase['fy_' + key];
          const fz_obj: object = targetCase['fz_' + key];
          const mx_obj: object = targetCase['mx_' + key];
          const my_obj: object = targetCase['my_' + key];
          const mz_obj: object = targetCase['mz_' + key];
          let m: string = '';
          for(const row of Object.keys(fx_obj)){
            const fx_tmp = fx_obj[row];
            const fy_tmp = fy_obj[row];
            const fz_tmp = fz_obj[row];
            const mx_tmp = mx_obj[row];
            const my_tmp = my_obj[row];
            const mz_tmp = mz_obj[row];
            fsecData.push({
              m: (m !== fx_tmp.m) ? fx_tmp.m : '',
              n: fx_tmp.n,
              l: fx_tmp.l,
              fx: fx_tmp.fx,
              fy: fy_tmp.fy,
              fz: fz_tmp.fz,
              mx: mx_tmp.mx,
              my: my_tmp.my,
              mz: mz_tmp.mz
            });
            if(fx_tmp.m !== '') {
              m = fx_tmp.m;
            }
          }
        }

        // スケールの決定に用いる最大値を集計する
        for ( const f of fsecData){
          for (const k of Object.keys(maxValue)){
            if( !(k in f)){
              continue;
            }
            maxValue[k] = Math.max(Math.abs(f[k]), maxValue[k])
          }
        }

        for (const id of memberKeys) {

          // 節点データを集計する
          const m = memberData[id];
          const i = nodeData[m.ni];
          const j = nodeData[m.nj];
          if (i === undefined || j === undefined) {
            continue;
          }

          // 部材の座標軸を取得
          const localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);
          const MemberLength: number = Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2 + (i.z - j.z) ** 2);

          // 着目点
          const fsecPoints: any = new Array();
          let flg = 0;
          const deleteindex: number[] = new Array();
          let currentPosition: number = 0;
          for (let c = 0; c < fsecData.length; c++) {
            const fsec = fsecData[c];
            if ( fsec.m === id) {
              flg++;
              // 1つめのデータは部材情報
              fsecPoints.push({
                id: fsec.m,
                iPosition: i,
                jPosition: j,
                length: MemberLength,
                localAxisX: localAxis.x,
                localAxisY: localAxis.y,
                localAxisZ: localAxis.z
              });
              // ２つめのデータ以降が断面力情報
              currentPosition = this.helper.toNumber(fsec.l);
              fsecPoints.push(this.getFsecPoints(MemberLength, currentPosition, fsec, i, j));
              deleteindex.push(c);
            } else if (flg > 0) {
              if (fsec.m.trim().length > 0) {
                break;
              }
              currentPosition = this.helper.toNumber(fsec.l);
              fsecPoints.push(this.getFsecPoints(MemberLength, currentPosition, fsec, i, j));
              deleteindex.push(c);
            }
          }
          targetList.push(fsecPoints);

          // 登録済のデータは削除する
          for (let d = deleteindex.length - 1; d >= 0; d--) {
            const c = deleteindex[d];
            fsecData.splice(c, 1);
          }

        }

      }

      this.targetData[targetKey] = targetList;
    }

    // スケールの決定に用いる変数を写す
    let minDistance: number;
    let maxDistance: number;
    [minDistance, maxDistance] = this.getDistance();

    for (const k of Object.keys(maxValue)){
      if (!(maxValue[k] === 0)){
        this.targetData[k + '_scale'] = minDistance / maxValue[k];
      } else {
        this.targetData[k + '_scale'] = 1;
      }
    }
    this.gui_max_scale = maxDistance / minDistance;

    // 断面力図を描く
    this.onResize();

  }

  // 断面力, 部材の情報をまとめる
  private getFsecPoints(MemberLength: number,
                        localPosition: number,
                        fsec,
                        i,
                        j) {

    // 断面力の集計
    const axialForce: number = this.helper.toNumber(fsec.fx);
    const shearForceY: number = this.helper.toNumber(fsec.fy);
    const shearForceZ: number = this.helper.toNumber(fsec.fz);
    const torsionalMoment: number = this.helper.toNumber(fsec.mx);
    const momentY: number = this.helper.toNumber(fsec.my);
    const momentZ: number = this.helper.toNumber(fsec.mz);

    // 位置
    const worldPosition = {
      x: (localPosition / MemberLength) * (j.x - i.x) + i.x,
      y: (localPosition / MemberLength) * (j.y - i.y) + i.y,
      z: (localPosition / MemberLength) * (j.z - i.z) + i.z
    };

    return {
      worldPosition, // x, y, x
      localPosition, // 長さ
      axialForce,
      shearForceY,
      shearForceZ,
      torsionalMoment,
      momentY,
      momentZ
    };

  }

  // 断面力図を描く
  private onResize(): void {

    const targetKey: string = this.targetIndex.toString();
    if (!(targetKey in this.targetData)) return;

    let key: string;
    let axis: string;
    let color: THREE.Color;
    let scale: number;

    if (this.params.axialForce === true) {
      // 軸方向の圧縮力
      color = new THREE.Color(0xFF0000);
      key = 'axialForce';
      axis = 'localAxisY';
      scale = this.scale * this.targetData['fx_scale'];
    } else if (this.params.torsionalMoment === true) {
      // ねじり曲げモーメント
      color = new THREE.Color(0xFF0000);
      key = 'torsionalMoment';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['mx_scale'];
    } else if (this.params.shearForceY === true) {
      // Y方向のせん断力
      color = new THREE.Color(0x00FF00);
      key = 'shearForceY';
      axis = 'localAxisY';
      scale = this.scale * this.targetData['fy_scale'];
    } else if (this.params.momentY === true) {
      // Y軸周りの曲げモーメント
      color = new THREE.Color(0x00FF00);
      key = 'momentY';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['my_scale'];
    } else if (this.params.shearForceZ === true) {
      // Z方向のせん断力
      color = new THREE.Color(0x0000FF);
      key = 'shearForceZ';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['fz_scale'];
    } else if (this.params.momentZ === true) {
      // Z軸周りの曲げモーメント
      color = new THREE.Color(0x0000FF);
      key = 'momentZ';
      axis = 'localAxisY';
      scale = this.scale * this.targetData['mz_scale'];
    } else {
      return;
    }

    const tmplineList: Line2[] = this.lineList;

    for (let i = 0; i < this.targetData[targetKey].length; i++) {
      const target = this.targetData[targetKey][i];

      // 断面力のpathを表示
      const memberInfo: any = target[0]; // 1つめのデータは部材情報 (２つめのデータ以降が断面力情報)
      const positions = [];
      const colors = [];
      const danmenryoku = [];
      
      //memberInfoに着目点を追加
      const localPosition_list = [0] ;
      for (let j = 1; j < target.length; j++){
        localPosition_list.push(target[j].localPosition);
      }
      memberInfo["localPosition"] = localPosition_list;

      // i端の座標を登録
      positions.push({
        x: memberInfo.iPosition.x,
        y: memberInfo.iPosition.y,
        z: memberInfo.iPosition.z
      });
      colors.push(color.r, color.g, color.b);
      // 断面力の座標を登録
      let sgn: number;
      for (let j = 1; j < target.length; j++) {
        const force2 = target[j];
        let x2: number = force2.worldPosition.x;
        let y2: number = force2.worldPosition.y;
        let z2: number = force2.worldPosition.z;
        let v2: number = force2.localPosition;
        const f = force2[key];
        if ( f === 0 ) {
          positions.push({x: x2, y: y2, z: z2, v: v2, f: f * scale});
          danmenryoku.push(f);
          continue;
        }

        const sg = Math.sign(f);
        if ( j > 1 && sg !== sgn) {
          // 前回と符号が異なるとき
          const force1 = target[j - 1];
          const f1 = Math.abs(force1[key]);
          const f2 = Math.abs(f);
          const x1: number = force1.worldPosition.x;
          const y1: number = force1.worldPosition.y;
          const z1: number = force1.worldPosition.z;
          const v1: number = force1.localPosition;
          const x0: number = x1 + (((x2 - x1) / (f1 + f2)) * f1);
          const y0: number = y1 + (((y2 - y1) / (f1 + f2)) * f1);
          const z0: number = z1 + (((z2 - z1) / (f1 + f2)) * f1);
          //positions.push({x: x0, y: y0, z: z0, f: 0, note: 'split'});
          const v: number = v1 + (((v2 - v1) / (f1 + f2)) * f1);
          positions.push({x: x0, y: y0, z: z0, v: v, f: 0, note: 'split'});
          colors.push(color.r, color.g, color.b);
        }
        sgn = sg;

        x2 -= f * memberInfo[axis].x * scale;
        y2 -= f * memberInfo[axis].y * scale;
        z2 -= f * memberInfo[axis].z * scale;
        positions.push({x: x2, y: y2, z: z2, f: (-1) * f * scale});
        colors.push(color.r, color.g, color.b);
        danmenryoku.push(f);
      }
      //console.log(positions);
      // j端の座標を登録
      positions.push({
        x: memberInfo.jPosition.x,
        y: memberInfo.jPosition.y,
        z: memberInfo.jPosition.z
      });
      colors.push(color.r, color.g, color.b);
      //console.log(positions);

      if (tmplineList.length > i) {
        // 既にオブジェクトが生成されていた場合
        // line を修正するコード
        const line = tmplineList[i];
        const LineGeo = line['geometry'];

        const LinePositions = [];
        for ( const p of positions) {
          if ('note' in p) {
            continue; // 特殊点は無視
          }
          LinePositions.push(p.x, p.y, p.z);
        }
        LineGeo.setPositions(LinePositions);

        //line.children[0]はテキストのGroup，line.children[1]はメッシュのGroup
        for (let num = 0; num < line.children[0].children.length; num++){
          line.children[0].children[num].position.x = LinePositions[3 * num + 3];
          line.children[0].children[num].position.y = LinePositions[3 * num + 4];
          line.children[0].children[num].position.z = LinePositions[3 * num + 5];
        }
        line.children[1].scale.set(1, 1, this.scale);
        let num2 = 1;
        for (let num1 = 0; num1 < line.children[1].children.length; num1++){
          line.children[1].children[num1].geometry.vertices[0].x = LinePositions[0];
          line.children[1].children[num1].geometry.vertices[0].y = LinePositions[1];
          line.children[1].children[num1].geometry.vertices[0].z = LinePositions[2];
          line.children[1].children[num1].geometry.vertices[1].x = LinePositions[num2 * 3];
          line.children[1].children[num1].geometry.vertices[1].y = LinePositions[num2 * 3 + 1];
          line.children[1].children[num1].geometry.vertices[1].z = LinePositions[num2 * 3 + 2];
          line.children[1].children[num1].geometry.vertices[2].x = LinePositions[num2 * 3 + 3];
          line.children[1].children[num1].geometry.vertices[2].y = LinePositions[num2 * 3 + 4];
          line.children[1].children[num1].geometry.vertices[2].z = LinePositions[num2 * 3 + 5];
          //line.children[1].children[num1].geometry.vertices[0].set = (LinePositions[0], LinePositions[1], LinePositions[2]);
          //line.children[1].children[num1].geometry.vertices[1].set = (LinePositions[num2 * 3 + 0], LinePositions[num2 * 3 + 1], LinePositions[num2 * 3 + 2]);
          //line.children[1].children[num1].geometry.vertices[2].set = (LinePositions[num2 * 3 + 3], LinePositions[num2 * 3 + 4], LinePositions[num2 * 3 + 5]);
          //if (num2 === 3){
            //console.log("---------------------------------");
            //console.log(line.children[1].children[num1]);
            //console.log(positions[num2]);
          //geometry.vertices.push(new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z));
          //geometry.vertices.push(new THREE.Vector3(positions[j].x, positions[j].y, positions[j].z));
          //geometry.vertices.push(new THREE.Vector3(positions[j + 1].x, positions[j + 1].y, positions[j + 1].z));
          //}
          num2 += 1;
        }

        // 文字と面を削除する   ---   このwhile文を削除したい
        //while (line.children.length > 0) {
          //const object = line.children[0];
          //object.parent.remove(object);
        //}

        // テキストを追加
        //this.addTextGeometry(positions, line, danmenryoku, memberInfo[axis]);
        // 面を追加する
        //this.addPathGeometory(positions, line, color);

        let uv_array = new Float32Array( (memberInfo.localPosition.length + 1) * 2 );
        let pos_array = new Float32Array( (memberInfo.localPosition.length + 1) * 3 );
        
        let x_mesh = 0;
        let y_mesh = 0;

        for (let j = 0; j < memberInfo.localPosition.length + 1; j++){
          
          if (j === 0){ //原点データ
            x_mesh = 0;
            y_mesh = 0;

          } else if (j === 1){  //
            if (positions[j].f === 0){
              x_mesh = (memberInfo.localPosition[j] + memberInfo.localPosition[j + 1]) / 2 ;
              y_mesh = (positions[j].f + positions[j + 1].f) / 2;
            } else {
              x_mesh = memberInfo.localPosition[j];
              y_mesh = positions[j].f;
            }

          } else if (j === memberInfo.localPosition.length - 1){
            //最終-1, 最終点目についての分岐
            if (positions[j].f === 0){
              x_mesh = (memberInfo.localPosition[j] + memberInfo.localPosition[j - 1]) / 2 ;
              y_mesh = (positions[j].f + positions[j - 1].f) / 2;
            } else {
              x_mesh = memberInfo.localPosition[j];
              y_mesh = positions[j].f;
            }

          } else if (j === memberInfo.localPosition.length){
            x_mesh = memberInfo.localPosition[j - 1];
            y_mesh = 0;

          } else {
            //その他の点の処理
            x_mesh = memberInfo.localPosition[j];
            y_mesh = positions[j].f;
          }
        
          //数値の数がそろっていない場合有
          uv_array[2 * j + 0] = x_mesh ;
          uv_array[2 * j + 1] = y_mesh ;
          pos_array[3 * j + 0] = x_mesh ;
          pos_array[3 * j + 1] = y_mesh ;
          pos_array[3 * j + 2] = 0 ;

        }
        
        //新しいpositionを配置
        ////面1つでメッシュを表現
        line.children[1].geometry.attributes.position.array = pos_array ;
        line.children[1].geometry.attributes.uv.array = uv_array ;

        ////メッシュを線で表現
        for (let j = 0; j < line.children[2].children.length; j++){
          const new_position = new Float32Array(6);
          new_position[0] = memberInfo.localPosition[j + 1];
          new_position[1] = 0;
          new_position[2] = 0;
          new_position[3] = memberInfo.localPosition[j + 1];
          new_position[4] = positions[j + 1].f;
          new_position[5] = 0;
          line.children[2].children[j].geometry.attributes.position.array = new_position;

          line.children[2].children[j].geometry.attributes.position.needsUpdate = true;
        }

        ////メッシュを複数のメッシュで表現
        let vertice1 = new Float32Array(9);
        let vertice2 = new Float32Array(9);
        let point1 = new Float32Array(2);
        let point2 = new Float32Array(2);
        let point3 = new Float32Array(2);
        let split_count = 0;

        for (let j = 0; j < line.children[3].children.length - 0; j++){

          //頂点座標の整理
          point1[0] = memberInfo.localPosition[j + 1];
          point1[1] = positions[j + 1 + split_count].f;
          if (positions[j + 2 + split_count].note === "split"){
            split_count += 1;
          }
          point2[0] = memberInfo.localPosition[j + 1 + 1];
          if (positions[j + 1 + split_count].note === "split"){
            point2[1] = positions[j + 1 + 1 + split_count].f;
            point3[0] = positions[j + 1 + split_count].v;
            point3[1] = positions[j + 1 + split_count].f;
          } else {
            point2[1] = positions[j + 1 + 1 + split_count].f;
            point3[0] = memberInfo.localPosition[j + 1 + 1];
            point3[1] = positions[j + 1 + 1 + split_count].f;
          }

          if (point1[1] * point2[1] > 0) {
            vertice1 = new Float32Array([
              point1[0],         0, 0,
              point1[0], point1[1], 0,
              point2[0],         0, 0
            ]);
            vertice2 = new Float32Array([
              point1[0], point1[1], 0,
              point2[0],         0, 0,
              point2[0], point2[1], 0
            ]);
          } else if (point1[1] * point2[1] <= 0) {
            vertice1 = new Float32Array([
              point1[0],         0, 0,
              point1[0], point1[1], 0,
              point3[0],         0, 0
            ]);
            vertice2 = new Float32Array([
              point3[0], point3[1], 0,
              point2[0],         0, 0,
              point2[0], point2[1], 0
            ]);
          }
          line.children[3].children[j].children[0].geometry.attributes.position.array = vertice1;
          line.children[3].children[j].children[1].geometry.attributes.position.array = vertice2;
          line.children[3].children[j].children[0].geometry.attributes.position.needsUpdate = true;
          line.children[3].children[j].children[1].geometry.attributes.position.needsUpdate = true;

          line.children[3].children[j].children[0].visible = true;
          line.children[3].children[j].children[1].visible = true;
          if(point1[1] === 0){
            line.children[3].children[j].children[0].visible = false;
          }
          if(point2[1] === 0){
            line.children[3].children[j].children[1].visible = false;
          }

        }

        const lookatX = memberInfo.localAxisX.x + positions[0].x;
        const lookatY = memberInfo.localAxisX.y + positions[0].y;
        const lookatZ = memberInfo.localAxisX.z + positions[0].z;
        //axialForceのとき
        if (key === 'axialForce'){
          line.children[1].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[1].rotateZ(Math.PI * 3 / 2);
          line.children[1].rotateY(Math.PI * 3 / 2);
          line.children[2].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[2].rotateZ(Math.PI * 3 / 2);
          line.children[2].rotateY(Math.PI * 3 / 2);
          line.children[3].lookAt(lookatX, lookatY, lookatZ);
          line.children[3].rotateZ(Math.PI * 3 / 2);
          line.children[3].rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            line.children[3].rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceY'){
          line.children[1].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[1].rotateZ(Math.PI * 3 / 2);
          line.children[1].rotateY(Math.PI * 3 / 2);
          line.children[2].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[2].rotateZ(Math.PI * 3 / 2);
          line.children[2].rotateY(Math.PI * 3 / 2);
          line.children[3].lookAt(lookatX, lookatY, lookatZ);
          line.children[3].rotateZ(Math.PI * 3 / 2);
          line.children[3].rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            line.children[3].rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceZ'){
          line.children[1].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); //ここ
          line.children[1].rotateY(Math.PI * 3 / 2);
          line.children[2].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); //ここ
          line.children[2].rotateY(Math.PI * 3 / 2);
          line.children[3].lookAt(lookatX, lookatY, lookatZ); //ここ
          line.children[3].rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            line.children[3].rotateX(Math.PI * 3 / 2);
          }
        //momentYのとき
        } else if (key === 'momentY'){
          line.children[1].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); //ここ
          line.children[1].rotateY(Math.PI * 3 / 2);
          line.children[2].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); //ここ
          line.children[2].rotateY(Math.PI * 3 / 2);
          line.children[3].lookAt(lookatX, lookatY, lookatZ); //ここ
          line.children[3].rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            line.children[3].rotateX(Math.PI * 3 / 2);
          }
        //momentZのとき
        } else if (key === 'momentZ'){
          line.children[1].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[1].rotateZ(Math.PI * 3 / 2);
          line.children[1].rotateY(Math.PI * 3 / 2);
          line.children[2].lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z);
          line.children[2].rotateZ(Math.PI * 3 / 2);
          line.children[2].rotateY(Math.PI * 3 / 2);
          line.children[3].lookAt(lookatX, lookatY, lookatZ);
          line.children[3].rotateZ(Math.PI * 3 / 2);
          line.children[3].rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            line.children[3].rotateX(Math.PI * 3 / 2);
          }
        }

        line.children[1].geometry.attributes.position.needsUpdate = true;
        line.children[1].visible = false;
        line.children[2].visible = false;

      } else {
        // 線を生成する
        const LinePositions = [];
        for ( const p of positions) {
          if ('note' in p) {
            continue; // 特殊点は無視
          }
          LinePositions.push(p.x, p.y, p.z);
        }
        const line = this.createLineGeometory(LinePositions, colors);
        // テキストを追加
        this.addTextGeometry(positions, line, danmenryoku, memberInfo[axis]);
        // 面を追加する
        this.addPathGeometory(positions, line, colors, memberInfo);
        // シーンに追加する
        tmplineList.push(line);
        this.scene.add(line);
      }
    }
    this.lineList = tmplineList;
  }

  // 断面力の線を(要素ごとに)描く
  private createLineGeometory(positions: any[], colors: any[]): Line2 {

    // 線を追加
    const geometry: LineGeometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    const matLine: LineMaterial = new LineMaterial({
      color: 0xFF0000,
      linewidth: 0.001,
      vertexColors: THREE.VertexColors,
      dashed: false
    });

    const line: Line2 = new Line2(geometry, matLine);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);

    return line;
  }

  // テキストを追加
  private addTextGeometry(positions: any[], line: THREE.Line, danmenryoku: number[], localAxis: any): void {
    let j = 0;
    const textGroup = new THREE.Group();
    for ( let i = 1; i < positions.length - 1; i++) {
      const p = positions[i];
      if ('note' in p) {
        continue; // 特殊点は無視
      }

      const pos = {
        x: p.x,
        y: p.y,
        z: p.z,
      };

      // 数値を更新
      const DanmentyokuText = danmenryoku[j].toFixed(2);
      const TextGeometry = new THREE.TextGeometry(
        DanmentyokuText, {
        font: this.font,
        size: 0.2,
        height: 0.002,
        curveSegments: 4,
        bevelEnabled: false,
      });

      // TextGeometry.rotateX(Math.PI / 2);
      TextGeometry.rotateY(-Math.PI / 2);
      // TextGeometry.rotateZ(-Math.PI / 2);

      const matText = [
        new THREE.MeshBasicMaterial({ color: 0x000000 }),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      ];
      const text = new THREE.Mesh(TextGeometry, matText);
      // 数値をx-y平面の状態から，x-z平面の状態に回転
      text.lookAt(localAxis.x, localAxis.y, localAxis.z);

      // text.rotation.x = Math.PI / 2;
      // 数値を任意の位置に配置
      text.position.set(pos.x, pos.y, pos.z);
      text.name = "text"; //デバック用
      //line.add(text);
      textGroup.add(text);
      j++;
    }
    line.add(textGroup);
  }

  // 面を追加する
  private addPathGeometory(positions: any[], line: THREE.Line, color: any, memberInfo: any): void {

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00aaff,
      //color: 0x222222,
      opacity: 0.2
    });
/*  //meshの時の残骸
    let i = 0;
    const meshGroup = new THREE.Group();
    meshGroup.name = "mesh"; //デバック用
    for ( let j = 1; j < positions.length - 1; j++ ) {
      const geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z));
      geometry.vertices.push(new THREE.Vector3(positions[j].x, positions[j].y, positions[j].z));
      geometry.vertices.push(new THREE.Vector3(positions[j + 1].x, positions[j + 1].y, positions[j + 1].z));
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      //line.add(mesh);
      meshGroup.add(mesh);
      if ( 'note' in positions[j + 1]) {
        i = j + 1;
        j++;
      }
    }
    line.add(meshGroup);*/

    //ねじれると最後に残る側だけが残る
    const shapegroup = new THREE.Group();
    const shape = new THREE.Shape();
    shapegroup.name = "shape"; //デバック用

    shape.moveTo(0, 0);
    //メッシュの端点が0のとき分岐
    for (let i = 1; i < memberInfo.localPosition.length; i++){
      if (i === 1){
        //1, 2点目についての分岐
        if (positions[i].f === 0){
          shape.lineTo( (memberInfo.localPosition[i] + memberInfo.localPosition[i + 1]) / 2
                      , (positions[i].f + positions[i + 1].f) / 2);
        } else {
          shape.lineTo(memberInfo.localPosition[i], positions[i].f);
        }
      } else if (i === memberInfo.localPosition.length - 1){
        //最終-1, 最終点目についての分岐
        if (positions[i].f === 0){
          shape.lineTo((memberInfo.localPosition[i] + memberInfo.localPosition[i - 1]) / 2
                      , (positions[i].f + positions[i - 1].f) / 2);
        } else {
          shape.lineTo(memberInfo.localPosition[i], positions[i].f);
        }
      } else {
        //その他の点の処理
        shape.lineTo(memberInfo.localPosition[i], positions[i].f);
      }
      if (positions[i].f === undefined){
        //console.log(memberInfo, positions[i]);
        continue;
      }
    }
    shape.lineTo( memberInfo.localPosition[memberInfo.localPosition.length - 1]
                , positions[memberInfo.localPosition.length - 1].f );
    shape.lineTo(0,0);

    const geometry = new THREE.ShapeBufferGeometry(shape);
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); 
    mesh.rotateY(Math.PI/ 2 * 3); //ワールド座標で回転=ワールド座標におけるこの要素の向きが必要
    mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
    mesh.visible = false;
    line.add(mesh);


    //メッシュを線で代用するchildren[2]
    const line_mesh = new THREE.Group();
    line_mesh.name = "line_mesh";
    let linegeometry = new THREE.BufferGeometry();
    const linematerial = new THREE.LineBasicMaterial({
      color: 0x00aaff ,
      linewidth: 10
    });
    for (let i = 1; i < memberInfo.localPosition.length; i++){
      linegeometry = new THREE.BufferGeometry();
      let vertices = new Float32Array([
        memberInfo.localPosition[i], 0, 0,                  // 始点の頂点座標
        memberInfo.localPosition[i], positions[i].f , 0,    // 終点の頂点座標
      ]);
      linegeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3) );
      const line_piece = new THREE.Line( linegeometry, linematerial );
      line_mesh.add(line_piece);
    }
    line_mesh.lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); 
    line_mesh.rotateY(Math.PI/ 2 * 3); //ワールド座標で回転=ワールド座標におけるこの要素の向きが必要
    line_mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
    line_mesh.visible = false;
    line.add(line_mesh);


    //meshで台形を作成して代用するchildren[3]
    const mesh_mesh = new THREE.Group();
    mesh_mesh.name = "mesh_mesh";
    const meshmaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00aaff,
      opacity: 0.2
    });

    let vertice1 = new Float32Array(9);
    let vertice2 = new Float32Array(9);
    let point1 = new Float32Array(2);
    let point2 = new Float32Array(2);
    let point3 = new Float32Array(2);
    let split_count = 0;
    for (let i = 1; i < positions.length - 2; i++){
      const mesh_mesh_mesh = new THREE.Group();
      let meshgeometry1 = new THREE.BufferGeometry();
      let meshgeometry2 = new THREE.BufferGeometry();

      //頂点座標の整理
      if (positions[i].note === "split"){
        split_count += 1;
        continue;
      }

      point1[0] = memberInfo.localPosition[i - split_count];
      point1[1] = positions[i].f;
      point2[0] = memberInfo.localPosition[i - split_count + 1];
      if (positions[i + 1].note === "split"){
        point2[1] = positions[i + 2].f;
        point3[0] = positions[i + 1].v;
        point3[1] = positions[i + 1].f;
      } else {
        point2[1] = positions[i + 1].f;
        //point2[1] = 0のとき使用する点はpoint3になっている
        point3[0] = memberInfo.localPosition[i - split_count + 1];
        point3[1] = positions[i + 1].f;
      }
      //頂点座標を入力
      if (point1[1] * point2[1] > 0) {
        vertice1 = new Float32Array([
          point1[0],         0, 0,
          point1[0], point1[1], 0,
          point2[0],         0, 0
        ]);
        vertice2 = new Float32Array([
          point1[0], point1[1], 0,
          point2[0],         0, 0,
          point2[0], point2[1], 0
        ]);
      } if (point1[1] * point2[1] <= 0) {
        vertice1 = new Float32Array([
          point1[0],         0, 0,
          point1[0], point1[1], 0,
          point3[0],         0, 0
        ]);
        vertice2 = new Float32Array([
          point3[0], point3[1], 0,
          point2[0],         0, 0,
          point2[0], point2[1], 0
        ]);
      }
      meshgeometry1.setAttribute('position', new THREE.BufferAttribute(vertice1, 3));
      mesh_mesh_mesh.add(new THREE.Mesh(meshgeometry1, meshmaterial));
      meshgeometry2.setAttribute('position', new THREE.BufferAttribute(vertice2, 3));
      mesh_mesh_mesh.add(new THREE.Mesh(meshgeometry2, meshmaterial));

      if (point1[1] === 0) {
        mesh_mesh_mesh.children[0].visible = false;
      }
      if (point2[1] === 0) {
        mesh_mesh_mesh.children[1].visible = false;
      }

      mesh_mesh.add(mesh_mesh_mesh);
    }

    mesh_mesh.lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); 
    mesh_mesh.rotateY(Math.PI/ 2 * 3); //ワールド座標で回転=ワールド座標におけるこの要素の向きが必要
    mesh_mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
    line.add(mesh_mesh);

  }

  private getDistance(): number[] {
    let minDistance: number = Number.MAX_VALUE;
    let maxDistance: number = 0;

    const member: object = this.member.getMemberJson(0);
    for ( const memberNo of Object.keys(member)){
      const l: number = this.member.getMemberLength(memberNo);
      minDistance = Math.min(l, minDistance);
      maxDistance = Math.max(l, maxDistance);
    }

    return [minDistance, maxDistance];
  }
}

