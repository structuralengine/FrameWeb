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
import { Mesh } from 'three';


@Injectable({
  providedIn: 'root'
})
export class ThreeSectionForceService {

  private lineList: THREE.Object3D;
  private currentIndex: string;
  private currentMode: string;

  private scale: number;
  private params: any;   // GUIの表示制御
  private radioButtons = ['axialForce', 'shearForceY', 'shearForceZ', 'torsionalMoment', 'momentY', 'momentZ'];
  private gui: any;
  private font: THREE.Font;

  private material: THREE.MeshBasicMaterial;
  private matLine: LineMaterial;
  private Red: THREE.Color;
  private Green: THREE.Color;
  private Blue: THREE.Color;

  private nodeData: any;
  private memberData: any;
  private fsecData: any;

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private node: InputNodesService,
              private member: InputMembersService,
              private three_node: ThreeNodesService,
              private three_member: ThreeMembersService) {

    this.lineList = new THREE.Object3D();
    this.lineList.visible = false; // 呼び出されるまで非表示
    this.ClearData();
    this.scene.add(this.lineList);

    // フォントをロード
    const loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      this.ClearData();
    });

    // gui
    this.scale = 100;
    this.params = {
      forceScale: this.scale
    };
    for (const key of this.radioButtons) {
      this.params[key] = false;
    }
    this.params.momentY = true; // 初期値
    this.gui = null;

    // three オブジェクトせあらかじめ生成できるものはしておく
    this.material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00aaff,
      opacity: 0.2
    });
    this.matLine = new LineMaterial({
      color: 0xFF0000,
      linewidth: 0.001,
      vertexColors: THREE.VertexColors,
      dashed: false
    });
    this.Red = new THREE.Color(0xFF0000);
    this.Green = new THREE.Color(0x00FF00);
    this.Blue = new THREE.Color(0x0000FF);
  }

  public visibleChange(flag: boolean): void {
    if (this.lineList.visible=== flag) {
      return;
    }
    this.lineList.visible = flag;
    if (flag === true) {
      this.guiEnable();
    } else {
      this.guiDisable();
    }
  }

  // データをクリアする
  public ClearData(): void {
    for (const mesh of this.lineList.children) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
      }
    }
    // オブジェクトを削除する
    this.lineList.children = new Array();
  }

  private guiEnable(): void {
    if (this.gui !== null) {
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
  public setResultData(fsecJson: any): void {
    this.nodeData = this.node.getNodeJson(0);
    this.memberData = this.member.getMemberJson(0);
    this.fsecData = {fsec: fsecJson};
    this.createMesh('fsec');
  }
  // combine
  public setCombResultData(fsecJson: any): void {
    this.fsecData['comb_fsec'] = fsecJson;
  }
  // pick up
  public setPickupResultData(fsecJson: any): void {
    this.fsecData['pik_fsec'] = fsecJson;
  }

  // 既定のメッシュを作成する
  private createMesh(ModeName: string): void{

    // 格点データを入手
    if (Object.keys(this.nodeData).length <= 0) {
      return;
    }
    // メンバーデータを入手
    const memberKeys = Object.keys(this.memberData);
    if (memberKeys.length <= 0) {
      return;
    }

    // 最初のケースを代表として描画する
    const fsecData = Object.entries(this.fsecData[ModeName])[0];

    let localAxis: any;
    let MemberLength: number;
    for(const fsec of fsecData){
      const id = fsec['m'].trim();
      if( id.length > 0 ){
          // 節点データを集計する
          const m = this.memberData[id];
          const i = this.nodeData[m.ni];
          const j = this.nodeData[m.nj];
          if (i === undefined || j === undefined) {
            continue;
          }
          // 部材の座標軸を取得
          localAxis = this.three_member.localAxis(i.x, i.y, i.z, j.x, j.y, j.z, m.cg);
          MemberLength = Math.sqrt((i.x - j.x) ** 2 + (i.y - j.y) ** 2 + (i.z - j.z) ** 2);
      }
      
    }
    /*
    // 断面力を作成する
    const targetList = new Array();
    for (const id of memberKeys) {

      // 節点データを集計する
      const m = this.memberData[id];
      const i = this.nodeData[m.ni];
      const j = this.nodeData[m.nj];
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

    // メッシュを作成する
    const key: string = 'shearForceZ';  // 仮の数値
    const axis: string = 'localAxisZ';  // 仮の数値
    const color = this.Blue;            // 仮の数値
    const scale: number = this.scale;   // 仮の数値
    for (let i = 0; i < targetList.length; i++) {
      const target = targetList[i];

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
      // j端の座標を登録
      positions.push({
        x: memberInfo.jPosition.x,
        y: memberInfo.jPosition.y,
        z: memberInfo.jPosition.z
      });
      colors.push(color.r, color.g, color.b);

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

        ////メッシュを複数のメッシュで表現
        let vertice1 = new Float32Array(9);
        let vertice2 = new Float32Array(9);
        let point1 = new Float32Array(2);
        let point2 = new Float32Array(2);
        let point3 = new Float32Array(2);
        let split_count = 0;

        const mesh = line.children[0];
        for (let j = 0; j < mesh.children.length - 0; j++){

          //頂点座標の整理
          point1[0] = memberInfo.localPosition[j + 1];
          point1[1] = positions[j + 1 + split_count].f;
          if (positions[j + 2 + split_count].note === "split"){
            split_count += 1;
          }
          point2[0] = memberInfo.localPosition[j + 2];
          if (positions[j + 1 + split_count].note === "split"){
            point2[1] = positions[j + 2 + split_count].f;
            point3[0] = positions[j + 1 + split_count].v;
            point3[1] = positions[j + 1 + split_count].f;
          } else {
            point2[1] = positions[j + 2 + split_count].f;
            point3[0] = memberInfo.localPosition[j + 2];
            point3[1] = positions[j + 2 + split_count].f;
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
          mesh.children[j].children[0].geometry.attributes.position.array = vertice1;
          mesh.children[j].children[1].geometry.attributes.position.array = vertice2;
          mesh.children[j].children[0].geometry.attributes.position.needsUpdate = true;
          mesh.children[j].children[1].geometry.attributes.position.needsUpdate = true;

          mesh.children[j].children[0].visible = true;
          mesh.children[j].children[1].visible = true;
          if(point1[1] === 0){
            mesh.children[j].children[0].visible = false;
          }
          if(point2[1] === 0){
            mesh.children[j].children[1].visible = false;
          }

        }

        //keyの変更後のmeshの向きを指定する
        const lookatX = memberInfo.localAxisX.x + positions[0].x;
        const lookatY = memberInfo.localAxisX.y + positions[0].y;
        const lookatZ = memberInfo.localAxisX.z + positions[0].z;
        //axialForceのとき
        if (key === 'axialForce'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceY'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceZ'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //torsionalMomentのとき
        } else if (key === 'torsionalMoment'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //momentYのとき
        } else if (key === 'momentY'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //momentZのとき
        } else if (key === 'momentZ'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        }

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
        // this.addTextGeometry(positions, line, danmenryoku, memberInfo[axis]);
        // 面を追加する
        this.addPathGeometory(positions, line, colors, memberInfo);
        // シーンに追加する
        tmplineList.push(line);
        this.scene.add(line);
        //ここでスケーリングをしていないためguiを変更する前の小さな大きさになってしまう．
      }
    }
    this.lineList = tmplineList;
*/
  }



  // データが変更された時に呼び出される
  // 変数 this.targetData に値をセットする
  public changeData(index: number, ModeName: string): void {
/*
    if (this.currentMode === ModeName && this.currentIndex === index.toString()) {
      // ケースが同じなら何もしない
      return;
    }

    this.currentIndex = index.toString();
    this.currentMode = ModeName;
    if (this.lineList.length > 0) {
      // 既に Geometryを作成していたら リサイズするだけ
      this.onResize();
      return;
    }

    // ↓↓↓ 初めて描く場合



    // 断面力データを入手
    const allFsecgData: object = this.fsecData[ModeName];

    if (!(this.currentIndex in allFsecgData)) {
      return;      // 荷重Case番号 this.currentIndex が 計算結果 this.targetData に含まれていなかったら何もしない
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
*/
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
/*
    const targetKey: string = this.currentIndex.toString();
    if (!(targetKey in this.targetData)) return;

    let key: string;
    let axis: string;
    let color: THREE.Color;
    let scale: number;

    if (this.params.axialForce === true) {
      // 軸方向の圧縮力
      color = this.Red;
      key = 'axialForce';
      axis = 'localAxisY';
      scale = this.scale * this.targetData['fx_scale'];
    } else if (this.params.torsionalMoment === true) {
      // ねじり曲げモーメント
      color = this.Red;
      key = 'torsionalMoment';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['mx_scale'];
    } else if (this.params.shearForceY === true) {
      // Y方向のせん断力
      color = this.Green;
      key = 'shearForceY';
      axis = 'localAxisY';
      scale = this.scale * this.targetData['fy_scale'];
    } else if (this.params.momentY === true) {
      // Y軸周りの曲げモーメント
      color = this.Green;
      key = 'momentY';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['my_scale'];
    } else if (this.params.shearForceZ === true) {
      // Z方向のせん断力
      color = this.Blue;
      key = 'shearForceZ';
      axis = 'localAxisZ';
      scale = this.scale * this.targetData['fz_scale'];
    } else if (this.params.momentZ === true) {
      // Z軸周りの曲げモーメント
      color = this.Blue;
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
      // j端の座標を登録
      positions.push({
        x: memberInfo.jPosition.x,
        y: memberInfo.jPosition.y,
        z: memberInfo.jPosition.z
      });
      colors.push(color.r, color.g, color.b);

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

        ////メッシュを複数のメッシュで表現
        let vertice1 = new Float32Array(9);
        let vertice2 = new Float32Array(9);
        let point1 = new Float32Array(2);
        let point2 = new Float32Array(2);
        let point3 = new Float32Array(2);
        let split_count = 0;

        const mesh = line.children[0];
        for (let j = 0; j < mesh.children.length - 0; j++){

          //頂点座標の整理
          point1[0] = memberInfo.localPosition[j + 1];
          point1[1] = positions[j + 1 + split_count].f;
          if (positions[j + 2 + split_count].note === "split"){
            split_count += 1;
          }
          point2[0] = memberInfo.localPosition[j + 2];
          if (positions[j + 1 + split_count].note === "split"){
            point2[1] = positions[j + 2 + split_count].f;
            point3[0] = positions[j + 1 + split_count].v;
            point3[1] = positions[j + 1 + split_count].f;
          } else {
            point2[1] = positions[j + 2 + split_count].f;
            point3[0] = memberInfo.localPosition[j + 2];
            point3[1] = positions[j + 2 + split_count].f;
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
          mesh.children[j].children[0].geometry.attributes.position.array = vertice1;
          mesh.children[j].children[1].geometry.attributes.position.array = vertice2;
          mesh.children[j].children[0].geometry.attributes.position.needsUpdate = true;
          mesh.children[j].children[1].geometry.attributes.position.needsUpdate = true;

          mesh.children[j].children[0].visible = true;
          mesh.children[j].children[1].visible = true;
          if(point1[1] === 0){
            mesh.children[j].children[0].visible = false;
          }
          if(point2[1] === 0){
            mesh.children[j].children[1].visible = false;
          }

        }

        //keyの変更後のmeshの向きを指定する
        const lookatX = memberInfo.localAxisX.x + positions[0].x;
        const lookatY = memberInfo.localAxisX.y + positions[0].y;
        const lookatZ = memberInfo.localAxisX.z + positions[0].z;
        //axialForceのとき
        if (key === 'axialForce'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceY'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //shearForceZのとき
        } else if (key === 'shearForceZ'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //torsionalMomentのとき
        } else if (key === 'torsionalMoment'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //momentYのとき
        } else if (key === 'momentY'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        //momentZのとき
        } else if (key === 'momentZ'){
          mesh.lookAt(lookatX, lookatY, lookatZ);
          mesh.rotateZ(Math.PI * 3 / 2);
          mesh.rotateY(Math.PI * 3 / 2);
          if (memberInfo.localAxisX.x === 0 && memberInfo.localAxisX.y === 0){
            mesh.rotateX(Math.PI * 3 / 2);
          }
        }

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
        // this.addTextGeometry(positions, line, danmenryoku, memberInfo[axis]);
        // 面を追加する
        this.addPathGeometory(positions, line, colors, memberInfo);
        // シーンに追加する
        tmplineList.push(line);
        this.scene.add(line);
        //ここでスケーリングをしていないためguiを変更する前の小さな大きさになってしまう．
      }
    }
    this.lineList = tmplineList;
*/
  }

  // 断面力の線を(要素ごとに)描く
  private createLineGeometory(positions: any[], colors: any[]): Line2 {

    // 線を追加
    const geometry: LineGeometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);
    /*
    const matLine: LineMaterial = new LineMaterial({
      color: 0xFF0000,
      linewidth: 0.001,
      vertexColors: THREE.VertexColors,
      dashed: false
    });
    */
    const line: Line2 = new Line2(geometry, this.matLine);
    line.computeLineDistances();
    line.scale.set(1, 1, 1);

    return line;
  }

  /*/ テキストを追加
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
  */

  // 面を追加する
  private addPathGeometory(positions: any[], line: THREE.Line, color: any, memberInfo: any): void {

    //meshで台形を作成して代用するchildren[1]
    const mesh = new THREE.Group();
    mesh.name = "mesh";
    /*
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: 0x00aaff,
      opacity: 0.2
    });
    */
    
    let vertice1 = new Float32Array(9);
    let vertice2 = new Float32Array(9);
    let point1 = new Float32Array(2);
    let point2 = new Float32Array(2);
    let point3 = new Float32Array(2);
    let split_count = 0;
    for (let i = 1; i < positions.length - 2; i++){
      const mesh_child = new THREE.Group();
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
      mesh_child.add(new THREE.Mesh(meshgeometry1, this.material));
      meshgeometry2.setAttribute('position', new THREE.BufferAttribute(vertice2, 3));
      mesh_child.add(new THREE.Mesh(meshgeometry2, this.material));

      if (point1[1] === 0) {
        mesh_child.children[0].visible = false;
      }
      if (point2[1] === 0) {
        mesh_child.children[1].visible = false;
      }

      mesh.add(mesh_child);
    }

    mesh.lookAt(memberInfo.localAxisX.x, memberInfo.localAxisX.y, memberInfo.localAxisX.z); 
    mesh.rotateY(Math.PI/ 2 * 3); //ワールド座標で回転=ワールド座標におけるこの要素の向きが必要
    mesh.position.set(positions[0].x, positions[0].y, positions[0].z);
    line.add(mesh);

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

