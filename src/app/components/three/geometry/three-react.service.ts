import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { Line2 } from '../libs/Line2.js';
import { LineMaterial } from '../libs/LineMaterial.js';
import { LineGeometry } from '../libs/LineGeometry.js';

import { SceneService } from '../scene.service';

import { DataHelperModule } from '../../../providers/data-helper.module';

import { InputNodesService } from '../../../components/input/input-nodes/input-nodes.service';

import { ResultReacService } from '../../result/result-reac/result-reac.service';
import { ResultCombineReacService } from '../../result/result-combine-reac/result-combine-reac.service';
import { ResultPickupReacService } from '../../result/result-pickup-reac/result-pickup-reac.service';
import { ThreeNodesService } from './three-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeReactService {

  private isVisible: boolean;
  private pointLoadList: any[];
  private selectionItem: THREE.Mesh;     // 選択中のアイテム

  constructor(private scene: SceneService,
              private helper: DataHelperModule,
              private nodeThree: ThreeNodesService,
              private node: InputNodesService,
              private reac: ResultReacService,
              private comb_disg: ResultCombineReacService,
              private pik_disg: ResultPickupReacService) {

      this.isVisible = null;
      this.pointLoadList = new Array();
      this.selectionItem = null;
    }

    public visible(flag: boolean): void {
      if ( this.isVisible === flag) {
        return;
      }
      for (const mesh of this.pointLoadList) {
        mesh.visible = flag;
      }
      this.isVisible = flag;
    }

    public maxLength(): number {
      // 最も距離の近い2つの節点距離
      return this.nodeThree.baseScale * 80;
    }

    public chengeData(index: number): void {

      // 一旦全排除
      this.ClearData();

      // 格点データを入手
      const nodeData = this.node.getNodeJson(0);
      const nodeKeys = Object.keys(nodeData);
      if (nodeKeys.length <= 0) {
        return;
      }

      // 反力データを入手
      const targetCase: string = index.toString();
      const reacData = this.reac.getReacJson();
      if (Object.keys(reacData).length <= 0) {
        return;
      }

      // サイズを調整しオブジェクトを登録する
      this.createReact(reacData[targetCase], nodeData);
    }

    // 節点荷重の矢印を描く
    private createReact(reacData: any, nodeData: object): void {

      // 新しい入力を適用する
      const targetReact = JSON.parse(
        JSON.stringify({
          temp: reacData
        })
      ).temp;
      // 文字列を数値型に変換する  
      for (const reac of targetReact) {
        reac.tx = this.helper.toNumber(reac.tx);
        reac.ty = this.helper.toNumber(reac.ty);
        reac.tz = this.helper.toNumber(reac.tz);
        reac.mx = this.helper.toNumber(reac.mx);
        reac.my = this.helper.toNumber(reac.my);
        reac.mz = this.helper.toNumber(reac.mz);
      }
      // スケールを決定する 最大の荷重を 1とする
      let pMax = 0;
      let mMax = 0;
      for (const reac of targetReact) {
        pMax = Math.max(pMax, Math.abs(reac.tx));
        pMax = Math.max(pMax, Math.abs(reac.ty));
        pMax = Math.max(pMax, Math.abs(reac.tz));
        mMax = Math.max(mMax, Math.abs(reac.mx));
        mMax = Math.max(mMax, Math.abs(reac.my));
        mMax = Math.max(mMax, Math.abs(reac.mz));
      }

      // 集中荷重の矢印をシーンに追加する
      for (const reac of targetReact) {
        // 節点座標 を 取得する
        const node = nodeData[reac.id];
        if (node === undefined) {
          continue;
        }
        // x方向の集中荷重
        const xArrow: Line2 = this.setPointReact(reac.tx, pMax, node, 'px');
        if (xArrow !== null) {
          this.pointLoadList.push(xArrow);
          this.scene.add(xArrow);
        }
        // y方向の集中荷重
        const yArrow: Line2 = this.setPointReact(reac.ty, pMax, node, 'py');
        if (yArrow !== null) {
          this.pointLoadList.push(yArrow);
          this.scene.add(yArrow);
        }
        // z方向の集中荷重
        const zArrow: Line2 = this.setPointReact(reac.tz, pMax, node, 'pz');
        if (zArrow !== null) {
          this.pointLoadList.push(zArrow);
          this.scene.add(zArrow);
        }

        // x軸周りのモーメント
        const xMoment = this.setMomentReact(reac.mx, mMax, node, 0xFF0000, 'mx');
        if (xMoment !== null) {
          this.pointLoadList.push(xMoment);
          this.scene.add(xMoment);
        }

        // y軸周りのモーメント
        const yMoment = this.setMomentReact(reac.my, mMax, node, 0x00FF00, 'my');
        if (yMoment !== null) {
          this.pointLoadList.push(yMoment);
          this.scene.add(yMoment);
        }

        // z軸周りのモーメント
        const zMoment = this.setMomentReact(reac.mz, mMax, node, 0x0000FF, 'mz'); 
        if (zMoment !== null) {
          this.pointLoadList.push(zMoment);
          this.scene.add(zMoment);
        }

      }
    }

    // 節点荷重の矢印を作成する
    private setMomentReact(value: number, mMax: number, node: any, color: number, name: string): THREE.Line {

      if (value === 0) { 
        return null;
      }

      const curve = new THREE.EllipseCurve(
        0,  0,              // ax, aY
        4, 4,               // xRadius, yRadius
        0,  1.5 * Math.PI,  // aStartAngle, aEndAngle
        false,              // aClockwise
        0                   // aRotation
      );

      const points = curve.getPoints( 50 );
      const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
      const lineMaterial = new THREE.LineBasicMaterial( { color, linewidth: 5 } );
      const ellipse = new THREE.Line( lineGeometry, lineMaterial );

      const arrowGeometry = new THREE.ConeGeometry( 0.3, 3, 3, 1, true );
      const arrowMaterial = new THREE.MeshBasicMaterial( {color} );
      const cone = new THREE.Mesh( arrowGeometry, arrowMaterial );
      cone.rotateX(Math.PI);
      cone.position.set(4, 0.5, 0);

      ellipse.add(cone);
      ellipse.position.set(node.x,  node.y,  node.z);

      switch (name) {
        case 'mx':
          ellipse.rotateX(Math.PI / 2);
          ellipse.rotateY(Math.PI / 2);
          break;
        case 'my':
          ellipse.rotateX(Math.PI / 2);
          break;
        case 'mz':
          ellipse.rotateX(Math.PI); // 反転
          break;
      }

      let scale: number = value / mMax;
      scale /= 8;
      ellipse.scale.set(scale, scale, scale);

      return ellipse;

    }

    // 節点荷重の矢印を作成する
    private setPointReact(value: number, pMax: number,
                          node: any, name: string): Line2 {

      if (value === 0) {
        return null;
      }

      const maxLength: number = this.maxLength() * 0.7;
      const length: number = maxLength * value / pMax;

      const linewidth: number = this.nodeThree.baseScale / 50 * 2;

      let color: number;
      const positions = [];


      positions.push( node.x, node.y, node.z );
      switch (name) {
        case 'px':
          positions.push(node.x - length, node.y, node.z);
          color = 0xFF0000;
          break;
        case 'py':
          positions.push(node.x, node.y - length, node.z);
          color = 0x00FF00;
          break;
        case 'pz':
          positions.push(node.x, node.y, node.z - length);
          color = 0x0000FF;
          break;
      }
      const cone_scale: number = length * 0.3;
      const cone_radius: number = 0.1 * cone_scale;
      const cone_height: number = 1 * cone_scale;
      const arrowGeometry: THREE.ConeGeometry = new THREE.ConeGeometry( cone_radius, cone_height, 3, 1, true );
      const arrowMaterial = new THREE.MeshBasicMaterial( {color} );
      const cone: THREE.Mesh = new THREE.Mesh( arrowGeometry, arrowMaterial );
      switch (name) {
        case 'px':
          cone.position.set(node.x - cone_height / 2, node.y, node.z);
          cone.rotation.z = Math.PI / 2 * 3;
          break;
        case 'py':
          cone.position.set(node.x, node.y - cone_height / 2, node.z);
          break;
        case 'pz':
          cone.position.set(node.x, node.y, node.z - cone_height / 2);
          cone.rotation.x = Math.PI / 2;
          break;
      }

      const threeColor = new THREE.Color(color);
      const colors = [];
      colors.push( threeColor.r, threeColor.g, threeColor.b );
      colors.push( threeColor.r, threeColor.g, threeColor.b );

      const geometry: LineGeometry = new LineGeometry();
      geometry.setPositions( positions );
      geometry.setColors( colors );

      const matLine: LineMaterial = new LineMaterial( {
        color,
        linewidth,
        vertexColors: THREE.VertexColors,
        dashed: false
      } );
      const line: Line2 = new Line2( geometry, matLine );
      line.computeLineDistances();
      line.add(cone);

      line.scale.set( 1, 1, 1 );
      line.name = name;

      return line;

    }

    // データをクリアする
    public ClearData(): void {
      for (const mesh of this.pointLoadList) {
        // 文字を削除する
        while (mesh.children.length > 0) {
          const object = mesh.children[0];
          object.parent.remove(object);
        }
        // オブジェクトを削除する
        this.scene.remove(mesh);
      }
      this.pointLoadList = new Array();
    }


  }
