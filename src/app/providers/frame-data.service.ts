import { Injectable } from '@angular/core';
import { InputDataService } from './input-data.service';
import { ResultDataService } from './result-data.service';
import { directiveCreate } from '@angular/core/src/render3/instructions';
import { Content } from '@angular/compiler/src/render3/r3_ast';
import { CATCH_STACK_VAR } from '@angular/compiler/src/output/output_ast';


@Injectable({
  providedIn: 'root'
})
export class FrameDataService {

  isCombinePickupChenge: boolean;

  constructor(private input: InputDataService,
    private result: ResultDataService) {
  }

  public clear(): void {
    this.input.clear();
    this.result.clear();
    this.isCombinePickupChenge = true;
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // データを生成 /////////////////////////////////////////////////////////////////////
  // mode file:ファイルに保存用データを生成
  //      unity: unity に送信用データを生成
  //      calc: 計算サーバーに送信用データを生成
  ////////////////////////////////////////////////////////////////////////////////////
  public getInputText(mode: string = 'file', Properties = {}): string {

    let jsonData: {} = this.getInputJson(mode);

    // パラメータを追加したい場合
    for (let key in Properties) {
      jsonData[key] = Properties[key];
    }

    let result: string = JSON.stringify(jsonData);
    return result;
  }

  private getInputJson(mode: string) {
    let jsonData = {};

    const node: {} = this.getNodeJson(mode);
    if (Object.keys(node).length > 0) {
      jsonData['node'] = node;
    }

    const fix_node: {} = this.getFixNodeJson(mode);
    if (Object.keys(fix_node).length > 0) {
      jsonData['fix_node'] = fix_node;
    }

    const member: {} = this.getMemberJson(mode);
    if (Object.keys(member).length > 0) {
      jsonData['member'] = member;
    }

    const element: {} = this.getElementJson(mode);
    if (Object.keys(element).length > 0) {
      jsonData['element'] = element;
    }

    const joint: {} = this.getJointJson(mode);
    if (Object.keys(joint).length > 0) {
      jsonData['joint'] = joint;
    }

    const notice_points: {} = this.getNoticePointsJson(mode);
    if (Object.keys(notice_points).length > 0) {
      jsonData['notice_points'] = notice_points;
    }

    const fix_member: {} = this.getFixMemberJson(mode);
    if (Object.keys(fix_member).length > 0) {
      jsonData['fix_member'] = fix_member;
    }

    const load: {} = this.getLoadJson(mode);
    if (Object.keys(load).length > 0) {
      jsonData['load'] = load;
    }

    if (mode == 'file') {
      const define: {} = this.getDefineJson();
      if (Object.keys(define).length > 0) {
        jsonData['define'] = define;
      }

      const combine: {} = this.getCombineJson();
      if (Object.keys(combine).length > 0) {
        jsonData['combine'] = combine;
      }

      const pickup: {} = this.getPickUpJson();
      if (Object.keys(pickup).length > 0) {
        jsonData['pickup'] = pickup;
      }
    }

    return jsonData;
  }

  private getNodeJson(mode: string = 'file') {

    let jsonData = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('-nodes') < 0) {
      return jsonData;
    }

    for (let i = 0; i < this.input.node.length; i++) {
      const row = this.input.node[i];
      let x = this.toNumber(row['x']);
      let y = this.toNumber(row['y']);
      let z = this.toNumber(row['z']);
      if (x == null && y == null && z == null) {
        continue;
      }
      let item = {};
      if (mode == 'calc') {
        x = (x == null) ? 0 : x;
        y = (y == null) ? 0 : y;
        z = (z == null) ? 0 : z;
        item = { "x": x, "y": y, "z": z };
      } else {
        let strX: string = (x == null) ? "" : x.toFixed(3);
        let strY: string = (y == null) ? "" : y.toFixed(3);
        let strZ: string = (z == null) ? "" : z.toFixed(3);
        item["x"] = strX;
        item["y"] = strY;
        item["z"] = strZ;
      }
      let key: string = row['id'];
      jsonData[key] = item;
    }
    return jsonData;
  }

  private getFixNodeJson(mode: string = 'file') {

    let result = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('fix_nodes') < 0) {
      return result;
    }

