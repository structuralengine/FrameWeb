/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  // 文字列string を数値にする
  const toNumber = (num: string) => {
    let result: number = null;
    try {
      const tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch {
      result = null;
    }
    return result;
  };

  const defList = data.defList;
  const combList = data.combList;
  const fsec = data.fsec;
  const fsecKeys = data.fsecKeys;

  // 全ケースに共通する着目点のみ対象とするために削除する id を記憶
  const delList = [];

  // defineのループ
  const fsecDefine = {};
  for (const defNo of Object.keys(defList)) {
    const temp = {};
    //
    for (const caseInfo of defList[defNo]) {
      const baseNo: string = Math.abs(caseInfo).toString();
      const coef: number = Math.sign(caseInfo);

      if (!(baseNo in fsec)) {
        continue;
      }

      // カレントケースを集計する
      for (const key of fsecKeys) {
        // 節点番号のループ
        const obj = {};
        let m: string;
        for (const d of fsec[baseNo]) {
          if(d.m.length> 0){
            m = d.m;
          }
          let id = m + '-' + d.l.toFixed(3);
          obj[id] = {
            m: d.m,
            l: d.l,
            n: d.n,
            fx: coef * d.fx,
            fy: coef * d.fy,
            fz: coef * d.fz,
            mx: coef * d.mx,
            my: coef * d.my,
            mz: coef * d.mz,
            case: caseInfo,
          };
        }

        if (key in temp) {
          // 大小を比較する
          const kk = key.split('_');
          const k1 = kk[0]; // dx, dy, dz, rx, ry, rz
          const k2 = kk[1]; // max, min

          for (const id of Object.keys(temp[key])) {
            if (!(id in obj)) {
              delList.push(id);
              continue;
            }
            if (k2 === 'max') {
              if (temp[key][id][k1] < obj[id][k1]) {
                temp[key][id] = obj[id];
              }
            } else if (k2 === 'min') {
              if (temp[key][id][k1] > obj[id][k1]) {
                temp[key][id] = obj[id];
              }
            }
          }
        } else {
          temp[key] = obj;
        }
      }
    }
    fsecDefine[defNo] = temp;
  }

  // 全ケースに共通する着目点のみ対象とするため
  // 削除する
  for (const id of Array.from(new Set(delList))) {
    for (const defNo of Object.keys(fsecDefine)) {
      for (const temp of fsecDefine[defNo]) {
        for (const key of Object.keys(temp)) {
          const obj = temp[key];
          delete obj[id];
        }
      }
    }
  }

  // combineのループ
  const max_values = {};
  const fsecCombine = {};
  for (const combNo of Object.keys(combList)) {
    const max_value = {
      fx: 0, fy: 0, fz: 0,
      mx: 0, my: 0, mz: 0
    }
    const temp = {};
    //
    for (const caseInfo of combList[combNo]) {
      const caseNo = Number(caseInfo.caseNo);
      const defNo: string = caseInfo.caseNo.toString();
      const coef: number = caseInfo.coef;

      if (!(defNo in fsecDefine)) {
        continue;
      }
      if (coef === 0) {
        continue;
      }

      const fsecs = fsecDefine[defNo];
      // カレントケースを集計する
      const c2 = Math.abs(caseNo).toString().trim();
      for (const key of fsecKeys) {
        // 節点番号のループ
        const obj1 = [];
        for (const id of Object.keys(fsecs[key])) {
          const d = fsecs[key][id];
          const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
          const caseStr = (c1 < 0 ? "-" : "+") + c2;
          obj1.push({
            m: d.m,
            l: d.l,
            n: d.n,
            fx: coef * d.fx,
            fy: coef * d.fy,
            fz: coef * d.fz,
            mx: coef * d.mx,
            my: coef * d.my,
            mz: coef * d.mz,
            case: caseStr,
          });
        }
        if (key in temp) {
          for (let row = 0; row < obj1.length; row++) {
            for (const k of Object.keys(obj1[row])) {
              const value = obj1[row][k];
              if (k === 'm' || k === 'l') {
                temp[key][row][k] = value;
              } else if (k === 'n') {
                temp[key][row][k] = (toNumber(value) !== null) ? value : '';
              } else {
                temp[key][row][k] += value;
              }
            }
          }
        } else {
          temp[key] = obj1;
        }

        // 最大値を 集計する
        for (const value of temp[key]) {
          max_value.fx = Math.max(Math.abs(value.fx), max_value.fx);
          max_value.fy = Math.max(Math.abs(value.fy), max_value.fy);
          max_value.fz = Math.max(Math.abs(value.fz), max_value.fz);
          max_value.mx = Math.max(Math.abs(value.mx), max_value.mx);
          max_value.my = Math.max(Math.abs(value.my), max_value.my);
          max_value.mz = Math.max(Math.abs(value.mz), max_value.mz);
        }        
      }
    }
    fsecCombine[combNo] = temp;
    max_values[combNo] = max_value;
  }

  postMessage({ fsecCombine, max_values });

});
