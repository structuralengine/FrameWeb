import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputNodesService {
  
  public node: any[];

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.node = new Array();
  }

  public getNodeColumns(index: number): any {

    let result: any = null;
    for (let i = 0; i < this.node.length; i++) {
      const tmp = this.node[i];
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { id: index, x: '', y: '', z: '' };
      this.node.push(result);
    }
    return result;
  }

  // ファイルを読み込むとき
  public setNodeJson(jsonData: {}): void {
    if (!('node' in jsonData)) {
      return;
    }
    const json: {} = jsonData['node'];
    for (const index of Object.keys(json)) {
      const item = json[index];
      const result = { id: index, x: item.x, y: item.y, z: item.z };
      this.node.push(result);
    }
  }

  public getNodeJson(mode: string = 'file'): object {

    const jsonData: object = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('-nodes') < 0) {
      return jsonData;
    }

    for (let i = 0; i < this.node.length; i++) {
      const row = this.node[i];
      let x = this.helper.toNumber(row['x']);
      let y = this.helper.toNumber(row['y']);
      let z = this.helper.toNumber(row['z']);
      if (x == null && y == null && z == null) {
        continue;
      }
      let item = {};
      if (mode === 'calc') {
        x = (x == null) ? 0 : x;
        y = (y == null) ? 0 : y;
        z = (z == null) ? 0 : z;
        item = { 'x': x, 'y': y, 'z': z };
      } else {
        const strX: string = (x == null) ? '' : x.toFixed(3);
        const strY: string = (y == null) ? '' : y.toFixed(3);
        const strZ: string = (z == null) ? '' : z.toFixed(3);
        item['x'] = strX;
        item['y'] = strY;
        item['z'] = strZ;
      }
      const key: string = row['id'];
      jsonData[key] = item;
    }
    return jsonData;
  }

  public getNodeText(): string {
    const jsonData: object = this.getNodeJson('unity-nodes');
    const stringData: string = JSON.stringify(jsonData);
    return stringData;
  }

  public getNodePos(nodeNo: string) {
    const nodeList: {} = this.getNodeJson('unity-nodes');
    if (Object.keys(nodeList).length <= 0) {
      return null;
    }
    if (!(nodeNo in nodeList)) {
      return null;
    }
    const node = nodeList[nodeNo];
    return node;
  }
}

