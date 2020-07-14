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

  public getNodeJson(empty: number = null ): object {

    const jsonData: object = {};

    for (let i = 0; i < this.node.length; i++) {
      const row = this.node[i];
      let x: number  = this.helper.toNumber(row['x']);
      let y: number  = this.helper.toNumber(row['y']);
      let z: number  = this.helper.toNumber(row['z']);
      if (x == null && y == null && z == null) {
        continue;
      }

      const key: string = row['id'];

      jsonData[key] = { 
        'x': (x == null) ? empty : x, 
        'y': (y == null) ? empty : y, 
        'z': (z == null) ? empty : z
      };
      
    }
    return jsonData;
  }

  public getNodeText(): string {
    const jsonData: object = this.getNodeJson();
    const stringData: string = JSON.stringify(jsonData);
    return stringData;
  }

  public getNodePos(nodeNo: string) {
    const nodeList: {} = this.getNodeJson();
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