    for (var typNo in this.input.fix_node) {
      const fix_node = this.input.fix_node[typNo];
      let jsonData = new Array();
      for (let i = 0; i < fix_node.length; i++) {
        const row: {} = fix_node[i];
        let n = this.toNumber(row['n']);
        let tx = this.toNumber(row['tx']);
        let ty = this.toNumber(row['ty']);
        let tz = this.toNumber(row['tz']);
        let rx = this.toNumber(row['rx']);
        let ry = this.toNumber(row['ry']);
        let rz = this.toNumber(row['rz']);
        if (n == null && tx == null && ty == null && tz == null
          && rx == null && ry == null && rz == null) {
          continue;
        }
        if (mode == 'calc') {
          n = (n == null) ? 0 : n;
          tx = (tx == null) ? 0 : tx;
          ty = (ty == null) ? 0 : ty;
          tz = (tz == null) ? 0 : tz;
          rx = (rx == null) ? 0 : rx;
          ry = (ry == null) ? 0 : ry;
          rz = (rz == null) ? 0 : rz;
          let item = { n: n, tx: tx, ty: ty, tz: tz, rx: rx, ry: ry, rz: rz };
          jsonData.push(item);
        } else {
          jsonData.push(row);
        }
      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

  private getMemberJson(mode: string = 'file') {

    let jsonData = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('-members') < 0) {
      return jsonData;
    }

    for (let i = 0; i < this.input.member.length; i++) {
      const row = this.input.member[i];
      let ni = this.toNumber(row['ni']);
      let nj = this.toNumber(row['nj']);
      let e = this.toNumber(row['e']);
      let cg = this.toNumber(row['cg']);
      if (ni == null && nj == null && e == null && cg == null) {
        continue;
      }
      let item = {};
      if (mode == 'calc') {
        ni = (ni == null) ? 0 : ni;
        nj = (nj == null) ? 0 : nj;
        e = (e == null) ? 0 : e;
        cg = (cg == null) ? 0 : cg;
        item = { "ni": ni, "nj": nj, "e": e, "cg": cg };
      } else {
        for (var _key in row) {
          if ((_key != 'id') && (_key != 'L')) {
            item[_key] = row[_key];
          }
        }
      }
      let key: string = row.id;
      jsonData[key] = item;
    }
    return jsonData;
  }

  private getElementJson(mode: string = 'file') {

    let result = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('elements') < 0) {
      return result;
    }

    for (var typNo in this.input.element) {
      const element = this.input.element[typNo];
      let jsonData = {};
      for (let i = 0; i < element.length; i++) {
        const row: {} = element[i];
        let E = this.toNumber(row['E']);
        let G = this.toNumber(row['G']);
        let Xp = this.toNumber(row['Xp']);
        let A = this.toNumber(row['A']);
        let J = this.toNumber(row['J']);
        let Iy = this.toNumber(row['Iy']);
        let Iz = this.toNumber(row['Iz']);
        if (E == null && G == null && Xp == null && A == null
          && J == null && Iy == null && Iz == null) {
          continue;
        }
        let item = {};
        if (mode == 'calc') {
          E = (E == null) ? 0 : E;
          G = (G == null) ? 0 : G;
          Xp = (Xp == null) ? 0 : Xp;
          A = (A == null) ? 0 : A;
          J = (J == null) ? 0 : J;
          Iy = (Iy == null) ? 0 : Iy;
          Iz = (Iz == null) ? 0 : Iz;
          item = { E: E, G: G, Xp: Xp, A: A, J: J, Iy: Iy, Iz: Iz };
        } else {
          for (var _key in row) {
            if (_key != 'id') {
              item[_key] = row[_key];
            }
          }
        }
        let key: string = row['id'];
        jsonData[key] = item;
      }
      if (Object.keys(jsonData).length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

  private getJointJson(mode: string = 'file') {

    let result = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('joints') < 0) {
      return result;
    }

    for (var typNo in this.input.joint) {
      const joint = this.input.joint[typNo];
      let jsonData = new Array();
      for (let i = 0; i < joint.length; i++) {
        const row: {} = joint[i];
        let r = row['row'];
        let m = this.toNumber(row['m']);
        let xi = this.toNumber(row['xi']);
        let yi = this.toNumber(row['yi']);
        let zi = this.toNumber(row['zi']);
        let xj = this.toNumber(row['xj']);
        let yj = this.toNumber(row['yj']);
        let zj = this.toNumber(row['zj']);
        if (m == null && xi == null && yi == null && zi == null
          && xj == null && yj == null && zj == null) {
          continue;
        }
        let item = {};
        if (mode == 'calc') {
          m = (m == null) ? 0 : m;
          xi = (xi == null) ? 0 : xi;
          yi = (yi == null) ? 0 : yi;
          zi = (zi == null) ? 0 : zi;
          xj = (xj == null) ? 0 : xj;
          yj = (yj == null) ? 0 : yj;
          zj = (zj == null) ? 0 : zj;
          item = { m: m, xi: xi, yi: yi, zi: zi, xj: xj, yj: yj, zj: zj };
          jsonData.push(item);
        } else {
          jsonData.push(row);
        }
      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

  private getNoticePointsJson(mode: string = 'file') {

    let result = new Array();
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('notice_points') < 0) {
      return result;
    }

    for (let i = 0; i < this.input.notice_points.length; i++) {
      const row: {} = this.input.notice_points[i];
      let r = row['row'];
      let m = this.toNumber(row['m']);
      let points = new Array();
      for (var j = 1; j < InputDataService.NOTICE_POINTS_COUNT + 1; j++) {
        const key = 'L' + j;
        if (key in row) {
          let tmp: number = this.toNumber(row[key]);
          if (tmp != null) {
            points.push(tmp);
          }
        }
      }
      if (m == null && Object.keys(points).length == 0) {
        continue;
      }
      m = (m == null) ? 0 : m;
      let item = { m: m, Points: points };
      if (mode != 'calc') {
        item['row'] = r;
      }
      result.push(item);
    }
    return result;
  }

  private getFixMemberJson(mode: string = 'file') {

    let result = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('fix_members') < 0) {
      return result;
    }

    for (var typNo in this.input.fix_member) {
      const fix_member = this.input.fix_member[typNo];
      let jsonData = new Array();
      for (let i = 0; i < fix_member.length; i++) {
        const row: {} = fix_member[i];
        let m = this.toNumber(row['m']);
        let tx = this.toNumber(row['tx']);
        let ty = this.toNumber(row['ty']);
        let tz = this.toNumber(row['tz']);
        let tr = this.toNumber(row['tr']);
        if (m == null && tx == null && ty == null && tz == null && tr == null) {
          continue;
        }
        if (mode == 'calc') {
          m = (m == null) ? 0 : m;
          tx = (tx == null) ? 0 : tx;
          ty = (ty == null) ? 0 : ty;
          tz = (tz == null) ? 0 : tz;
          tr = (tr == null) ? 0 : tr;
          let item = { m: m, tx: tx, ty: ty, tz: tz, tr: tr };
          jsonData.push(item);
        } else {
          jsonData.push(row);
        }
      }
      if (jsonData.length > 0) {
        result[typNo] = jsonData;
      }
    }
    return result;
  }

  private getLoadJson(mode: string = 'file') {

    let result = {};
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('loads') < 0) {
      return result;
    }

    // 荷重基本設定
    let load_name = this.getLoadNameJson(mode);

    // 節点荷重データ
    let load_node = this.getNodeLoadJson(mode);

    // 要素荷重データ
    let load_member = this.getMemberLoadJson(mode);

    // 合成する
    if (mode == 'file') {
      for (let load_id in load_name) {
        let jsonData = load_name[load_id];
        if (load_id in load_node) {
          jsonData['load_node'] = load_node[load_id];
          delete load_node[load_id];
        }
        if (load_id in load_member) {
          jsonData['load_member'] = load_member[load_id];
          delete load_member[load_id];
        }
        result[load_id] = jsonData;
        delete load_name[load_id];
      }
    }
    for (let load_id in load_node) {
      let jsonData = {};
      if (load_id in load_name) {
        jsonData = load_name[load_id];
      } else {
        jsonData = { fix_node: 1, fix_member: 1, element: 1, joint: 1 }
      }
      jsonData['load_node'] = load_node[load_id];
      if (load_id in load_member) {
        jsonData['load_member'] = load_member[load_id];
        delete load_member[load_id];
      }
      result[load_id] = jsonData;
      delete load_name[load_id];
    }
    for (let load_id in load_member) {
      let jsonData = {};
      if (load_id in load_name) {
        jsonData = load_name[load_id];
      } else {
        jsonData = { fix_node: 1, fix_member: 1, element: 1, joint: 1 }
      }
      jsonData['load_member'] = load_member[load_id];
      result[load_id] = jsonData;
      delete load_member[load_id];
    }
    return result;
  }

  // 荷重基本データ
  private getLoadNameJson(mode: string = 'file'): any {
    let load_name = {};
    for (let i = 0; i < this.input.load_name.length; i++) {
      const tmp = this.input.load_name[i];
      const key: string = tmp['id'];
      const id = this.toNumber(key);
      if (id == null) {
        continue;
      }
      let rate = this.toNumber(tmp['rate']);
      let symbol: string = tmp['symbol'];
      let name: string = tmp['name'];
      let fix_node = this.toNumber(tmp['fix_node']);
      let fix_member = this.toNumber(tmp['fix_member']);
      let element = this.toNumber(tmp['element']);
      let joint = this.toNumber(tmp['joint']);

      if (rate == null && symbol == '' && name == ''
        && fix_node == null && fix_member == null && element == null && joint == null) {
        continue;
      }

      let jsonData = {};
      if (mode == 'calc') {
        fix_node = (fix_node == null) ? 1 : fix_node;
        fix_member = (fix_member == null) ? 1 : fix_member;
        element = (element == null) ? 1 : element;
        joint = (joint == null) ? 1 : joint;
        jsonData = { fix_node: fix_node, fix_member: fix_member, element: element, joint: joint }
      } else {
        for (var _key in tmp) {
          if (_key != 'id') {
            jsonData[_key] = tmp[_key];
          }
        }
      }
      const load_id = (i + 1).toString();
      load_name[load_id] = jsonData;
    }
    return load_name;
  }

  public getLoadName(currentPage: number): string {

    if (currentPage < 1) {
      return "";
    }
    if (currentPage > this.input.load_name.length) {
      return "";
    }

    let i = currentPage - 1;
    const tmp = this.input.load_name[i];

    let result: string = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  // 節点荷重データ
  private getNodeLoadJson(mode: string = 'file'): any {
    let load_node = {};

    for (let load_id in this.input.load) {

      let tmp_node = new Array();

      let load: any[] = this.input.load[load_id];
      for (let j = 0; j < load.length; j++) {
        const row: {} = load[j];
        let r = row['row'];
        let n = this.toNumber(row['n']);
        let tx = this.toNumber(row['tx']);
        let ty = this.toNumber(row['ty']);
        let tz = this.toNumber(row['tz']);
        let rx = this.toNumber(row['rx']);
        let ry = this.toNumber(row['ry']);
        let rz = this.toNumber(row['rz']);
        if (n != null && (tx != null || ty != null || tz != null ||
          rx != null || ry != null || rz != null)) {

          let item2 = {};
          if (mode == 'calc') {
            tx = (tx == null) ? 0 : tx;
            ty = (ty == null) ? 0 : ty;
            tz = (tz == null) ? 0 : tz;
            rx = (rx == null) ? 0 : rx;
            ry = (ry == null) ? 0 : ry;
            rz = (rz == null) ? 0 : rz;
            item2 = { n: n, tx: tx, ty: ty, tz: tz, rx: rx, ry: ry, rz: rz };
          } else {
            item2 = { row: r, n: row['n'], tx: row['tx'], ty: row['ty'], tz: row['tz'], rx: row['rx'], ry: row['ry'], rz: row['rz'] };
          }
          tmp_node.push(item2);
        }
      }
      if (tmp_node.length > 0) {
        load_node[load_id] = tmp_node;
      }
    }
    return load_node;
  }

  // 要素荷重データ
  private getMemberLoadJson(mode: string = 'file'): any {
    let load_member = {};
    for (let load_id in this.input.load) {
      let load1: any[] = this.input.load[load_id];
      if (load1.length == 0) {
        continue;
      }
      let tmp_member = new Array();
      if (mode == 'file') {
        for (let j = 0; j < load1.length; j++) {
          const row: {} = load1[j];
          let m1 = this.toNumber(row['m1']);
          let m2 = this.toNumber(row['m2']);
          let direction: string = row['direction'];
          let mark = this.toNumber(row['mark']);
          let L1 = this.toNumber(row['L1']);
          let L2 = this.toNumber(row['L2']);
          let P1 = this.toNumber(row['P1']);
          let P2 = this.toNumber(row['P2']);
          if ((m1 != null || m2 != null) && direction != '' && mark != null
            && (L1 != null || L2 != null || P1 != null || P2 != null)) {
            let item1 = {
              row: row['row'], m1: row['m1'], m2: row['m2'], direction: row['direction'], mark: row['mark'],
              L1: row['L1'], L2: row['L2'], P1: row['P1'], P2: row['P2']
            };
            tmp_member.push(item1);
          }
        }
      } else {
        let load2: any[] = this.reMemberLoads(load1);
        for (let j = 0; j < load2.length; j++) {
          const row: {} = load2[j];
          let item2 = {
            m: row['m1'],
            direction: row['direction'],
            mark: row['mark'],
            L1: this.toNumber(row['L1'], 3),
            L2: this.toNumber(row['L2'], 3),
            P1: this.toNumber(row['P1'], 2),
            P2: this.toNumber(row['P2'], 2)
          };
          if (mode != 'calc') {
            item2['row'] = row['row'];
          }
          tmp_member.push(item2);
        }
      }
      if (tmp_member.length > 0) {
        load_member[load_id] = tmp_member;
      }
    }
    return load_member;
  }

  private reMemberLoads(load1: any[]): any {

    // 有効な行を選別する
    let load2 = new Array();
    for (let i = 0; i < load1.length; i++) {
      const row: {} = load1[i];
      let r = row['row'];
      let m1 = this.toNumber(row['m1']);
      let m2 = this.toNumber(row['m2']);
      let direction: string = row['direction'];
      let mark = this.toNumber(row['mark']);
      let L1 = this.toNumber(row['L1']);
      let L2 = this.toNumber(row['L2']);
      let P1 = this.toNumber(row['P1']);
      let P2 = this.toNumber(row['P2']);
      if ((m1 != null || m2 != null) && direction != '' && mark != null
        && (L1 != null || L2 != null || P1 != null || P2 != null)) {

        m1 = (m1 == null) ? 0 : m1;
        m2 = (m2 == null) ? 0 : m2;

        direction = direction.trim();
        let sL1: string = (L1 == null) ? "0" : row['L1'].toString();
        L2 = (L2 == null) ? 0 : L2;
        P1 = (P1 == null) ? 0 : P1;
        P2 = (P2 == null) ? 0 : P2;
        let item2 = { row: r, m1: m1, m2: m2, direction: direction, mark: mark, L1: sL1, L2: L2, P1: P1, P2: P2 };
        load2.push(item2);
      }
    }
    if (load2.length == 0) {
      return new Array();
    }
    // 要素番号 m1,m2 に入力が無い場合 -------------------------------------
    for (let i = 0; i < load2.length; i++) {
      let row = load2[i];
      if (row.m1 == 0) {
        row.m1 = row.m2;
        load2[i] = row;
      }
      if (row.m2 == 0) {
        row.m2 = row.m1;
        load2[i] = row;
      }
    }

    // 要素番号 m2 にマイナスが付いた場合の入力を分ける ------------------------
    let i: number = 0
    let curNo: number = -1
    let curPos: number = 0
    do {
      let row = load2[i];
      if (row.m2 < 0) {
        const reLoadsInfo = this.getMemberGroupLoad(row, curNo, curPos);
        let newLoads = reLoadsInfo['loads'];
        curNo = reLoadsInfo['curNo'];
        curPos = reLoadsInfo['curPos'];
        load2.splice(i, 1);
        for (let j = 0; j < newLoads.length; j++) {
          load2.push(newLoads[j]);
        }
      } else {
        i += 1;
      }
    } while (i < load2.length);

    // 要素番号 m1 != m2 の場合の入力を分ける -----------------------
    i = 0
    do {
      let targetLoad = load2[i];
      let m1 = this.toNumber(targetLoad.m1);
      let m2 = this.toNumber(targetLoad.m2);
      if (m1 < m2) {
        let newLoads = this.getMemberRepeatLoad(targetLoad);
        load2.splice(i, 1);
        for (let j = 0; j < newLoads.length; j++) {
          load2.push(newLoads);
        }
      } else {
        i = i + 1;
      }
    } while (i < load2.length);

    // 距離 にマイナスが付いた場合の入力を直す -------------------
    curNo = -1
    curPos = 0
    for (let i = 0; i < load2.length; i++) {
      let targetLoad = load2[i];
      let sL1: string = targetLoad.L1.toString();
      if (sL1.indexOf('-') >= 0 || targetLoad.L2 < 0) {
        const reLoadsInfo = this.setMemberLoadAddition(targetLoad, curNo, curPos);
        let newLoads = reLoadsInfo['loads'];
        curNo = reLoadsInfo['curNo'];
        curPos = reLoadsInfo['curPos'];
        load2.splice(i, 1);
        for (let j = 0; j < newLoads.length; j++) {
          load2.push(newLoads[j]);
        }
      }
    }
    return load2;
  }

  // 要素番号 m2 にマイナスが付いた場合の入力を分ける
  private getMemberGroupLoad(targetLoad: any, curNo: number, curPos: number): any {

    let result = {};

    // もともとの入力データを保存  . . . . . . . . . . . . . . . . . .
    let org_m1: number = Math.abs(targetLoad.m1);
    let org_m2: number = Math.abs(targetLoad.m2);

    // L1の位置を確定する . . . . . . . . . . . . . . . . . . . . . .
    let m1: number = Math.abs(targetLoad.m1);
    let m2: number = Math.abs(targetLoad.m2);
    let L1: number = Math.abs(this.toNumber(targetLoad.L1));

    let P2: number; let Po: number;
    let L: number; let ll: number; let lo: number;

    let sL1: string = targetLoad.L1.toString();
    if (sL1.indexOf('-') >= 0) {
      // 距離L1が加算モードで入力されている場合
      if (m1 <= curNo && curNo <= m2) {
        m1 = curNo;
        L1 = curPos + L1;
        targetLoad.m1 = m1;
        targetLoad.L1 = L1.toString();
      }
    }

    for (let j = m1; j <= m2; j++) {
      let L: number = this.getMemberLength(j.toString());
      if (L1 > L) {
        L1 = L1 - L;
        targetLoad.m1 = j + 1;
        targetLoad.L1 = L1.toString();
      } else {
        break;
      }
    }
    curNo = targetLoad.m1;
    curPos = this.toNumber(targetLoad.L1);

    // L2の位置を確定する . . . . . . . . . . . . . . . . . . . . . .
    m1 = Math.abs(targetLoad.m1);
    m2 = Math.abs(targetLoad.m2);
    let L2: number = Math.abs(targetLoad.L2);

    switch (targetLoad.mark) {
      case 1:
      case 11:
        if (targetLoad.L2 < 0) {
          L2 = L1 + L2
        }
        for (let j = m1; j <= m2; j++) {
          L = this.getMemberLength(j.toString());
          if (L2 > L) {
            L2 = L2 - L;
            targetLoad.m2 = j + 1;
            targetLoad.L2 = L2;
          } else {
            break;
          }
        }
        curNo = Math.abs(targetLoad.m2);
        curPos = targetLoad.L2;
        break;

      default:
        if (targetLoad.L2 < 0) {
          // 連続部材の全長さLLを計算する
          ll = 0
          for (let j = m1; j <= m2; j++) {
            ll = ll + this.getMemberLength(j.toString());
          }
          L2 = ll - (curPos + L2)
          if (L2 < 0) {
            L2 = 0;
          }
          targetLoad.m2 = m2;
          targetLoad.L2 = L2
        }
        for (let j = m2; j >= org_m1; j--) {
          L = this.getMemberLength(j.toString());
          if (L2 > L) {
            L2 = L2 - L;
            targetLoad.m2 = j - 1;
            targetLoad.L2 = L2
          } else {
            break;
          }
        }
        curNo = Math.abs(targetLoad.m2);
        curPos = L - targetLoad.L2;
        break;
    }

    // ちょうど j端 になったら次の部材の 距離0(ゼロ) とする
    if (curPos >= L - 0.0001) {
      if (org_m2 > curNo) {
        curNo = curNo + 1
        curPos = 0
      }
    }

    // 部材を連続して入力データを作成する  . . . . . . . . . . . . . . . . . . . . . . . . . . .
    let loads = new Array();
    m1 = Math.abs(targetLoad.m1);
    m2 = Math.abs(targetLoad.m2);

    // 連続部材の全長さLLを計算する
    ll = 0
    for (let j = m1; j <= m2; j++) {
      ll = ll + this.getMemberLength(j.toString());
    }
    L1 = this.toNumber(targetLoad.L1);
    L2 = targetLoad.L2;

    switch (targetLoad.mark) {
      case 1:
      case 11:
        if (m1 = m2) {
          let newLoads = {};
          newLoads['direction'] = targetLoad.direction;
          newLoads['mark'] = targetLoad.mark;
          newLoads['m1'] = m1;
          newLoads['m2'] = m2;
          newLoads['L1'] = targetLoad.L1;
          newLoads['L2'] = targetLoad.L2;
          newLoads['P1'] = targetLoad.P1;
          newLoads['P2'] = targetLoad.P2;
          loads.push(newLoads);

        } else {
          let newLoads1 = {};
          newLoads1['direction'] = targetLoad.direction;
          newLoads1['mark'] = targetLoad.mark;
          newLoads1['m1'] = m1;
          newLoads1['m2'] = m1;
          newLoads1['L1'] = targetLoad.L1;
          newLoads1['L2'] = 0;
          newLoads1['P1'] = targetLoad.P1;
          newLoads1['P2'] = 0;
          loads.push(newLoads1);

          let newLoads2 = {};
          newLoads2['direction'] = targetLoad.direction;
          newLoads2['mark'] = targetLoad.mark;
          newLoads2['m1'] = m2;
          newLoads2['m2'] = m2;
          newLoads2['L1'] = targetLoad.L2;
          newLoads2['L2'] = 0;
          newLoads2['P1'] = targetLoad.P2;
          newLoads2['P2'] = 0;
          loads.push(newLoads2);
        }
        break;
      case 9:
        for (let j = m1; j <= m2; j++) {

          let newLoads = {};
          newLoads['direction'] = targetLoad.direction;
          newLoads['mark'] = targetLoad.mark;
          newLoads['m1'] = j.toString();
          newLoads['m2'] = j.toString();
          newLoads['L1'] = "0";
          newLoads['L2'] = 0;
          newLoads['P1'] = targetLoad.P1;
          newLoads['P2'] = targetLoad.P1;
          loads.push(newLoads);
        }
        break;

      default:
        // 中間値を計算
        lo = ll - L1 - L2; // 荷重載荷長
        Po = (targetLoad.P2 - targetLoad.P1) / lo;
        P2 = targetLoad.P1;

        for (let j = m1; j <= m2; j++) {

          let newLoads = {};
          newLoads['direction'] = targetLoad.direction;
          newLoads['mark'] = targetLoad.mark;

          newLoads['m1'] = j.toString();
          newLoads['m2'] = j.toString();
          L = this.getMemberLength(newLoads['m1']);  // 要素長
          switch (j) {
            case m1:
              L = L - L1;
              break;
            case m2:
              L = L - L2;
              break;
          }
          newLoads['L1'] = "0";
          newLoads['L2'] = 0;
          newLoads['P1'] = P2;
          P2 = P2 + Po * L;
          newLoads['P2'] = P2;

          if (j == m1) {
            newLoads['L1'] = targetLoad.L1;
            newLoads['P1'] = targetLoad.P1;
          }
          if (j == m2) {
            newLoads['L2'] = targetLoad.L2;
            newLoads['P2'] = targetLoad.P2;
          }
          loads.push(newLoads);
        }
    }

    // 戻り値を作成する  . . . . . . . . . . . . . . . . . . . . . . . . . . .
    result['loads'] = loads;
    result['curNo'] = curNo;
    result['curPos'] = curPos;
    return result;
  }

  // 要素番号 m1 != m2 の場合の入力を分ける
  private getMemberRepeatLoad(targetLoad: any): any {

    let result = new Array();

    let m1: number = Math.abs(targetLoad.m1);
    let m2: number = Math.abs(targetLoad.m2);

    for (let i = m1; i <= m2; i++) {
      let newLoads = {};
      newLoads['direction'] = targetLoad.direction;
      newLoads['m1'] = i;
      newLoads['m2'] = i;
      newLoads['L1'] = targetLoad.L1;
      newLoads['L2'] = targetLoad.L2;
      newLoads['mark'] = targetLoad.mark;
      newLoads['P1'] = targetLoad.P1;
      newLoads['P2'] = targetLoad.P2;
      result.push(newLoads);
    }
    return result;
  }

  //距離 L2 にマイナスが付いた場合の入力を分ける
  private setMemberLoadAddition(targetLoad: any, curNo: number, curPos: number): any {

    let L: number; let ll: number;

    let m1: number = Math.abs(targetLoad.m1);
    let m2: number = Math.abs(targetLoad.m2);
    let L1: number = Math.abs(targetLoad.L1);
    let L2: number = Math.abs(targetLoad.L2);

    let sL1: string = targetLoad.L1.toString();
    if (sL1.indexOf('-') >= 0) {
      //距離L1が加算モードで入力されている場合
      if (m1 <= curNo && curNo <= m2) {
        m1 = curNo;
        L1 = curPos + L1;
        targetLoad.m1 = m1;
        targetLoad.L1 = L1.toString();
      }
      curNo = targetLoad.m1;
      curPos = this.toNumber(targetLoad.L1);
    }

    if (targetLoad.L2 < 0) {
      // 連続部材の全長さLLを計算する
      ll = 0
      for (let j = m1; j <= m2; j++) {
        ll = ll + this.getMemberLength(j.toString());
      }
      L2 = ll - (curPos + L2);
      if (L2 < 0) {
        L2 = 0;
      }
      targetLoad.m2 = Math.sign(targetLoad.m2) * m2;
      targetLoad.L2 = L2
      L = this.getMemberLength(m2.toString());
      curNo = Math.abs(targetLoad.m2);
      curPos = L - targetLoad.L2
    }

    if (curPos >= L - 0.0001) {
      if (m2 > curNo) {
        curNo = curNo + 1;
        curPos = 0;
      }
    }
    let result = { 'loads': targetLoad, 'curNo': curNo, 'curPos': curPos };
    return result;
  }

  // 有効な 荷重ケース数を調べる
  public getLoadCaseCount(): number {
    let list = new Array();
    list.push(this.getLoadJson('file'));
    list.push(this.getNodeLoadJson('file'));
    list.push(this.getMemberLoadJson('file'));
    let maxCase: number = 0;
    for (let i = 0; i < list.length; i++) {
      let dict = list[i];
      for (let load_id in dict) {
        let load_no: number = this.toNumber(load_id);
        if (maxCase < load_no) {
          maxCase = load_no;
        }
      }
    }
    return maxCase;
  }

  private getDefineJson(mode: string = 'file') {

    let jsonData = {};
    for (let i = 0; i < this.input.define.length; i++) {
      let data = {};
      const row = this.input.define[i];
      const id = row['row'];
      let flg: boolean = false;
      for (let key in row) {
        if (key == 'row' || key == 'name') {
          if (mode == 'file') {
            data[key] = row[key];
          }
        } else {
          const value = row[key];
          if (this.toNumber(value) != null) {
            flg = true;
            if (mode != 'file') {
              key = key.replace('C', '').replace('D', '');
            }
            data[key] = value;
          }
        }
      }
      if (flg == true) {
        jsonData[id] = data;
      }
    }
    return jsonData;
  }

  // 有効な DEFINEケース数を調べる
  public getDefineCaseCount(): number {
    let dict = this.getDefineJson();
    return Object.keys(dict).length;
  }

  private getCombineJson(mode: string = 'file') {

    let jsonData = {};
    for (let i = 0; i < this.input.combine.length; i++) {
      let data = {};
      const row = this.input.combine[i];
      const id = row['row'];
      let flg: boolean = false;
      for (let key in row) {
        if (key == 'row' || key == 'name') {
          if (mode == 'file') {
            data[key] = row[key];
          }
        } else {
          const value = row[key];
          const num = this.toNumber(value);
          if (num != null) {
            flg = true;
            if (mode != 'file') {
              key = key.replace('C', '').replace('D', '');
              data[key] = num;
            } else {
              data[key] = value;
            }
          }
        }
      }
      if (flg == true) {
        jsonData[id] = data;
      }
    }
    return jsonData;
  }

  // 有効な COMBINE ケース数を調べる
  public getCombineCaseCount(): number {
    let dict = this.getCombineJson();
    return Object.keys(dict).length;
  }

  public getCombineName(currentPage: number): string {

    if (currentPage < 1) {
      return "";
    }
    if (currentPage > this.input.combine.length) {
      return "";
    }

    let i = currentPage - 1;
    const tmp = this.input.combine[i];

    let result: string = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  private getPickUpJson(mode: string = 'file') {

    let jsonData = {};
    for (let i = 0; i < this.input.pickup.length; i++) {
      let data = {};
      const row = this.input.pickup[i];
      const id = row['row'];
      let flg: boolean = false;
      for (let key in row) {
        if (key == 'row' || key == 'name') {
          if (mode == 'file') {
            data[key] = row[key];
          }
        } else {
          const value = row[key];
          if (this.toNumber(value) != null) {
            flg = true;
            if (mode != 'file') {
              key = key.replace('C', '').replace('D', '');
            }
            data[key] = value;
          }
        }
      }
      if (flg == true) {
        jsonData[id] = data;
      }
    }
    return jsonData;
  }

  public getPickUpName(currentPage: number): string {

    if (currentPage < 1) {
      return "";
    }
    if (currentPage > this.input.pickup.length) {
      return "";
    }

    let i = currentPage - 1;
    const tmp = this.input.pickup[i];

    let result: string = '';
    if ('name' in tmp) {
      result = tmp['name'];
    }
    return result;
  }

  // 有効な PICKUP ケース数を調べる
  public getPickupCaseCount(): number {
    let dict = this.getPickUpJson();
    return Object.keys(dict).length;
  }

  public getResultText(): string {

    let jsonData= {};

    jsonData['disg'] = this.getDisgJson();
    jsonData['reac'] = this.getReacJson();
    jsonData['fsec'] = this.getFsecJson();

    let result: string = JSON.stringify(jsonData);
    return result;
  }

  private getDisgJson(): object {
    return this.result.disg;
  }

  private getReacJson(): object {
    return this.result.reac;
  }

  private getFsecJson(): object {
    return this.result.fsec;
  }

  
  ////////////////////////////////////////////////////////////////////////////////////
  // ファイルを読み込む ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  public loadInputData(inputText: string): void {
    this.input.clear();
    const jsonData: {} = JSON.parse(inputText);
    this.setNodeJson(jsonData);
    this.setFixNodeJson(jsonData);
    this.setMemberJson(jsonData);
    this.setElementJson(jsonData);
    this.setJointJson(jsonData);
    this.setNoticePointsJson(jsonData);
    this.setFixMemberJson(jsonData);
    this.setLoadJson(jsonData);
    this.setDefineJson(jsonData);
    this.setCombineJson(jsonData);
    this.setPickUpJson(jsonData);
  }

  private setNodeJson(jsonData: {}): void {
    if (!('node' in jsonData)) return;
    const json: {} = jsonData['node'];
    for (var index in json) {
      const item = json[index];
      let result = { id: index, x: item.x, y: item.y, z: item.z };
      this.input.node.push(result);
    }
  }

  private setFixNodeJson(jsonData: {}): void {
    if (!('fix_node' in jsonData)) return;
    const json: {} = jsonData['fix_node'];
    for (var typNo in json) {
      let js: any[] = json[typNo];
      let target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item: {} = js[i];
        let row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        let result = { row: row, n: item['n'], tx: item['tx'], ty: item['ty'], tz: item['tz'], rx: item['rx'], ry: item['ry'], rz: item['rz'] };
        target.push(result);
      }
      this.input.fix_node[typNo] = target;
    }
  }

  private setMemberJson(jsonData: {}): void {
    if (!('member' in jsonData)) return;
    const json: {} = jsonData['member'];
    for (var index in json) {
      const item = json[index];
      let result = { id: index, L: '', ni: item.ni, nj: item.nj, e: item.e, cg: item.cg };
      this.input.member.push(result);
    }
  }

  private setElementJson(jsonData: {}): void {
    if (!('element' in jsonData)) return;
    const json: {} = jsonData['element'];
    for (var typNo in json) {
      const js = json[typNo];
      let target = new Array();
      for (var index in js) {
        const item = js[index];
        let result = { id: index, E: item.E, G: item.G, Xp: item.Xp, A: item.A, J: item.J, Iy: item.Iy, Iz: item.Iz };
        target.push(result);
      }
      this.input.element[typNo] = target;
    }
  }

  private setJointJson(jsonData: {}): void {
    if (!('joint' in jsonData)) return;
    const json: {} = jsonData['joint'];
    for (var typNo in json) {
      let js: any[] = json[typNo];
      let target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item: {} = js[i];
        let row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        let result = { row: row, m: item['m'], xi: item['xi'], yi: item['yi'], zi: item['zi'], xj: item['xj'], yj: item['yj'], zj: item['zj'] };
        target.push(result);
      }
      this.input.joint[typNo] = target;
    }
  }

  private setNoticePointsJson(jsonData: {}): void {
    if (!('notice_points' in jsonData)) return;
    let js: any[] = jsonData['notice_points'];
    for (let i = 0; i < js.length; i++) {
      const item: {} = js[i];
      let row: string = ('row' in item) ? item['row'] : (i + 1).toString();
      const m = item['m'];
      let Points: any[] = item['Points'];
      let result = { row: row, m: m };
      for (var j = 0; j < Points.length; j++) {
        const key = "L" + (j + 1).toString();
        result[key] = Points[j];
      }
      this.input.notice_points.push(result);
    }
  }

  private setFixMemberJson(jsonData: {}): void {
    if (!('fix_member' in jsonData)) return;
    const json: {} = jsonData['fix_member'];
    for (var typNo in json) {
      let js: any[] = json[typNo];
      let target = new Array();
      for (let i = 0; i < js.length; i++) {
        const item: {} = js[i];
        let row: string = ('row' in item) ? item['row'] : (i + 1).toString();
        let result = { row: row, m: item['m'], tx: item['tx'], ty: item['ty'], tz: item['tz'], tr: item['tr'] };
        target.push(result);
      }
      this.input.fix_member[typNo] = target;
    }
  }

  private setLoadJson(jsonData: {}): void {

    if (!('load' in jsonData)) return;
    const json: {} = jsonData['load'];

    for (var index in json) {
      let tmp_load1 = {};
      let tmp_load2 = {};
      const item1: {} = json[index];
      let _rate: string = ('rate' in item1) ? item1['rate'] : '';
      let _symbol: string = ('symbol' in item1) ? item1['symbol'] : '';
      let _name: string = ('name' in item1) ? item1['name'] : '';
      let _fix_node: string = ('fix_node' in item1) ? item1['fix_node'] : '';
      let _fix_member: string = ('fix_member' in item1) ? item1['fix_member'] : '';
      let _element: string = ('element' in item1) ? item1['element'] : '';
      let _joint: string = ('joint' in item1) ? item1['joint'] : '';

      let result1 = { id: index, rate: _rate, symbol: _symbol, name: _name, fix_node: _fix_node, fix_member: _fix_member, element: _element, joint: _joint };
      this.input.load_name.push(result1);

      if ('load_node' in item1) {
        const load_node_list: any[] = item1['load_node']
        for (let i = 0; i < load_node_list.length; i++) {
          const item2: {} = load_node_list[i];
          let _row: string = ('row' in item2) ? item2['row'] : (i + 1).toString();
          let _n: string = ('n' in item2) ? item2['n'] : '';
          let _tx: string = ('tx' in item2) ? item2['tx'] : '';
          let _ty: string = ('ty' in item2) ? item2['ty'] : '';
          let _tz: string = ('tz' in item2) ? item2['tz'] : '';
          let _rx: string = ('rx' in item2) ? item2['rx'] : '';
          let _ry: string = ('ry' in item2) ? item2['ry'] : '';
          let _rz: string = ('rz' in item2) ? item2['rz'] : '';
          let result2 = { row: _row, n: _n, tx: _tx, ty: _ty, tz: _tz, rx: _rx, ry: _ry, rz: _rz };
          tmp_load1[_row] = result2;
        }
      }
      if ('load_member' in item1) {
        const load_member_list: any[] = item1['load_member']
        for (let i = 0; i < load_member_list.length; i++) {
          const item3: {} = load_member_list[i];
          let _row: string = ('row' in item3) ? item3['row'] : (i + 1).toString();
          let _m1: string = ('m1' in item3) ? item3['m1'] : '';
          let _m2: string = ('m2' in item3) ? item3['m2'] : '';
          let _L1: string = ('L1' in item3) ? item3['L1'] : '';

          let _direction: string = ('direction' in item3) ? item3['direction'] : '';
          let _mark: string = ('mark' in item3) ? item3['mark'] : '';

          let _L2: string = ('L2' in item3) ? item3['L2'] : '';
          let _P1: string = ('P1' in item3) ? item3['P1'] : '';
          let _P2: string = ('P2' in item3) ? item3['P2'] : '';
          let result3 = { row: _row, m1: _m1, m2: _m2, direction: _direction, mark: _mark, L1: _L1, L2: _L2, P1: _P1, P2: _P2 };
          tmp_load2[_row] = result3;
        }
      }

      // 同じ行に load_node があったら合成する
      let tmp_load = new Array();
      for (let row1 in tmp_load1) {
        let result2 = tmp_load1[row1];
        if (row1 in tmp_load2) {
          let result3 = tmp_load2[row1];
          result2['m1'] = result3['m1'];
          result2['m2'] = result3['m2'];
          result2['direction'] = result3['direction'];
          result2['mark'] = result3['mark'];
          result2['L1'] = result3['L1'];
          result2['L2'] = result3['L2'];
          result2['P1'] = result3['P1'];
          result2['P2'] = result3['P2'];
          delete tmp_load2[row1];
        }
        tmp_load.push(result2);
      }
      for (let row2 in tmp_load2) {
        let result3 = tmp_load2[row2];
        tmp_load.push(result3);
      }

      this.input.load[index] = tmp_load;
    }
  }

  private setDefineJson(jsonData: {}): void {
    if (!('define' in jsonData)) return;
    const json: {} = jsonData['define'];
    for (let index in json) {
      if (index == null) {
        continue;
      }
      let result: {} = json[index];
      this.input.define.push(result);
    }
  }

  private setCombineJson(jsonData: {}): void {
    if (!('combine' in jsonData)) return;
    const json: {} = jsonData['combine'];
    for (let index in json) {
      if (index == null) {
        continue;
      }
      let result: {} = json[index];
      this.input.combine.push(result);
    }
  }

  private setPickUpJson(jsonData: {}): void {
    if (!('pickup' in jsonData)) return;
    const json: {} = jsonData['pickup'];
    for (let index in json) {
      if (index == null) {
        continue;
      }
      let result: {} = json[index];
      this.input.pickup.push(result);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // 計算結果を読み込む ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  public loadResultData(resultText: string): void {
    this.result.clear();
    let jsonData: {} = null;
    try {
      jsonData = JSON.parse(resultText);
    } catch (e) {
      return;
    }
    // 基本ケース
    this.setDisgJson(jsonData);
    this.setReacJson(jsonData);
    this.setFsecJson(jsonData);
    // 組み合わせケース
    this.CombinePickup();
  }

  public CombinePickup(): void {

    if (this.isCombinePickupChenge = false) {
      return;
    }
    const load = this.getLoadNameJson('calc');
    const define = this.getDefineJson('calc');
    const combine = this.getCombineJson('calc');
    const pickup = this.getPickUpJson('calc');

    // define を集計
    let defList = {};
    if (Object.keys(define).length > 0) {
      for (let defNo in define) {
        let d: object = define[defNo];
        let defines = new Array();
        for (let dKey in d) {
          defines.push(d[dKey]);
        }
        defList[defNo] = defines;
      }
    } else {
      for (let caseNo in load) {
        defList[caseNo] = new Array(caseNo);
      }
    }

    // combine を集計
    let combList = {};
    for (let combNo in combine) {
      let target: object = combine[combNo];
      let combines = new Array([]);
      for (let defNo in target) {
        if (!(defNo in defList)) continue; //なければ飛ばす
        let def = defList[defNo];
        let defKeys = Object.keys(def);
        // defineNo が複数あった場合に配列を複製する
        if (defKeys.length > 1) {
          let count: number = combines.length;
          for (let i = 0; i < count; i++) {
            let base = combines[i];
            for (let j = 1; j < defKeys.length; j++) {
              combines.push(base.slice(0, base.length));
            }
          }
        }
        // 組み合わせにケース番号を登録する
        let coef = target[defNo]
        let j: number = 0;
        for (let i = 0; i < combines.length; i++) {
          let caseNo: string = def[defKeys[j]];
          if (caseNo.indexOf('-') >= 0) {
            caseNo = caseNo.replace('-', '');
            coef = -1 * coef;
          }
          combines[i].push({ caseNo: caseNo, coef: coef });
          j++;
          if (j == defKeys.length) j = 0;
        }
      }
      combList[combNo] = combines;
    }


    // pickup を集計
    let pickList = {};
    for (let pickNo in pickup) {
      let p: object = pickup[pickNo];
      let combines = new Array();
      for (let pKey in p) {
        const comNo: string = p[pKey];
        if (!(comNo in combList)) continue; //なければ飛ばす
        combines.push(comNo);
      }
      pickList[pickNo] = combines;
    }

    this.setDisgCombineJson(combList);
    this.setReacCombineJson(combList);
    this.setFsecCombineJson(combList);
    this.setDisgPickupJson(pickList);
    this.setReacPickupJson(pickList);
    this.setFsecPickupJson(pickList);

    this.isCombinePickupChenge = false;
  }

  private setDisgJson(jsonData: {}): void {
    let max_row: number = 0;
    for (let caseNo in jsonData) {
      let target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) != 'object') {
        continue;
      }
      if (!('disg' in caseData)) {
        continue;
      }
      const json: {} = caseData['disg'];
      for (let n in json) {
        const item: {} = json[n];

        let dx: number = this.toNumber(item['dx']);
        let dy: number = this.toNumber(item['dy']);
        let dz: number = this.toNumber(item['dz']);
        let rx: number = this.toNumber(item['rx']);
        let ry: number = this.toNumber(item['ry']);
        let rz: number = this.toNumber(item['rz']);
        dx = (dx == null) ? 0 : dx;
        dy = (dy == null) ? 0 : dy;
        dz = (dz == null) ? 0 : dz;
        rx = (rx == null) ? 0 : rx;
        ry = (ry == null) ? 0 : ry;
        rz = (rz == null) ? 0 : rz;
        let result = {
          id: n,
          dx: dx.toFixed(3),
          dy: dy.toFixed(3),
          dz: dz.toFixed(3),
          rx: rx.toFixed(3),
          ry: ry.toFixed(3),
          rz: rz.toFixed(3)
        };
        target.push(result);
      }
      this.result.disg[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.DISG_ROWS_COUNT = max_row;
  }

  private setReacJson(jsonData: {}): void {
    let max_row: number = 0;
    for (let caseNo in jsonData) {
      let target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) != 'object') {
        continue;
      }
      if (!('reac' in caseData)) {
        continue;
      }
      const json: {} = caseData['reac'];
      for (let n in json) {
        const item: {} = json[n];

        let tx: number = this.toNumber(item['tx']);
        let ty: number = this.toNumber(item['ty']);
        let tz: number = this.toNumber(item['tz']);
        let mx: number = this.toNumber(item['mx']);
        let my: number = this.toNumber(item['my']);
        let mz: number = this.toNumber(item['mz']);

        tx = (tx == null) ? 0 : tx;
        ty = (ty == null) ? 0 : ty;
        tz = (tz == null) ? 0 : tz;
        mx = (mx == null) ? 0 : mx;
        my = (my == null) ? 0 : my;
        mz = (mz == null) ? 0 : mz;

        let result = {
          id: n,
          tx: tx.toFixed(2),
          ty: ty.toFixed(2),
          tz: tz.toFixed(2),
          mx: mx.toFixed(2),
          my: my.toFixed(2),
          mz: mz.toFixed(2)
        };
        target.push(result);
      }
      this.result.reac[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.REAC_ROWS_COUNT = max_row;
  }

  private setFsecJson(jsonData: {}): void {
    let max_row: number = 0;
    for (let caseNo in jsonData) {
      let target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) != 'object') {
        continue;
      }
      if (!('fsec' in caseData)) {
        continue;
      }
      const json: {} = caseData['fsec'];
      let row: number = 0;
      let memberNo: string = '';
      for (let m in json) {

        let noticePoint: number = 0.0;
        memberNo = m;
        const js: {} = json[m];

        let result = {};
        let old = {};
        const node = this.getNodeNo(memberNo)
        let ni: string = node['ni'];
        let nj: string = "";
        let counter: number = 0;
        const data_length: number = Object.keys(js).length;
        for (let p in js) {
          counter++;
          const item: {} = js[p];
          let fxi: number = this.toNumber(item['fxi']);
          let fyi: number = this.toNumber(item['fyi']);
          let fzi: number = this.toNumber(item['fzi']);
          let mxi: number = this.toNumber(item['mxi']);
          let myi: number = this.toNumber(item['myi']);
          let mzi: number = this.toNumber(item['mzi']);
          fxi = (fxi == null) ? 0 : fxi;
          fyi = (fyi == null) ? 0 : fyi;
          fzi = (fzi == null) ? 0 : fzi;
          mxi = (mxi == null) ? 0 : mxi;
          myi = (myi == null) ? 0 : myi;
          mzi = (mzi == null) ? 0 : mzi;
          result = {
            m: memberNo,
            n: ni,
            l: noticePoint.toFixed(3),
            fx: fxi.toFixed(2),
            fy: fyi.toFixed(2),
            fz: fzi.toFixed(2),
            mx: mxi.toFixed(2),
            my: myi.toFixed(2),
            mz: mzi.toFixed(2)
          };
          if (!this.objectEquals(old, result)) {
            Object.assign(old, result);
            row++;
            result['row'] = row;
            target.push(result);
          }

          memberNo = '';
          ni = '';
          if (counter == data_length) {
            nj = node['nj'];
          }
          noticePoint += this.toNumber(item['L']);
          let fxj: number = this.toNumber(item['fxj']);
          let fyj: number = this.toNumber(item['fyj']);
          let fzj: number = this.toNumber(item['fzj']);
          let mxj: number = this.toNumber(item['mxj']);
          let myj: number = this.toNumber(item['myj']);
          let mzj: number = this.toNumber(item['mzj']);
          fxj = (fxj == null) ? 0 : fxj;
          fyj = (fyj == null) ? 0 : fyj;
          fzj = (fzj == null) ? 0 : fzj;
          mxj = (mxj == null) ? 0 : mxj;
          myj = (myj == null) ? 0 : myj;
          mzj = (mzj == null) ? 0 : mzj;
          result = {
            m: '',
            n: nj,
            l: noticePoint.toFixed(3),
            fx: fxj.toFixed(2),
            fy: fyj.toFixed(2),
            fz: fzj.toFixed(2),
            mx: mxj.toFixed(2),
            my: myj.toFixed(2),
            mz: mzj.toFixed(2)
          };
          if (!this.objectEquals(old, result)) {
            Object.assign(old, result);
            row++;
            result['row'] = row;
            target.push(result);
          }

        }
      }
      this.result.fsec[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.FSEC_ROWS_COUNT = max_row;
  }

  private setDisgCombineJson(combList: any): void {

    try {

      //combineのループ
      for (let combNo in combList) {
        let resultDisg = { dx_max: {}, dx_min: {}, dy_max: {}, dy_min: {}, dz_max: {}, dz_min: {}, rx_max: {}, rx_min: {}, ry_max: {}, ry_min: {}, rz_max: {}, rz_min: {} };

        //defineのループ
        let combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          let combineDisg = { dx: {}, dy: {}, dz: {}, rx: {}, ry: {}, rz: {} };

          // 基本ケースのループ
          let com = combines[i];
          for (let j = 0; j < com.length; j++) {
            let caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.disg)) {
              continue;
            }
            //節点番号のループ
            let disgs: any[] = this.result.disg[caseInfo.caseNo];
            for (let i = 0; i < disgs.length; i++) {
              let result: {} = disgs[i];
              const id = result['id'];

              // dx, dy … のループ
              for (let key1 in combineDisg) {
                let value = combineDisg[key1];
                let temp: {} = (id in value) ? value[id] : { id: id, dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (let key2 in result) {
                  if (key2 == 'id') continue;
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += "+" + caseInfo.caseNo.toString();
                value[id] = temp;
                combineDisg[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ["_max", "_min"];
          for (let key1 in combineDisg) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultDisg[key2];
              const current = combineDisg[key1];
              // 節点番号のループ
              for (let id in current) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultDisg[key2] = old;
                  continue;
                }
                const target = current[id];
                let comparison = old[id]
                if ((n == 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultDisg[key2] = old;
                }
              }
            }
          }

        }
        this.result.disgCombine[combNo] = resultDisg;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setReacCombineJson(combList: any): void {

    try {

      //combineのループ
      for (let combNo in combList) {
        let resultReac = { tx_max: {}, tx_min: {}, ty_max: {}, ty_min: {}, tz_max: {}, tz_min: {}, mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {} };

        //defineのループ
        let combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          let combineReac = { tx: {}, ty: {}, tz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          let com = combines[i];
          for (let j = 0; j < com.length; j++) {
            let caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.disg)) {
              continue;
            }
            //節点番号のループ
            let Reacs: any[] = this.result.reac[caseInfo.caseNo];
            for (let i = 0; i < Reacs.length; i++) {
              let result: {} = Reacs[i];
              const id = result['id'];

              // dx, dy … のループ
              for (let key1 in combineReac) {
                let value = combineReac[key1];
                let temp: {} = (id in value) ? value[id] : { id: id, tx: 0, ty: 0, tz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (let key2 in result) {
                  if (key2 == 'id') continue;
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += "+" + caseInfo.caseNo.toString();
                value[id] = temp;
                combineReac[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ["_max", "_min"];
          for (let key1 in combineReac) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultReac[key2];
              const current = combineReac[key1];
              // 節点番号のループ
              for (let id in current) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultReac[key2] = old;
                  continue;
                }
                const target = current[id];
                let comparison = old[id]
                if ((n == 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultReac[key2] = old;
                }
              }
            }
          }
        }
        this.result.reacCombine[combNo] = resultReac;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setFsecCombineJson(combList: any): void {

    try {

      //combineのループ
      for (let combNo in combList) {
        let resultFsec = { fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {}, mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {} };

        //defineのループ
        let combines: any[] = combList[combNo];
        for (let i = 0; i < combines.length; i++) {
          let combineFsec = { fx: {}, fy: {}, fz: {}, mx: {}, my: {}, mz: {} };

          // 基本ケースのループ
          let com = combines[i];
          for (let j = 0; j < com.length; j++) {
            let caseInfo = com[j];

            if (!(caseInfo.caseNo in this.result.fsec)) {
              continue;
            }
            //節点番号のループ
            let Fsecs: any[] = this.result.fsec[caseInfo.caseNo];
            for (let i = 0; i < Fsecs.length; i++) {
              let result: {} = Fsecs[i];
              const row = result['row'];

              // dx, dy … のループ
              for (let key1 in combineFsec) {
                let value = combineFsec[key1];
                let temp: {} = (row in value) ? value[row] : { row: row, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, case: '' };

                // x, y, z, 変位, 回転角 のループ
                for (let key2 in result) {
                  if (key2 == 'row') continue;
                  if (key2 == 'm' || key2 == 'n' || key2 == 'l') {
                    temp[key2] = result[key2];
                    continue;
                  }
                  temp[key2] += caseInfo.coef * result[key2];
                }
                temp['case'] += "+" + caseInfo.caseNo.toString();
                value[row] = temp;
                combineFsec[key1] = value;
              }
            }
          }

          // dx, dy … のループ
          const k: string[] = ["_max", "_min"];
          for (let key1 in combineFsec) {
            for (let n = 0; n < k.length; n++) {
              let key2: string;
              key2 = key1 + k[n];
              const old = resultFsec[key2];
              const current = combineFsec[key1];
              // 節点番号のループ
              for (let id in current) {
                if (!(id in old)) {
                  old[id] = current[id];
                  resultFsec[key2] = old;
                  continue;
                }
                const target = current[id];
                let comparison = old[id]
                if ((n == 0 && comparison[key1] < target[key1])
                  || (n > 0 && comparison[key1] > target[key1])) {
                  old[id] = target;
                  resultFsec[key2] = old;
                }
              }
            }
          }

        }
        this.result.fsecCombine[combNo] = resultFsec;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setDisgPickupJson(pickList: any): void {
    try {
      //pickupのループ
      for (let pickNo in pickList) {
        let combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.disgCombine[combNo];
          if (tmp == null) {
            tmp = com;
            continue;
          }
          for (let k in com) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (let id in comparison) {
              let a = comparison[id];
              let b = target[id];
              if (key[1] == 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.disgPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setReacPickupJson(pickList: any): void {
    try {
      //pickupのループ
      for (let pickNo in pickList) {
        let combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.reacCombine[combNo];
          if (tmp == null) {
            tmp = com;
            continue;
          }
          for (let k in com) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (let id in comparison) {
              let a = comparison[id];
              let b = target[id];
              if (key[1] == 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.reacPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private setFsecPickupJson(pickList: any): void {
    try {
      //pickupのループ
      for (let pickNo in pickList) {
        let combines: any[] = pickList[pickNo];
        let tmp: {} = null;
        for (let i = 0; i < combines.length; i++) {
          const combNo: string = combines[i];
          const com = this.result.fsecCombine[combNo];
          if (tmp == null) {
            tmp = com;

            continue;
          }
          for (let k in com) {
            const key = k.split('_');
            const target = com[k];
            const comparison = tmp[k];
            for (let id in comparison) {
              let a = comparison[id];
              let b = target[id];
              if (key[1] == 'max') {
                if (b[key[0]] > a[key[0]]) {
                  tmp[k] = com[k];
                }
              } else {
                if (b[key[0]] < a[key[0]]) {
                  tmp[k] = com[k];
                }
              }
            }
          }
        }
        this.result.fsecPickup[pickNo] = tmp;
      }
    } catch (e) {
      console.log(e);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // Helper 関数 /////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  private objectEquals(a: any, b: any): boolean {

    if (a === b) {
      // 同一インスタンスならtrueを返す
      return true;
    }

    // 比較対象双方のキー配列を取得する（順番保証のためソートをかける）
    let aKeys = Object.keys(a).sort();
    let bKeys = Object.keys(b).sort();

    // 比較対象同士のキー配列を比較する
    if (aKeys.toString() !== bKeys.toString()) {
      // キーが違う場合はfalse
      return false;
    }

    // 値をすべて調べる。
    let wrongIndex = aKeys.findIndex(function (value) {
      // 注意！これは等価演算子で正常に比較できるもののみを対象としています。
      // つまり、ネストされたObjectやArrayなどには対応していないことに注意してください。
      return a[value] !== b[value];
    });

    // 合致しないvalueがなければ、trueを返す。
    return wrongIndex === -1;
  }

  // 文字列string を数値にする
  private toNumber(num: string, digit: number = null): number {
    let result: number = null;
    try {
      let tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch{
      result = null;
    }
    if (digit != null) {
      const dig: number = 10 ** digit;
      result = Math.round(result * dig) / dig;
    }
    return result;
  }

  // 補助関数
  private getNodeNo(memberNo: string) {
    let jsonData = { ni: '', nj: '' };

    const memberList: {} = this.getMemberJson('unity-members');
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

  private getNodePos(nodeNo: string) {
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

  public getMemberLength(memberNo: string): number {
    const node: {} = this.getNodeNo(memberNo);
    const ni: string = node['ni'];
    const nj: string = node['nj'];
    if (ni == '' || nj == '') {
      return null
    }
    const iPos = this.getNodePos(ni)
    const jPos = this.getNodePos(nj)
    if (iPos == null || jPos == null) {
      return null
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

}
