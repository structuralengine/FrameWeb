import { Injectable } from '@angular/core';
import { InputDataService } from './input-data.service';
import { ResultDataService } from './result-data.service';
import { templateJitUrl } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class FrameDataService {

  constructor(private input: InputDataService,
    private result: ResultDataService) {
  }

  public clear(): void{
    this.input.clear();
    this.result.clear();
  }


  // データを生成
  // mode file:ファイルに保存用データを生成
  //      unity: unity に送信用データを生成
  //      calc: 計算サーバーに送信用データを生成
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
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('nodes') < 0) {
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
      if (mode =='calc') {
        x = (x == null) ? 0 : x;
        y = (y == null) ? 0 : y;
        z = (z == null) ? 0 : z;
        item = { "x": x, "y": y, "z": z };
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
        if (mode =='calc') {
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
    if (mode.indexOf('unity-') >= 0 && mode.indexOf('members') < 0) {
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
      if (mode =='calc') {
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
        if (mode =='calc') {
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
      if (mode=='calc') {
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
      load_name[i] = jsonData;
    }

    // 節点荷重データ
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

    // 要素荷重データ
    let load_member = {};
    for (let load_id in this.input.load) {

      let tmp_member = new Array();

      let load: any[] = this.input.load[load_id];
      for (let j = 0; j < load.length; j++) {
        const row: {} = load[j];
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

          let item1 = {};
          if (mode == 'calc') {
            direction = direction.trim();
            L1 = (L1 == null) ? 0 : L1;
            L2 = (L2 == null) ? 0 : L2;
            P1 = (P1 == null) ? 0 : P1;
            P2 = (P2 == null) ? 0 : P2;
            //m1, m2 の変換処理をすること sasa
            item1 = { m: m1, direction: direction, mark: mark, L1: L1, L2: L2, P1: P1, P2: P2 };
          } else {
            item1 = {
              row: r, m1: row['m1'], m2: row['m2'], direction: row['direction'], mark: row['mark'],
              L1: row['L1'], L2: row['L2'], P1: row['P1'], P2: row['P2']
            };
          }
          tmp_member.push(item1);
        }
      }
      if (tmp_member.length > 0) {
        load_member[load_id] = tmp_member;
      }
    }
    
    // 合成する
    if (mode == 'file'){
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

  private getDefineJson() {

    let jsonData = {};
    for (let i = 0; i < this.input.define.length; i++) {
      const key: string = (i + 1).toString();
      const row = this.input.define[i];
      for (var j = 1; j <= InputDataService.DEFINE_CASE_COUNT; j++) {
        const key = "C" + j;
        if (!(key in row)) {
          continue;
        }
        const tmp = this.toNumber(row[key]);
        if (tmp != null) {
          jsonData[key]= row;
          break;
        }
      }
    }
    return jsonData;
  }

  private getCombineJson() {

    let jsonData = {};
    for (let i = 0; i < this.input.combine.length; i++) {
      const key: string = (i + 1).toString();
      const row = this.input.combine[i];
      for (var j = 1; j <= InputDataService.COMBINE_CASE_COUNT; j++) {
        const key = "C" + j;
        if (!(key in row)) {
          continue;
        }
        const tmp = this.toNumber(row[key]);
        if (tmp != null) {
          jsonData[key] = row;
          break;
        }
      }
    }
    return jsonData;
  }

  private getPickUpJson() {

    let jsonData = [];
    for (let i = 0; i < this.input.pickup.length; i++) {
      const key: string = (i + 1).toString();
      const row = this.input.pickup[i];
      for (var j = 1; j <= InputDataService.PICKUP_CASE_COUNT; j++) {
        const key = "C" + j;
        if (!(key in row)) {
          continue;
        }
        const tmp = this.toNumber(row[key]);
        if (tmp != null) {
          jsonData[key]=row;
          break;
        }
      }
    }
    return jsonData;
  }

  // ファイルを読み込む
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

    let tmp_load1 = {};
    let tmp_load2 = {};
    for (var index in json) {
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
          let _L2: string = ('L2' in item3) ? item3['L2'] : '';
          let _P1: string = ('P1' in item3) ? item3['P1'] : '';
          let _P2: string = ('P2' in item3) ? item3['P2'] : '';
          let result3 = { row: _row,  m1: _m1, m2: _m2, L1: _L1, L2: _L2, P1: _P1, P2: _P2 };
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
      let result: {} = json[index];
      result['row'] = index;
      this.input.define.push(result);
    }
  }

  private setCombineJson(jsonData: {}): void {
    if (!('combine' in jsonData)) return;
    const json: {} = jsonData['combine'];
    for (let index in json) {
      let result: {} = json[index];
      result['row'] = index;
      this.input.combine.push(result);
    }
  }

  private setPickUpJson(jsonData: {}): void {
    if (!('pickup' in jsonData)) return;
    const json: {} = jsonData['pickup'];
    for (let index in json) {
      let result: {} = json[index];
      result['row'] = index;
      this.input.pickup.push(result);
    }
  }

  // 計算結果を読み込む
  public loadResultData(resultText: string): void{
    this.result.clear();
    const jsonData: {} = JSON.parse(resultText);
    this.setDisgJson(jsonData);
    this.setReacJson(jsonData);
    this.setFsecJson(jsonData);
  }

  private setDisgJson(jsonData: {}): void {
    let max_row: number = 0;
    for (let caseNo in jsonData) {
      let target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof(caseData)!='object') {
        continue;
      }
      if (!('disg' in caseData)) { 
        continue;
      }
      const json: {} = caseData['disg'];
      for (let n in json) {
        const item: {} = json[n];
        let result = { id: n, dx: item['dx'], dy: item['dy'], dz: item['dz'], rx: item['rx'], ry: item['ry'], rz: item['rz'] };
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
        let result = { id: n, tx: item['tx'], ty: item['ty'], tz: item['tz'], mx: item['mx'], my: item['my'], mz: item['mz'] };
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
        const node = this.getNodeNo(memberNo)
        let ni: string = node['ni'];
        let nj: string;
        let counter: number = 0;
        const data_length: number = Object.keys(js).length;
        for (let p in js) {
          counter++;
          const item: {} = js[p];
          row++;
          result = { row: row, m: memberNo, n: ni, l: noticePoint, fx: item['fxi'], fy: item['fyi'], fz: item['fzi'], mx: item['mxi'], my: item['myi'], mz: item['mzi'] };
          target.push(result);
          memberNo = '';
          ni = '';
          if (counter == data_length) {
            nj = node['nj'];
          }
          noticePoint += this.toNumber(item['L']);
          row++;
          result = { row: row, m: '', n: nj, l: noticePoint, fx: item['fxj'], fy: item['fyj'], fz: item['fzj'], mx: item['mxj'], my: item['myj'], mz: item['mzj'] };
          target.push(result);
        }
      }
      this.result.fsec[caseNo] = target;
      max_row = Math.max(max_row, target.length);
    }
    this.result.FSEC_ROWS_COUNT = max_row;
  }

  // 文字列string を数値にする
  private toNumber(num: string): number {
    let result: number = null;
    try {
      let tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch{
      result = null;
    }
    return result;
  }

  // 補助関数
  private getNodeNo(memberNo: string) {
    let jsonData = { ni: '', nj: '' };

    const memberList: {} = this.getMemberJson('calc');
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
    const nodeList: {} = this.getNodeJson('calc');
    if (Object.keys(nodeList).length <= 0) {
      return null;
    }
    if (!(nodeNo in nodeList)) {
      return null;
    }
    const node = nodeList[nodeNo];
    return node;
  }

  public getMemberLength(memberNo: string): any{
    const node: {} = this.getNodeNo(memberNo);
    const ni: string = node['ni'];
    const nj: string = node['nj'];
    if (ni == '' || nj == '') {
      return '';
    }
    const iPos = this.getNodePos(ni)
    const jPos = this.getNodePos(nj)
    if (iPos == null || jPos == null) {
      return '';
    }
    const xi: number = iPos['x'];
    const yi: number = iPos['y'];
    const zi: number = iPos['z'];
    const xj: number = jPos['x'];
    const yj: number = jPos['y'];
    const zj: number = jPos['z'];

    const result: number = Math.sqrt((xi - xj) ** 2 + (yi - yj) ** 2 + (zi - zj) ** 2 );
    return result;
    
  }

}
