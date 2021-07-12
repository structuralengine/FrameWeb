import { Injectable } from "@angular/core";
import { RouterLinkWithHref } from "@angular/router";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { InputMembersService } from "../input-members/input-members.service";

@Injectable({
  providedIn: "root",
})
export class InputLoadService {
  public load_name: any[];
  public load: {};

  constructor(
    private member: InputMembersService,
    private helper: DataHelperModule
  ) {
    this.clear();
  }

  public clear(): void {
    this.load_name = new Array();
    this.load = {};
  }

  public partClear(row): void {
    this.load[row] = new Array();
  }

  public getLoadNameColumns(index: number): any {
    const caseNo: string = index.toString();

    let result = this.load_name.find((tmp) => {
      return tmp.id === caseNo;
    });

    if (result === undefined) {
      result = {
        id: caseNo,
        rate: "",
        symbol: "",
        name: "",
        fix_node: "",
        fix_member: "",
        element: "",
        joint: "",
      };
      this.load_name.push(result);
    }
    return result;
  }

  public getLoadColumns(index: number, row: number): any {
    const typNo: string = index.toString();

    let target: any;
    let result: any = undefined;

    // タイプ番号を探す
    if (!this.load[typNo]) {
      target = new Array();
    } else {
      target = this.load[typNo];
    }

    // 行を探す
    result = target.find((tmp) => {
      return tmp.row === row;
    });

    // 対象行が無かった時に処理
    if (result === undefined) {
      result = {
        row: row,
        m1: "",
        m2: "",
        direction: "",
        mark: "",
        L1: "",
        L2: "",
        P1: "",
        P2: "",
        n: "",
        tx: "",
        ty: "",
        tz: "",
        rx: "",
        ry: "",
        rz: "",
      };
      target.push(result);
      this.load[typNo] = target;
    }
    return result;
  }

