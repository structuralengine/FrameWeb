import { Injectable } from '@angular/core';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Injectable({
  providedIn: 'root'
})
export class InputNoticePointsService {

  static NOTICE_POINTS_COUNT = 20;
  public notice_points: any[];

  constructor(private helper: DataHelperModule) {
    this.clear();
  }

  public clear(): void {
    this.notice_points = new Array();
  }

  public getNoticePointsColumns(row: number): any {

    let result: any = null;

    for (let i = 0; i < this.notice_points.length; i++) {
      const tmp = this.notice_points[i];
      if (tmp['row'] === row) {
        result = tmp;
        break;
      }
    }
    // 対象データが無かった時に処理
    if (result == null) {
      result = { row: row, m: '', len: '' };
      for (let i = 1; i <= InputNoticePointsService.NOTICE_POINTS_COUNT; i++) {
        result['L' + i] = '';
      }
      this.notice_points.push(result);
    } else {
      // データの不足を補う
      for (let i = 1; i <= InputNoticePointsService.NOTICE_POINTS_COUNT; i++) {
        if (!(('L' + i) in result)) {
          result['L' + i] = '';
        }
      }
    }
    return result;
  }

  public setNoticePointsJson(jsonData: {}): void {
    if (!('notice_points' in jsonData)) {
      return;
    }
    const js: any[] = jsonData['notice_points'];
    for (let i = 0; i < js.length; i++) {
      const item: {} = js[i];
      const row: string = ('row' in item) ? item['row'] : (i + 1).toString();
      const m = item['m'];
      const Points: any[] = item['Points'];
      const result = { row: row, m: m };
      for (let j = 0; j < Points.length; j++) {
        const key = 'L' + (j + 1).toString();
        result[key] = Points[j];
      }
      this.notice_points.push(result);
    }
  }

  public getNoticePointsJson(mode: string = 'file') {

    const result = new Array();
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('notice_points') < 0) {
      return result;
    }

    for (let i = 0; i < this.notice_points.length; i++) {
      const row: {} = this.notice_points[i];
      const r = row['row'];
      let m = this.helper.toNumber(row['m']);
      const points = new Array();
      for (let j = 1; j < InputNoticePointsService.NOTICE_POINTS_COUNT + 1; j++) {
        const key = 'L' + j;
        if (key in row) {
          const tmp: number = this.helper.toNumber(row[key]);
          if (tmp != null) {
            points.push(tmp);
          }
        }
      }
      if (m == null && Object.keys(points).length === 0) {
        continue;
      }
      m = (m == null) ? 0 : m;
      const item = { m: m, Points: points };
      if (mode !== 'calc') {
        item['row'] = r;
      }
      result.push(item);
    }
    return result;
  }

}
