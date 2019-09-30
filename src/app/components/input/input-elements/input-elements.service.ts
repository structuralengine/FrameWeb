import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputElementsService {
  public element: any;

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
        const result = { id: index, E: item.E, G: item.G, Xp: item.Xp, A: item.A, J: item.J, Iy: item.Iy, Iz: item.Iz };
        target.push(result);
      }
      this.element[typNo] = target;
    }
  }

  public getElementJson(mode: string = 'file') {

    const result = {};
    let targetCase = '0';
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('elements') < 0) {
      return result;
    } else {
      targetCase = mode.replace('unity-elements:', '');
    }

    for (const typNo of Object.keys(this.element)) {
      // unity-elements モードは カレントのケースのみデータを生成する
      if (targetCase !== mode) {
        if (typNo !== targetCase) {
          continue;
        }
      }
      const element = this.element[typNo];
      const jsonData = {};
      for (let i = 0; i < element.length; i++) {
        const row: {} = element[i];
        let E = this.helper.toNumber(row['E']);
        let G = this.helper.toNumber(row['G']);
        let Xp = this.helper.toNumber(row['Xp']);
        let A = this.helper.toNumber(row['A']);
        let J = this.helper.toNumber(row['J']);
        let Iy = this.helper.toNumber(row['Iy']);
        let Iz = this.helper.toNumber(row['Iz']);
        if (E == null && G == null && Xp == null && A == null
          && J == null && Iy == null && Iz == null) {
          continue;
        }
        let item = {};
        if (mode === 'calc') {
          E = (E == null) ? 0 : E;
          G = (G == null) ? 0 : G;
          Xp = (Xp == null) ? 0 : Xp;
          A = (A == null) ? 0 : A;
          J = (J == null) ? 0 : J;
          Iy = (Iy == null) ? 0 : Iy;
          Iz = (Iz == null) ? 0 : Iz;
          item = { E: E, G: G, Xp: Xp, A: A, J: J, Iy: Iy, Iz: Iz };
        } else {
          for (const _key in row) {
            if (_key !== 'id') {
              item[_key] = row[_key];
            }
          }
        }
        const key: string = row['id'];
        jsonData[key] = item;
      }
      if (Object.keys(jsonData).length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

}
