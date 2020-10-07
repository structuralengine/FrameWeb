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
    for (const tmp  of this.node) {
      if (tmp.id.toString() === index.toString()) {
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
      const item = this.convertNumber(json[index]);
      const result = {
        id: index,
        x: (item.x === null) ? '' : item.x.toFixed(3),
        y: (item.y === null) ? '' : item.y.toFixed(3),
        z: (item.z === null) ? '' : item.z.toFixed(3)
      };
      this.node.push(result);
    }
  }

  public getNodeJson(empty: number = null ): object {

    const jsonData: object = {};

    for (const row of this.node) {

      const item = this.convertNumber(row);
      if (item.x == null && item.y == null && item.z == null) {
        continue;
      }

      const key: string = row.id;
      jsonData[key] = {
        x: (item.x == null) ? empty : item.x,
        y: (item.y == null) ? empty : item.y,
        z: (item.z == null) ? empty : item.z
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

  private convertNumber(item: object): any {
    const x: number = this.helper.toNumber(item['x']);
    const y: number = this.helper.toNumber(item['y']);
    const z: number = this.helper.toNumber(item['z']);
    return {
      x,
      y,
      z
    };
  }

}

