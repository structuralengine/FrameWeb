import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { InputNodesService } from '../input-nodes/input-nodes.service';

@Injectable({
  providedIn: 'root'
})
export class InputMembersService {
  public member: any[];

  constructor(private node: InputNodesService,
              private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.member = new Array();
  }
  
  public getMemberColumns(index: number): any {

    let result: any = null;
    for ( const tmp of this.member) {
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { id: index, L: '', ni: '', nj: '', e: '', cg: '' };
      this.member.push(result);
    }
    return result;
  }

  public setMemberJson(jsonData: {}): void {
    if (!('member' in jsonData)) {
      return;
    }
    const json: {} = jsonData['member'];
    for (const index of Object.keys(json)) {
      const item = json[index];
      const result = { id: index, L: '', ni: item.ni, nj: item.nj, e: item.e, cg: item.cg };
      this.member.push(result);
    }
  }

  public getMemberJson(mode: string = 'file') {

    const jsonData = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('-members') < 0) {
      return jsonData;
    }

    for (let i = 0; i < this.member.length; i++) {
      const row = this.member[i];
      let ni = this.helper.toNumber(row['ni']);
      let nj = this.helper.toNumber(row['nj']);
      let e = this.helper.toNumber(row['e']);
      let cg = this.helper.toNumber(row['cg']);
      if (ni == null && nj == null && e == null && cg == null) {
        continue;
      }
      let item = {};
      if (mode === 'calc') {
        ni = (ni == null) ? 0 : ni;
        nj = (nj == null) ? 0 : nj;
        e = (e == null) ? 0 : e;
        cg = (cg == null) ? 0 : cg;
        item = { 'ni': ni, 'nj': nj, 'e': e, 'cg': cg };
      } else {
        for (const _key in row) {
          if ((_key !== 'id') && (_key !== 'L')) {
            item[_key] = row[_key];
          }
        }
      }
      const key: string = row.id;
      jsonData[key] = item;
    }
    return jsonData;
  }

  // 補助関数 ///////////////////////////////////////////////////////////////

  public getNodeNo(memberNo: string) {
    const jsonData = { ni: '', nj: '' };

    const memberList: {} = this.getMemberJson('calc');
    if (Object.keys(memberList).length <= 0) {
      return jsonData;
    }
    if (!(memberNo in memberList)) {
      return jsonData;
    }
    const member = memberList[memberNo];
    jsonData['ni'] = member['ni']
    jsonData['nj'] = member['nj']
    return jsonData;
  }

  public getMemberLength(memberNo: string): number {
    const node: {} = this.getNodeNo(memberNo);
    const ni: string = node['ni'];
    const nj: string = node['nj'];
    if (ni === '' || nj === '') {
      return null;
    }
    const iPos = this.node.getNodePos(ni)
    const jPos = this.node.getNodePos(nj)
    if (iPos == null || jPos == null) {
      return null;
    }
    const xi: number = iPos['x'];
    const yi: number = iPos['y'];
    const zi: number = iPos['z'];
    const xj: number = jPos['x'];
    const yj: number = jPos['y'];
    const zj: number = jPos['z'];

    const result: number = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2 + (zi - zj) ** 2);
    return result;

  }

  public localZaxis(xi: number, yi: number, zi: number,
                    xj: number, yj: number, zj: number,
                    angle: number): any {

    const M: number[][] = [[0], [0], [1]]; // z だけ1の行列
    const tM: number[][] = this.tMatrix(xi, yi, zi, xj, yj, zj, angle);

    const ttM: number[][] = this.Transpose(tM);
    const rM: number[][] = this.dot(ttM, M);
    const result = {
      x: xi - rM[0][0],
      y: yi + rM[1][0],
      z: zi + rM[2][0]
    };
    return result;

  }

  // 座標変換行列
  private tMatrix(xi: number, yi: number, zi: number,
                  xj: number, yj: number, zj: number,
                  angle: number): number[][] {

    const memberList: {} = this.getMemberJson('calc');

    let result: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const DX: number = xj - xi;
    const DY: number = yj - yi;
    const DZ: number = zj - zi;
    const EL: number = Math.sqrt(Math.pow(DX, 2) + Math.pow(DY, 2) + Math.pow(DZ, 2));

    if ((DX === 0 && DY === 0)) {
      result[0][0] = 0.0;
      result[0][1] = 0.0;
      result[0][2] = 1.0;
      result[1][0] = Math.cos(angle);
      result[1][1] = Math.sin(angle);
      result[1][2] = 0.0;
      result[2][0] = -Math.sin(angle);
      result[2][1] = Math.cos(angle);
      result[2][2] = 0.0;
    } else {
      const xL = DX / EL;
      const XM = DY / EL;
      const XN = DZ / EL;
      const xlm = Math.sqrt(xL * xL + XM * XM);
      const ts: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      const tf: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      ts[0][0] = xL;
      ts[0][1] = XM;
      ts[0][2] = XN;
      ts[1][0] = -XM / xlm;
      ts[1][1] = xL / xlm;
      ts[1][2] = 0;
      ts[2][0] = -XN * xL / xlm;
      ts[2][1] = -XM * XN / xlm;
      ts[2][2] = xlm;
      tf[0][0] = 1;
      tf[0][1] = 0;
      tf[0][2] = 0;
      tf[1][0] = 0;
      tf[1][1] = Math.cos(angle);
      tf[1][2] = Math.sin(angle);
      tf[2][0] = 0;
      tf[2][1] = -Math.sin(angle);
      tf[2][2] = Math.cos(angle);

      result = this.dot(ts, tf);
    }
    return result;
  }

  // 行列の掛け算
  private  dot(matrix1: number[][], matrix2: number[][]): number[][] {
    const res = new Array();
    const row1 = matrix1.length;
    const row2 = matrix2.length;
    const col1 = matrix1[0].length;
    const col2 = matrix2[0].length;

    for (let i1 = 0; i1 < row1; i1++) {
      res.push(new Array());
      for (let i2 = 0; i2 < col2; i2++) {
        res[i1].push(0);
        for (let i3 = 0; i3 < col1; i3++) {
          res[i1][i2] += matrix1[i1][i3] * matrix2[i3][i2];
        }
      }
    }
    return res;
  }

  // 転置行列
  private Transpose(matrix: number[][]): number[][] {

    const row = matrix.length;
    const column = matrix[0].length;
    const result = Array(column).fill(0).map(n => Array(row).fill(0));
    for (let x = 0; x < column; x++) {
      for (let y = 0; y < row; y++) {
        result[y][x] = matrix[x][y];
      }
    }
    return result;
  }

}
