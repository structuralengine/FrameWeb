/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const defList = data.defList;
  const combList = data.combList;
  const noticePoints = data.noticePoints;
  const fsec = data.fsec;
  const fsecKeys = [
    "fx_max",
    "fx_min",
    "fy_max",
    "fy_min",
    "fz_max",
    "fz_min",
    "mx_max",
    "mx_min",
    "my_max",
    "my_min",
    "mz_max",
    "mz_min",
  ];

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

  
  // defineのループ
  const fsecDefine = {};
  for(const defNo of Object.keys(defList)) {
    const temp = {};
    //
    for(const caseInfo of defList[defNo]) {
      const baseNo: string = Math.abs(caseInfo).toString();
      const coef: number = Math.sign(caseInfo);

      if (!(baseNo in fsec)) {
        continue;
      }

      // カレントケースを集計する
      for (const key of fsecKeys) {
        // 節点番号のループ
        let row = 0;
        const obj = {};
        for (const d of fsec[baseNo]) {
          obj[row] = {
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
          row++;
        }
        if (key in temp) {

          // 大小を比較する
          const kk = key.split('_');
          const k1 = kk[0]; // dx, dy, dz, rx, ry, rz
          const k2 = kk[1]; // max, min

          for (const row of Object.keys(temp[key])) {

            if(k2==='max'){
              if(temp[key][row][k1] < obj[row][k1]){
                temp[key][row] = obj[row];
              }
            } else if (k2==='min'){
              if(temp[key][row][k1] > obj[row][k1]){
                temp[key][row] = obj[row];
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


  // combineのループ
  const fsecCombine = {};
  for (const combNo of Object.keys(combList)) {
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
      for (const key of fsecKeys){
        // 節点番号のループ
        const obj = {};
        for (const row of Object.keys(fsecs[key])) {
          const d = fsecs[key][row];
          const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
          const caseStr = (c1 < 0 ? "-" : "+") + c2;
          obj[row] = {
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
          };
        }

        if (key in temp) {
          for (const row of Object.keys(fsecs[key])) {
              for(const k of Object.keys(obj[row])){
                if (k === 'row') {
                  continue;
                 } else {
                  const value = obj[row][k];
                  if (k === 'm' || k === 'l') {
                    temp[key][row][k] = value;
                  } else if (k === 'n') {
                    temp[key][row][k] =  (toNumber(value) !== null) ? value: '';
                  } else {
                    temp[key][row][k] += value;
                  }
                }
              }
          }
        } else {
          temp[key] = obj;
        }
      }
    }
    fsecCombine[combNo] = temp;
  }

  postMessage({ fsecCombine });


});
