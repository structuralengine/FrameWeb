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
      if (i === undefined || j === undefined) {
        continue;
      }

      // 要素をシーンに追加
      const geometry = new THREE.Geometry();
      // 頂点座標の追加
      geometry.vertices.push(new THREE.Vector3(i.x, i.y, i.z));
      geometry.vertices.push(new THREE.Vector3(j.x, j.y, j.z));

      // 線オブジェクトの生成
      const material = new THREE.LineBasicMaterial({color: 0x000000});
      material.linewidth = 10;

      const line = new THREE.Line(geometry, material);
      line.name = key;

      // sceneにlineを追加
      this.memberList.push(line);
      scene.add(line);

      // 文字をシーンに追加
      const moonDiv = document.createElement('div');
      moonDiv.className = 'label';
      moonDiv.textContent = key;
      moonDiv.style.marginTop = '-1em';
      const moonLabel = new CSS2DObject(moonDiv);
      const x: number = (i.x + j.x) / 2;
      const y: number = (i.y + j.y) / 2;
      const z: number = (i.z + j.z) / 2;
      moonLabel.position.set(x, y, z);
      moonLabel.name = 'font';
      line.add(moonLabel);

      // ローカル座標を示す線を追加
      const axis = this.localAxis(x, y, z, j.x, j.y, j.z, member.cg);
      // x要素軸
      const xAxis = new THREE.Geometry();
      xAxis.vertices.push(new THREE.Vector3(x, y, z));
      xAxis.vertices.push(new THREE.Vector3(axis.x.x, axis.x.y, axis.x.z));
      const xline = new THREE.Line(xAxis, new THREE.LineBasicMaterial({ color: 0xFF0000 }));
      xline.name = 'x';
      line.add(xline);
      // y要素軸
      const yAxis = new THREE.Geometry();
      yAxis.vertices.push(new THREE.Vector3(x, y, z));
      yAxis.vertices.push(new THREE.Vector3(axis.y.x, axis.y.y, axis.y.z));
      const yline = new THREE.Line(yAxis, new THREE.LineBasicMaterial({ color: 0x00FF00 }));
      yline.name = 'y';
      line.add(yline);
      // z要素軸
      const zAxis = new THREE.Geometry();
      zAxis.vertices.push(new THREE.Vector3(x, y, z));
      zAxis.vertices.push(new THREE.Vector3(axis.z.x, axis.z.y, axis.z.z));
      const zline = new THREE.Line(zAxis, new THREE.LineBasicMaterial({ color: 0x0000FF }));
      zline.name = 'z';
      line.add(zline);
    }
  }

  // データをクリアする
  public ClearData(scene: SceneService): void {
    for (const mesh of this.memberList) {
      // 文字を削除する
      while (mesh.children.length > 0) {
        const object = mesh.children[0];
        object.parent.remove(object);
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

  // 部材座標軸を
  private localAxis(xi: number, yi: number, zi: number,
                    xj: number, yj: number, zj: number,
                    theta: number): any {

    const xM: number[] = [1, 0, 0]; // x だけ1の行列
    const yM: number[] = [0, 1, 0]; // y だけ1の行列
    const zM: number[] = [0, 0, 1]; // z だけ1の行列

    const DX: number = xj - xi;
    const DY: number = yj - yi;
    const DZ: number = zj - zi;
    const EL: number = Math.sqrt(Math.pow(DX, 2) + Math.pow(DY, 2) + Math.pow(DZ, 2));

    const ll: number = DX / EL;
    const mm: number = DY / EL;
    const nn: number = DZ / EL;

    const qq = Math.sqrt(Math.pow(ll, 2) + Math.pow(mm, 2));

    const t1: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const t2: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    // 座標変換ベクトルを用意
    t1[0][0] = 1;
    t1[1][1] = Math.cos(theta);
    t1[1][2] = Math.sin(theta);
    t1[2][1] = -Math.sin(theta);
    t1[2][2] = Math.cos(theta);

    if (DX === 0 && DY === 0) {
      t2[0][2] = nn;
      t2[1][0] = nn;
      t2[2][1] = 1;
    } else {
      t2[0][0] = ll;
      t2[0][1] = mm;
      t2[0][2] = nn;
      t2[1][0] = -mm / qq;
      t2[1][1] = ll / qq;
      t2[2][0] = -ll * nn / qq;
      t2[2][1] = -mm * nn / qq;
      t2[2][2] = qq;
    }

    // 座標変換ベクトル × 荷重ベクトル
    const t3 = this.dot(t1, t2);
    const tt = this.getInverse(t3);

    const X = {
      x: xi + tt[0][0] * xM[0] + tt[0][1] * xM[1] + tt[0][2] * xM[2],
      y: yi + tt[1][0] * xM[0] + tt[1][1] * xM[1] + tt[1][2] * xM[2],
      z: zi + tt[2][0] * xM[0] + tt[2][1] * xM[1] + tt[2][2] * xM[2]
    };
    const Y = {
      x: xi + tt[0][0] * yM[0] + tt[0][1] * yM[1] + tt[0][2] * yM[2],
      y: yi + tt[1][0] * yM[0] + tt[1][1] * yM[1] + tt[1][2] * yM[2],
      z: zi + tt[2][0] * yM[0] + tt[2][1] * yM[1] + tt[2][2] * yM[2]
    };
    const Z = {
      x: xi + tt[0][0] * zM[0] + tt[0][1] * zM[1] + tt[0][2] * zM[2],
      y: yi + tt[1][0] * zM[0] + tt[1][1] * zM[1] + tt[1][2] * zM[2],
      z: zi + tt[2][0] * zM[0] + tt[2][1] * zM[1] + tt[2][2] * zM[2]
    };
    const result = {
      x: X,
      y: Y,
      z: Z
    };
    return result;
  }

  private dot(a: number[][], B: number[][]): number[][] {

    const u: number = a.length;

    const AB = Array(u).fill(0).map(x => Array(u).fill(0));
    // 行列の計算を行う
    for (let i = 0; i < u; i++) {
      for (let j = 0; j < u; j++) {
        let sum = 0;
        for (let k = 0; k < u; k++) {
          sum = sum + a[i][k] * B[k][j];
        }
        AB[i][j] = sum;
      }
    }
    return AB;
  }

  private getInverse(t3: number[][]): number[][] {
    const m = t3.length;
    const n = t3[0].length;
    const tt = Array(m).fill(0).map(x => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        tt[j][i] = t3[i][j];
      }
    }
    return tt;
  }

}