  public setLoadJson(jsonData: {}): void {
    if (!("load" in jsonData)) {
      return;
    }

    this.clear();

    const json: {} = jsonData["load"];

    for (const index of Object.keys(json)) {
      const tmp_load1 = {};
      const tmp_load2 = {};

      const item1: {} = json[index];

      const _rate: string = "rate" in item1 ? item1["rate"] : "";
      const _symbol: string = "symbol" in item1 ? item1["symbol"] : "";
      const _name: string = "name" in item1 ? item1["name"] : "";
      const _fix_node: string = "fix_node" in item1 ? item1["fix_node"] : "";
      const _fix_member: string =
        "fix_member" in item1 ? item1["fix_member"] : "";
      const _element: string = "element" in item1 ? item1["element"] : "";
      const _joint: string = "joint" in item1 ? item1["joint"] : "";

      this.load_name.push({
        id: index,
        rate: _rate,
        symbol: _symbol,
        name: _name,
        fix_node: _fix_node,
        fix_member: _fix_member,
        element: _element,
        joint: _joint,
      });

      if ("load_node" in item1) {
        const load_node_list: any[] = item1["load_node"];
        for (let i = 0; i < load_node_list.length; i++) {
          const item2 = load_node_list[i];

          const _row: string = "row" in item2 ? item2["row"] : i + 1;

          const _n: string = "n" in item2 ? item2.n : "";
          let _tx: string = "";
          if("tx" in item2 ) _tx = item2.tx;
          if("dx" in item2 ) _tx = item2.dx;
          let _ty: string = "";
          if("ty" in item2 ) _ty = item2.ty;
          if("dy" in item2 ) _ty = item2.dy;
          let _tz: string = "";
          if("tz" in item2 ) _tz = item2.tz;
          if("dz" in item2 ) _tz = item2.dz;
          let _rx: string = "";
          if("rx" in item2 ) _rx = item2.rx;
          if("ax" in item2 ) _rx = item2.ax;
          let _ry: string = "";
          if("ry" in item2 ) _ry = item2.ry;
          if("ay" in item2 ) _ry = item2.ay;
          let _rz: string = "";
          if("rz" in item2 ) _rz = item2.rz;
          if("az" in item2 ) _rz = item2.az;
          

          tmp_load1[_row] = {
            row: _row,
            n: _n,
            tx: _tx,
            ty: _ty,
            tz: _tz,
            rx: _rx,
            ry: _ry,
            rz: _rz,
          };
        }
      }
      if ("load_member" in item1) {
        const load_member_list: any[] = item1["load_member"];

        for (let i = 0; i < load_member_list.length; i++) {
          const item3 = load_member_list[i];
          const _row: string = "row" in item3 ? item3.row : (i + 1).toString();
          const _m1: string = "m1" in item3 ? item3.m1 : "";
          const _m2: string = "m2" in item3 ? item3.m2 : "";
          const _L1: string = "L1" in item3 ? item3.L1 : "";

          const _direction: string =
            "direction" in item3 ? item3.direction : "";
          const _mark: string = "mark" in item3 ? item3.mark : "";

          const _L2: string = "L2" in item3 ? item3.L2 : "";
          const _P1: string = "P1" in item3 ? item3.P1 : "";
          const _P2: string = "P2" in item3 ? item3.P2 : "";

          tmp_load2[_row] = {
            row: _row,
            m1: _m1,
            m2: _m2,
            direction: _direction,
            mark: _mark,
            L1: _L1,
            L2: _L2,
            P1: _P1,
            P2: _P2,
          };
        }
      }

      // 同じ行に load_node があったら合成する
      const tmp_load = new Array();
      for (const row1 of Object.keys(tmp_load1)) {
        const result2 = tmp_load1[row1];
        if (row1 in tmp_load2) {
          const result3 = tmp_load2[row1];
          result2["m1"] = result3["m1"];
          result2["m2"] = result3["m2"];
          result2["direction"] = result3["direction"];
          result2["mark"] = result3["mark"];
          result2["L1"] = result3["L1"];
          result2["L2"] = result3["L2"];
          result2["P1"] = result3["P1"];
          result2["P2"] = result3["P2"];
          delete tmp_load2[row1];
        }
        tmp_load.push(result2);
      }
      for (const row2 of Object.keys(tmp_load2)) {
        const result3 = tmp_load2[row2];
        tmp_load.push(result3);
      }

      this.load[index] = tmp_load;
    }
  }

  public getLoadJson(empty: number = null) {
    const result = {};

    // 荷重基本設定
    const load_name = this.getLoadNameJson(empty);

    // 節点荷重データ
    const load_node = this.getNodeLoadJson(empty);

    // 要素荷重データ
    const load_member = this.getMemberLoadJson(empty);

    // 合成する
    if (empty === null) {
      for (const load_id of Object.keys(load_name)) {
        const jsonData = load_name[load_id];
        if (load_id in load_node) {
          jsonData["load_node"] = load_node[load_id];
          delete load_node[load_id];
        }
        if (load_id in load_member) {
          jsonData["load_member"] = load_member[load_id];
          delete load_member[load_id];
        }
        result[load_id] = jsonData;
        delete load_name[load_id];
      }
    }

    //
    for (const load_id of Object.keys(load_node)) {
      let jsonData = {};
      if (load_id in load_name) {
        jsonData = load_name[load_id];
      } else {
        jsonData = { fix_node: 1, fix_member: 1, element: 1, joint: 1 };
      }
      jsonData["load_node"] = load_node[load_id];
      if (load_id in load_member) {
        jsonData["load_member"] = load_member[load_id];
        delete load_member[load_id];
      }
      result[load_id] = jsonData;
      delete load_name[load_id];
    }

    //
    for (const load_id of Object.keys(load_member)) {
      let jsonData = {};
      if (load_id in load_name) {
        jsonData = load_name[load_id];
      } else {
        jsonData = { fix_node: 1, fix_member: 1, element: 1, joint: 1 };
      }
      jsonData["load_member"] = load_member[load_id];
      result[load_id] = jsonData;
      delete load_member[load_id];
    }

    // 無効なデータを削除する
    const deleteKey: string[] = Array();
    for (const load_id of Object.keys(result)) {
      let jsonData = result[load_id];
      let flg: boolean = false;
      if(empty === 0){
        flg = true;
        for (const key of ["fix_node", "fix_member", "element", "joint"]) {
          if (jsonData[key] === empty) {
            jsonData[key] = 1;
          }
        }
      } else {
        for (const key of Object.keys(jsonData)) {
          if (jsonData[key] !== empty) {
            flg = true;
            break;
          }
        }
      }
      if (flg === false) {
        deleteKey.push(load_id);
      } else if (empty ===0) {
        const ln = "load_node" in jsonData ? jsonData["load_node"] : [];
        const lm = "load_member" in jsonData ? jsonData["load_member"] : [];
        if (ln.length + lm.length === 0) {
          deleteKey.push(load_id);
        }
      }
    }
    for (const load_id of deleteKey) {
      delete result[load_id];
    }

    return result;
  }

