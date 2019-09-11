import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputNodesService {
  
  public node: any[];

  constructor() {
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

  
}

