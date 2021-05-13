import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputPanelService {

  public PANEL_VERTEXS_COUNT = 7;
  public panel_points: any[];

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.panel_points = new Array();
  }

  public getPanelColumns(row: number): any {

    let result: any = null;

    for (const tmp of this.panel_points) {
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }

    // 対象データが無かった時に処理
    if (result == null) {
      result = { row, m: '', len: '' };
      for (let i = 1; i <= this.PANEL_VERTEXS_COUNT; i++) {
        result['point-' + i] = '';
      }
      this.panel_points.push(result);
    } else {
      // データの不足を補う
      for (let i = 1; i <= this.PANEL_VERTEXS_COUNT; i++) {
        if (!(('point-' + i) in result)) {
          result['point-' + i] = '';
        }
      }
    }
    return result;
  }

  public setPanelJson(jsonData: {}): void {
    if (!('panel' in jsonData)) {
      return;
    }
    const js: any[] = jsonData['panel'];
    for (let i = 0; i < js.length; i++) {
      const item = js[i];
      const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
      const e = item['e'];
      const Points: any[] = item.Points;
      const result = { row: row, e: e };
      for (let j = 0; j < Points.length; j++) {
        const key = 'point-' + (j + 1).toString();
        const pos: number = this.helper.toNumber(Points[j]);
        result[key] = (pos === null) ? '' : pos.toFixed(0);
      }
      this.panel_points.push(result);
    }
  }

  public getPanelJson(empty: number = null) {

    const result = new Array();

    for( const row of this.panel_points) {

      const r = row['row'];
      const points = new Array();
      for (let j = 1; j < this.PANEL_VERTEXS_COUNT + 1; j++) {
        const key = 'point-' + j;
        if (key in row) {
          const pos: number = this.helper.toNumber(row[key]);
          if (pos != null) {
            points.push(pos);
          }
        }
      }

      const e = this.helper.toNumber(row['e']);

      if (e == null || Object.keys(points).length === 0) {
        continue;
      }

      result.push({
        row: r,
        e: row.e,
        Points: points
       });
    }
    return result;
  }

}
