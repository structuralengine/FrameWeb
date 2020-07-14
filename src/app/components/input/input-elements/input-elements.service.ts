import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputElementsService {
  public element: object;

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void { 
    this.element = {};
  }
  
  public getElementColumns(typNo: number, index: number): any {

    let target: any = null;
    let result: any = null;

    // タイプ番号を探す
    if (!this.element[typNo]) {
      target = new Array();
    } else {
      target = this.element[typNo];
    }

    // 行を探す
    for (let i = 0; i < target.length; i++) {
      const tmp = target[i];
      if (tmp['id'].toString() === index.toString()) {
        result = tmp;
        break;
      }
    }

    // 対象行が無かった時に処理
    if (result == null) {
      result = { id: index, E: '', G: '', Xp: '', A: '', J: '', Iy: '', Iz: '' };
      target.push(result);
      this.element[typNo] = target;
    }

    return result;
  }

  public setElementJson(jsonData: {}): void {
    if (!('element' in jsonData)) {
      return;
    }
    const json: {} = jsonData['element'];
    for (const typNo of Object.keys(json)) {
      const js = json[typNo];
      const target = new Array();
      for (const index of Object.keys(js)) {
        const item = js[index];
        const result = {
          id: index,
          E: (item.E === null) ? '' : item.E.toExponential(2),
          G: (item.G === null) ? '' : item.G.toExponential(2),
          Xp: (item.Xp === null) ? '' : item.Xp.toExponential(2),
          A: (item.A === null) ? '' : item.A.toFixed(3),
          J: (item.J === null) ? '' : item.J.toFixed(4),
          Iy: (item.Iy === null) ? '' : item.Iy.toFixed(5),
          Iz: (item.Iz === null) ? '' : item.Iz.toFixed(5)
        };
        target.push(result);
      }
      this.element[typNo] = target;
    }
  }

  public getElementJson(empty: number = null, targetCase: string = '') {

    const result = {};

    for (const typNo of Object.keys(this.element)) {

      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && typNo !== targetCase) {
        continue;
      }

      const element = this.element[typNo];
      const jsonData: object = {};

      for (let i = 0; i < element.length; i++) {

        const row: {} = element[i];
        const E = this.helper.toNumber(row['E']);
        const G = this.helper.toNumber(row['G']);
        const Xp = this.helper.toNumber(row['Xp']);
        const A = this.helper.toNumber(row['A']);
        const J = this.helper.toNumber(row['J']);
        const Iy = this.helper.toNumber(row['Iy']);
        const Iz = this.helper.toNumber(row['Iz']);
        if (E == null && G == null && Xp == null && A == null
          && J == null && Iy == null && Iz == null) {
          continue;
        }

        const key: string = row['id'];
        jsonData[key] = { 
          E: (E == null) ? empty : E, 
          G: (G == null) ? empty : G, 
          Xp: (Xp == null) ? empty : Xp, 
          A: (A == null) ? empty : A, 
          J: (J == null) ? empty : J, 
          Iy: (Iy == null) ? empty : Iy, 
          Iz: (Iz == null) ? empty : Iz
          };
          
      }
      if (Object.keys(jsonData).length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

}
