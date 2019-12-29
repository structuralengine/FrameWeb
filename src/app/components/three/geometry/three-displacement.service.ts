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
  private scale: number;

  constructor(private helper: DataHelperModule,
              private disg: ResultDisgService,
              private comb_disg: ResultCombineDisgService,
              private pik_disg: ResultPickupDisgService,
              private node: InputNodesService,
              private member: InputMembersService) { 
                this.lineList = new Array();
                this.scale = 0.001;
              }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    if ( this.lineList.length > 0 ){
      // 線を削除する
      for (const mesh of this.lineList) {
        // 文字を削除する
        while (mesh.children.length > 0) {
          const object = mesh.children[0];
          object.parent.remove(object);
        }
        scene.remove(mesh);
      }
      this.lineList = new Array();
    }
  }


  public chengeData(scene: SceneService, index: number): void {

    // 要素を排除する
    this.ClearData(scene);

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

      let xi: number = i.x;
      let yi: number = i.y;
      let zi: number = i.z;

      xi += this.helper.toNumber(di.dx) * this.scale;
      yi += this.helper.toNumber(di.dy) * this.scale;
      zi += this.helper.toNumber(di.dz) * this.scale;

      let xj: number = j.x;
      let yj: number = j.y;
      let zj: number = j.z;

      xj += this.helper.toNumber(dj.dx) * this.scale;
      yj += this.helper.toNumber(dj.dy) * this.scale;
      zj += this.helper.toNumber(dj.dz) * this.scale;

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
      } );
      const line: Line2 = new Line2( geometry, matLine );
      line.computeLineDistances();

      line.scale.set( 1, 1, 1 );
      line.name = key;

      this.lineList.push(line);

      scene.add( line );
    }
  }


}
