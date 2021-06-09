import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputPanelService {

  public PANEL_VERTEXS_COUNT = 4;
  public panel_points: any[];

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.panel_points = new Array();
  }

  public getPanelColumns(row: number): any {

    let result: any = this.panel_points.find( (e) => e.row === row.toString());

    // 対象データが無かった時に処理
    if (result == undefined) {
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
    if (!('shell' in jsonData)) {
      return;
    }
    const json: {} = jsonData['shell'];
    for (const index of Object.keys(json)) {
      const item = json[index];

      const row: string = index;

      const e = item['e'];
      const Points: any[] = item.nodes;

      const result = { 
        row: row, 
        e: e 
      };
      for (let j = 0; j < Points.length; j++) {
        const key = 'point-' + (j + 1).toString();
        const pos: number = this.helper.toNumber(Points[j]);
        result[key] = (pos === null) ? '' : pos.toFixed(0);
      }
      this.panel_points.push(result);
    }
  }

  public getPanelJson(empty: number = null) {

    const result: object = {};

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

      const key: string = r;
      result[key] = {
        e: row.e,
        nodes: points
      };
    }
    return result;
  }

}