  // 荷重基本データ
  public getLoadNameJson(empty: number = null, targetCase: string = ""): any {
    const load_name = {};

    for (let i = 0; i < this.load_name.length; i++) {
      const tmp = this.load_name[i];
      const key: string = tmp["id"];

      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && key !== targetCase) {
        continue;
      }

      const id = this.helper.toNumber(key);
      if (id == null) {
        continue;
      }

      const rate = this.helper.toNumber(tmp["rate"]);
      const symbol: string = tmp["symbol"];
      const name: string = tmp["name"];

      let fix_node = this.helper.toNumber(tmp["fix_node"]);
      let fix_member = this.helper.toNumber(tmp["fix_member"]);
      let element = this.helper.toNumber(tmp["element"]);
      let joint = this.helper.toNumber(tmp["joint"]);

      if (
        rate == null &&
        symbol === "" &&
        name === "" &&
        fix_node == null &&
        fix_member == null &&
        element == null &&
        joint == null
      ) {
        continue;
      }

      const load_id = (i + 1).toString();

      const temp = {
        fix_node: fix_node == null ? empty : fix_node,
        fix_member: fix_member == null ? empty : fix_member,
        element: element == null ? empty : element,
        joint: joint == null ? empty : joint,
      };

      if (empty === null) {
        temp["rate"] = rate == null ? empty : rate;
        temp["symbol"] = symbol;
        temp["name"] = name;
      }

      load_name[load_id] = temp;
    }
    return load_name;
  }

  public getLoadName(currentPage: number): string {
    if (currentPage < 1) {
      return "";
    }
    if (currentPage > this.load_name.length) {
      return "";
    }

    const i = currentPage - 1;
    const tmp = this.load_name[i];

    let result = "";
    if ("name" in tmp) {
      result = tmp["name"];
    }
    return result;
  }

  // 節点荷重データ
  public getNodeLoadJson(empty: number = null, targetCase: string = ""): any {
    const load_node = {};

    for (const load_id of Object.keys(this.load)) {
      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && load_id !== targetCase) {
        continue;
      }

      const tmp_node = new Array();

      for (const row of this.load[load_id]) {
        let n = this.helper.toNumber(row["n"]);
        let tx = this.helper.toNumber(row["tx"]);
        let ty = this.helper.toNumber(row["ty"]);
        let tz = this.helper.toNumber(row["tz"]);
        let rx = this.helper.toNumber(row["rx"]);
        let ry = this.helper.toNumber(row["ry"]);
        let rz = this.helper.toNumber(row["rz"]);

        if ( n != null &&
          ( tx != null || ty != null || tz != null ||
            rx != null || ry != null || rz != null)) {
          let tmp = {};
          if(n > 0)  {
            tmp = {
              n: row.n,
              tx: tx == null ? empty : tx,
              ty: ty == null ? empty : ty,
              tz: tz == null ? empty : tz,
              rx: rx == null ? empty : rx,
              ry: ry == null ? empty : ry,
              rz: rz == null ? empty : rz
            };
          } else  {
            const coef = (empty===null) ? 1 : 1000;
            const No = (empty===null) ? row["n"] : Math.abs(n).toString();
            tmp = {
              n: No,
              dx: tx == null ? empty : tx / coef,
              dy: ty == null ? empty : ty / coef,
              dz: tz == null ? empty : tz / coef,
              ax: rx == null ? empty : rx / coef,
              ay: ry == null ? empty : ry / coef,
              az: rz == null ? empty : rz / coef
            };
          }

          tmp["row"] = row.row;

          tmp_node.push(tmp);
        }
      }

      if (tmp_node.length > 0) {
        load_node[load_id] = tmp_node;
      }
    }
    return load_node;
  }

  // 要素荷重データ
  public getMemberLoadJson(empty: number = null, targetCase: string = ""): any {
    const load_member = {};

    for (const load_id of Object.keys(this.load)) {
      // ケースの指定がある場合、カレントケース以外は無視する
      if (targetCase.length > 0 && load_id !== targetCase) {
        continue;
      }

      const load1: any[] = this.load[load_id];
      if (load1.length === 0) {
        continue;
      }

      const tmp_member = new Array();
      if (empty === null) {
        for (let j = 0; j < load1.length; j++) {
          const row = load1[j];
          const m1 = this.helper.toNumber(row["m1"]);
          const m2 = this.helper.toNumber(row["m2"]);
          const direction: string = row["direction"];
          const mark = this.helper.toNumber(row["mark"]);
          const L1 = this.helper.toNumber(row["L1"]);
          const L2 = this.helper.toNumber(row["L2"]);
          const P1 = this.helper.toNumber(row["P1"]);
          const P2 = this.helper.toNumber(row["P2"]);

          if (
            (m1 != null || m2 != null) &&
            mark != null && //&& direction != ''
            (L1 != null || L2 != null || P1 != null || P2 != null)
          ) {
            const tmp = {
              m1: row.m1,
              m2: row.m2,
              direction: row.direction,
              mark: row.mark,
              L1: row.L1,
              L2: row.L2,
              P1: P1,
              P2: P2,
            };

            tmp["row"] = row.row;

            tmp_member.push(tmp);
          }
        }
      } else {
        // 計算用のデータ作成

        const load2: any[] = this.convertMemberLoads(load1);

        for (let j = 0; j < load2.length; j++) {
          const row = load2[j];

          const tmp = {
            m: row["m1"],
            direction: row["direction"],
            mark: row["mark"],
            L1: this.helper.toNumber(row["L1"], 3),
            L2: this.helper.toNumber(row["L2"], 3),
            P1: this.helper.toNumber(row["P1"], 2),
            P2: this.helper.toNumber(row["P2"], 2),
          };

          tmp["row"] = row.row;

          tmp_member.push(tmp);
        }
      }
      if (tmp_member.length > 0) {
        load_member[load_id] = tmp_member;
      }
    }
    return load_member;
  }

  // 要素荷重を サーバーで扱える形式に変換する
  private convertMemberLoads(load1: any[]): any {
    // 有効な行を選別する
    const load2 = new Array();
    for (let j = 0; j < load1.length; j++) {
      const row: {} = load1[j];
      const r = row["row"];
      let m1 = this.helper.toNumber(row["m1"]);
      let m2 = this.helper.toNumber(row["m2"]);
      let direction: string = row["direction"];

      if (direction === null || direction === undefined) {
        direction = "";
      }

      const mark = this.helper.toNumber(row["mark"]);
      const L1 = this.helper.toNumber(row["L1"]);
      let L2 = this.helper.toNumber(row["L2"]);
      let P1 = this.helper.toNumber(row["P1"]);
      let P2 = this.helper.toNumber(row["P2"]);

      if (mark === 9) { direction = 'x'; }

      if ((m1 != null || m2 != null) && direction !== "" && mark != null &&
          (L1 != null || L2 != null || P1 != null || P2 != null)) {
        m1 = m1 == null ? 0 : m1;
        m2 = m2 == null ? 0 : m2;

        direction = direction.trim();
        const sL1: string = L1 == null ? "0" : row["L1"].toString();
        L2 = L2 == null ? 0 : L2;
        P1 = P1 == null ? 0 : P1;
        P2 = P2 == null ? 0 : P2;

        load2.push({
          row: r,
          m1: m1,
          m2: m2,
          direction: direction,
          mark: mark,
          L1: sL1,
          L2: L2,
          P1: P1,
          P2: P2,
        });
      }
    }
    if (load2.length === 0) {
      return new Array();
    }

    // 要素番号 m1, m2 に入力が無い場合 -------------------------------------
    for (let j = 0; j < load2.length; j++) {
      const row = load2[j];
      if (row.m1 === 0) {
        row.m1 = row.m2;
        load2[j] = row;
      }
      if (row.m2 === 0) {
        row.m2 = row.m1;
        load2[j] = row;
      }
    }

    //入れ替え
    let i = 0;
    do {
      const row = load2[i];
      if (row.m2 < 0) {
        if (Math.abs(row.m1) > Math.abs(row.m2)) {
          let aaa = row.m1;
          let bbb = -row.m2;
          row.m2 = -aaa;
          row.m1 = bbb;
        }
      }
      i += 1;
    } while (i < load2.length);

    i = 0;
    do {
      const targetLoad = load2[i];
      if (targetLoad.m1 > 0 && targetLoad.m2 > 0) {
        if (targetLoad.m1 > targetLoad.m2) {
          let ccc = targetLoad.m1;
          let ddd = targetLoad.m2;
          targetLoad.m2 = ccc;
          targetLoad.m1 = ddd;
        }
      }
      i += 1;
    } while (i < load2.length);

    // 要素番号 m2 にマイナスが付いた場合の入力を分ける ------------------------
    i = 0;
    let curNo = -1;
    let curPos = 0;
    do {
      const row = load2[i];
      if (row.m2 < 0) {
        const reLoadsInfo = this.getMemberGroupLoad(row, curNo, curPos);
        const newLoads = reLoadsInfo["loads"];
        curNo = reLoadsInfo["curNo"];
        curPos = reLoadsInfo["curPos"];
        load2.splice(i, 1);
        for (let j = 0; j < newLoads.length; j++) {
          load2.push(newLoads[j]);
        }
      } else {
        i += 1;
      }
    } while (i < load2.length);

    // 要素番号 m1 != m2 の場合の入力を分ける -----------------------
    i = 0;
    do {
      const targetLoad = load2[i];
      const m1 = this.helper.toNumber(targetLoad.m1);
      const m2 = this.helper.toNumber(targetLoad.m2);
      if (m1 < m2) {
        const newLoads = this.getMemberRepeatLoad(targetLoad);

        // let b = m1;
        // let c = b.toString();
        // targetLoad.m1 = c;
        // let d = m2;
        // let e = d.toString();
        // targetLoad.m2 = e;

        load2.splice(i, 1);
        for (let j = 0; j < newLoads.length; j++) {
          load2.push(newLoads[j]);
        }
      } else {
        i += 1;
      }
    } while (i < load2.length);

    // 距離 にマイナスが付いた場合の入力を直す -------------------
    curNo = -1;
    curPos = 0;
    for (let j = 0; j < load2.length; j++) {
      const targetLoad = load2[j];
      const sL1: string = targetLoad.L1.toString();
      if (sL1.includes("-") || targetLoad.L2 < 0) {
        const reLoadsInfo = this.setMemberLoadAddition(
          targetLoad,
          curNo,
          curPos
        );
        const newLoads = reLoadsInfo["loads"];
        curNo = reLoadsInfo["curNo"];
        curPos = reLoadsInfo["curPos"];
        //load2.splice(j, 1);
        for (let k = 0; k < newLoads.length; k++) {
          load2.push(newLoads[k]);
        }
      }
    }

    // 荷重距離ゼロの行を削除する -------------------------------------
    for (let i = load2.length - 1; i >= 0; i--) {
      const item = load2[i];
      const LL: number = Math.round(this.member.getMemberLength(item["m1"]) * 1000);
      const L1: number = Math.round(this.helper.toNumber(item["L1"]) * 1000);
      const L2: number = Math.round(item["L2"] * 1000);
      if(item.mark===2){
        if ( LL - (L1 + L2 ) <= 0) {
          load2.splice(i, 1);
        }
      }
    }


    return load2;
  }

  // 要素番号 m2 にマイナスが付いた場合の入力を分ける
  private getMemberGroupLoad(
    targetLoad: any,
    curNo: number,
    curPos: number
  ): any {
    const result = {};

    // もともとの入力データを保存  . . . . . . . . . . . . . . . . . .
    const org_m1: number = Math.abs(targetLoad.m1);
    const org_m2: number = Math.abs(targetLoad.m2);

    // L1の位置を確定する . . . . . . . . . . . . . . . . . . . . . .
    let m1: number = Math.abs(targetLoad.m1);
    let m2: number = Math.abs(targetLoad.m2);
    let L1: number = Math.abs(this.helper.toNumber(targetLoad.L1));

    let P2: number;
    let Po: number;
    let L: number;
    let ll: number;
    let lo: number;

    const sL1: string = targetLoad.L1.toString();
    if (sL1.includes("-")) {
      // 距離L1が加算モードで入力されている場合
      if (m1 <= curNo && curNo <= m2) {
        m1 = curNo;
        L1 = curPos + L1;
        targetLoad.m1 = m1;
        targetLoad.L1 = L1.toString();
      }
    }

    for (let j = m1; j <= m2; j++) {
      const Lj: number = this.member.getMemberLength(j.toString());
      if (L1 > Lj) {
        L1 = L1 - Lj;
        targetLoad.m1 = j + 1;
        targetLoad.L1 = L1.toString();
      } else {
        targetLoad.m1 = j;
        break;
      }
    }
    curNo = targetLoad.m1;
    curPos = this.helper.toNumber(targetLoad.L1);

    // L2の位置を確定する . . . . . . . . . . . . . . . . . . . . . .
    m1 = Math.abs(targetLoad.m1);
    m2 = Math.abs(targetLoad.m2);
    let L2: number = Math.abs(targetLoad.L2);

    switch (targetLoad.mark) {
      case 1:
      case 11:
        if (targetLoad.L2 < 0) {
          L2 = L1 + L2;
        }
        for (let j = m1; j <= m2; j++) {
          L = this.member.getMemberLength(j.toString());
          if (L2 > L) {
            L2 = L2 - L;
            targetLoad.m2 = j + 1;
            targetLoad.L2 = L2;
          } else {
            targetLoad.m2 = j;
            targetLoad.L2 = L2;
            break;
          }
        }
        curNo = Math.abs(targetLoad.m2);
        curPos = targetLoad.L2;
        break;

      default:
        if (targetLoad.L2 < 0) {
          // 連続部材の全長さLLを計算する
          ll = 0;
          for (let j = m1; j <= m2; j++) {
            ll = ll + this.member.getMemberLength(j.toString());
          }
          L2 = ll - (curPos + L2);
          if (L2 < 0) {
            L2 = 0;
          }
          targetLoad.m2 = m2;
          targetLoad.L2 = L2;
        }
        for (let j = m2; j >= org_m1; j--) {
          L = this.member.getMemberLength(j.toString());
          if (L2 > L) {
            L2 = L2 - L;
            targetLoad.m2 = j - 1;
            targetLoad.L2 = L2;
          } else {
            break;
          }
        }
        curNo = Math.abs(targetLoad.m2);
        curPos = L - targetLoad.L2;
        break;
    }

    // ちょうど j端 になったら次の部材の 距離0(ゼロ) とする
    if (Math.round(curPos*1000) >= Math.round(L*1000)) {
      if (org_m2 > curNo) {
        curNo = curNo + 1;
        curPos = 0;
      }
    }

    // 部材を連続して入力データを作成する  . . . . . . . . . . . . . . . . . . . . . . . . . . .
    const loads = new Array();
    m1 = Math.abs(targetLoad.m1);
    m2 = Math.abs(targetLoad.m2);

    // 連続部材の全長さLLを計算する
    ll = 0;
    for (let j = m1; j <= m2; j++) {
      ll = ll + this.member.getMemberLength(j.toString());
    }
    L1 = this.helper.toNumber(targetLoad.L1);
    L2 = targetLoad.L2;

    switch (targetLoad.mark) {
      case 1:
      case 11:
        if (m1 === m2) {
          const newLoads = {};
          newLoads["direction"] = targetLoad.direction;
          newLoads["mark"] = targetLoad.mark;
          newLoads["m1"] = m1;
          newLoads["m2"] = m2;
          newLoads["L1"] = targetLoad.L1;
          newLoads["L2"] = targetLoad.L2;
          newLoads["P1"] = targetLoad.P1;
          newLoads["P2"] = targetLoad.P2;
          loads.push(newLoads);
        } else {
          const newLoads1 = {};
          newLoads1["direction"] = targetLoad.direction;
          newLoads1["mark"] = targetLoad.mark;
          newLoads1["m1"] = m1;
          newLoads1["m2"] = m1;
          newLoads1["L1"] = targetLoad.L1;
          newLoads1["L2"] = 0;
          newLoads1["P1"] = targetLoad.P1;
          newLoads1["P2"] = 0;
          loads.push(newLoads1);

          const newLoads2 = {};
          newLoads2["direction"] = targetLoad.direction;
          newLoads2["mark"] = targetLoad.mark;
          newLoads2["m1"] = m2;
          newLoads2["m2"] = m2;
          newLoads2["L1"] = targetLoad.L2;
          newLoads2["L2"] = 0;
          newLoads2["P1"] = targetLoad.P2;
          newLoads2["P2"] = 0;
          loads.push(newLoads2);
        }
        break;
      case 9:
        for (let j = m1; j <= m2; j++) {
          const newLoads = {};
          newLoads["direction"] = targetLoad.direction;
          newLoads["mark"] = targetLoad.mark;
          newLoads["m1"] = j.toString();
          newLoads["m2"] = j.toString();
          newLoads["L1"] = "0";
          newLoads["L2"] = 0;
          newLoads["P1"] = targetLoad.P1;
          newLoads["P2"] = targetLoad.P1;
          loads.push(newLoads);
        }
        break;

      default:
        // 中間値を計算
        lo = ll - L1 - L2; // 荷重載荷長
        Po = (targetLoad.P2 - targetLoad.P1) / lo;
        P2 = targetLoad.P1;

        for (let j = m1; j <= m2; j++) {
          const newLoads = {};
          newLoads["direction"] = targetLoad.direction;
          newLoads["mark"] = targetLoad.mark;

          newLoads["m1"] = j.toString();
          newLoads["m2"] = j.toString();
          L = this.member.getMemberLength(newLoads["m1"]); // 要素長
          switch (j) {
            case m1:
              L = L - L1;
              break;
            case m2:
              L = L - L2;
              break;
          }
          newLoads["L1"] = "0";
          newLoads["L2"] = 0;
          newLoads["P1"] = P2;
          P2 = P2 + Po * L;
          newLoads["P2"] = P2;

          if (j === m1) {
            newLoads["L1"] = targetLoad.L1;
            newLoads["P1"] = targetLoad.P1;
          }
          if (j === m2) {
            newLoads["L2"] = targetLoad.L2;
            newLoads["P2"] = targetLoad.P2;
          }
          loads.push(newLoads);
        }
    }

    // 行rowの入力情報があれば追加する  . . . . . . . . . . . . . . . . . . . .
    if ("row" in targetLoad) {
      for (let i = 0; i < loads.length; i++) {
        loads[i]["row"] = targetLoad["row"];
      }
    }

    // 戻り値を作成する  . . . . . . . . . . . . . . . . . . . . . . . . . . .
    result["loads"] = loads;
    result["curNo"] = curNo;
    result["curPos"] = curPos;
    
    return result;
  }

  // 要素番号 m1 != m2 の場合の入力を分ける
  private getMemberRepeatLoad(targetLoad: any): any {
    const result = new Array();

    const m1: number = Math.abs(targetLoad.m1);
    const m2: number = Math.abs(targetLoad.m2);

    for (let i = m1; i <= m2; i++) {
      const newLoads = {};
      newLoads["direction"] = targetLoad.direction;
      newLoads["m1"] = i;
      newLoads["m2"] = i;
      newLoads["L1"] = targetLoad.L1;
      newLoads["L2"] = targetLoad.L2;
      newLoads["mark"] = targetLoad.mark;
      newLoads["P1"] = targetLoad.P1;
      newLoads["P2"] = targetLoad.P2;
      newLoads["row"] = targetLoad.row;
      result.push(newLoads);
    }
    return result;
  }

  // 距離 L2 にマイナスが付いた場合の入力を分ける
  private setMemberLoadAddition(
    targetLoad: any,
    curNo: number,
    curPos: number
  ): any {
    let L: number;
    let ll: number;

    let m1: number = Math.abs(targetLoad.m1);
    const m2: number = Math.abs(targetLoad.m2);
    let L1: number = Math.abs(targetLoad.L1);
    let L2: number = Math.abs(targetLoad.L2);

    const sL1: string = targetLoad.L1.toString();
    if (sL1.includes("-")) {
      // 距離L1が加算モードで入力されている場合
      if (m1 <= curNo && curNo <= m2) {
        m1 = curNo;
        L1 = curPos + L1;
        targetLoad.m1 = m1;
        targetLoad.L1 = L1.toString();
      }
      curNo = targetLoad.m1;
      curPos = this.helper.toNumber(targetLoad.L1);
    }

    if (targetLoad.L2 < 0) {
      // 連続部材の全長さLLを計算する
      ll = 0;
      for (let j = m1; j <= m2; j++) {
        ll = ll + this.member.getMemberLength(j.toString());
      }
      L2 = ll - (curPos + L2);
      if (targetLoad.L2 < 0) {
        L2 = 0;
      }
      targetLoad.m2 = Math.sign(targetLoad.m2) * m2;
      targetLoad.L2 = L2;
      L = this.member.getMemberLength(m2.toString());
      curNo = Math.abs(targetLoad.m2);
      curPos = L - targetLoad.L2;
    }

    if (curPos >= L - 0.0001) {
      if (m2 > curNo) {
        curNo = curNo + 1;
        curPos = 0;
      }
    }
    const result = { loads: targetLoad, curNo: curNo, curPos: curPos };
    return result;
  }

  // 有効な 荷重ケース数を調べる
  public getLoadCaseCount(): number {
    const list = new Array();
    list.push(this.getLoadJson());
    list.push(this.getNodeLoadJson());
    list.push(this.getMemberLoadJson());
    let maxCase = 0;
    for (let i = 0; i < list.length; i++) {
      const dict = list[i];
      for (const load_id of Object.keys(dict)) {
        const load_no: number = this.helper.toNumber(load_id);
        if (maxCase < load_no) {
          maxCase = load_no;
        }
      }
    }
    return maxCase;
  }
}
