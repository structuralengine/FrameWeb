import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';
import { InputMembersService } from '../../../components/input/input-members/input-members.service';

import { ResultDisgService } from '../../result/result-disg/result-disg.service';
import { ResultCombineDisgService } from '../../result/result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgService } from '../../result/result-pickup-disg/result-pickup-disg.service';


@Injectable({
  providedIn: 'root'
})
export class ThreeDisplacementService {

  private lineList: THREE.Line[];
  private targetData: any;

  private scale: number;
  private params: any;          // GUIの表示制御
  private gui: any;

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private disg: ResultDisgService,
              private comb_disg: ResultCombineDisgService,
              private pik_disg: ResultPickupDisgService,
              private node: InputNodesService,
              private member: InputMembersService) {
    this.lineList = new Array();
    this.targetData = new Array();

    this.scale = 0.001;
    // gui
    this.params = {
      dispScale: this.scale
    };
    this.gui = null;
  }

  // データをクリアする
  public ClearData(): void {
    if ( this.lineList.length > 0 ){
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
  }

  public guiEnable(): void {
    if ( this.gui !== null ) {
      return;
    }
    this.gui = this.scene.gui.add( this.params, 'dispScale', 0, 1 ).step(0.01).onChange( ( value ) => {
      // guiによる設定
      this.scale = value;
      this.onResize();
    });
  }

  public guiDisable(): void {
    if ( this.gui === null ) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
}

  public chengeData(index: number): void {

    // 格点データを入手
    const nodeData = this.node.getNodeJson('calc');
    const nodeKeys = Object.keys(nodeData);
    if (nodeKeys.length <= 0) {
      return;
    }

    // メンバーデータを入手
    const jsonData = this.member.getMemberJson('calc');
    const jsonKeys = Object.keys(jsonData);
    if (jsonKeys.length <= 0) {
      return;
    }

    // 変位データを入手
    const allDisgData = this.disg.getDisgJson();
    const targetKey: string = index.toString();
    if ( !(targetKey in allDisgData) ) {
      return;
    }
    const disgData = allDisgData[targetKey];

    this.targetData = new Array();

    // 新しい入力を適用する
    for (const key of jsonKeys) {

      // 節点データを集計する
      const member = jsonData[key];
      const i = nodeData[member.ni];
      const j = nodeData[member.nj];
      if (i === undefined || j === undefined) {
        continue;
      }

      const disgKeys = Object.keys(disgData);
      if (disgKeys.length <= 0) {
        return;
      }

      const di: any = disgData.find((tmp) => {
        return tmp.id === member.ni.toString();
      });
      const dj: any =  disgData.find((tmp) => {
        return tmp.id === member.nj.toString();
      });

      if (di === undefined || dj === undefined) {
        continue;
      }

      this.targetData.push(
        {
          name: key,
          xi: i.x,
          yi: i.y,
          zi: i.z,
          xj: j.x,
          yj: j.y,
          zj: j.z,
          dxi: this.helper.toNumber(di.dx),
          dyi: this.helper.toNumber(di.dy),
          dzi: this.helper.toNumber(di.dz),
          dxj: this.helper.toNumber(dj.dx),
          dyj: this.helper.toNumber(dj.dy),
          dzj: this.helper.toNumber(dj.dz)
        }
      );
    }
    this.onResize();
  }

  private onResize(): void {

    // 要素を排除する
    this.ClearData();

    for ( const target of this.targetData ) {

      let xi: number = target.xi;
      let yi: number = target.yi;
      let zi: number = target.zi;

      xi += target.dxi * this.scale;
      yi += target.dyi * this.scale;
      zi += target.dzi * this.scale;

      let xj: number = target.xj;
      let yj: number = target.yj;
      let zj: number = target.zj;

      xj += target.dxj * this.scale;
      yj += target.dyj * this.scale;
      zj += target.dzj * this.scale;

      const positions = [];
      positions.push( xi, yi, zi );
      positions.push( xj, yj, zj );

      const threeColor = new THREE.Color(0xFF0000);
      const colors = [];
      colors.push( threeColor.r, threeColor.g, threeColor.b );
      colors.push( threeColor.r, threeColor.g, threeColor.b );

      const geometry: LineGeometry = new LineGeometry();
      geometry.setPositions( positions );
      geometry.setColors( colors );

      const matLine: LineMaterial = new LineMaterial( {
        color: 0xFF0000,
        linewidth: 0.001,
        vertexColors: THREE.VertexColors,
        dashed: false
      });
      const line: Line2 = new Line2( geometry, matLine );
      line.computeLineDistances();

      line.scale.set( 1, 1, 1 );
      line.name = target.name;

      this.lineList.push(line);

      this.scene.add( line );
    }
  }
}
