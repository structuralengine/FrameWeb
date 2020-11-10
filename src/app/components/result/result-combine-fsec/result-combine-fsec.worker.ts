/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const combList = data.combList;
  const noticePoints = data.noticePoints;
  const fsec = data.fsec;
  const fsecCombine = {};

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



  // combineのループ
  for (const combNo of Object.keys(combList)) {
    const resultFsec = {
      fx_max: {}, fx_min: {}, fy_max: {}, fy_min: {}, fz_max: {}, fz_min: {},
      mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
    };

    // defineのループ
    const combines: any[] = combList[combNo];
    for (const com of combines) {
      const combineFsec = { fx: {}, fy: {}, fz: {}, mx: {}, my: {}, mz: {} };

      let row: number = 0;
      for (const m of Object.keys(noticePoints)) {
        for (const point of noticePoints[m]) {

          let caseStr: string = '';
          for (const caseInfo of com) {
            if (caseInfo.coef >= 0) {
              caseStr += '+' + caseInfo.caseNo.toString();
            } else {
              caseStr += '-' + caseInfo.caseNo.toString();
            }
            if (!(caseInfo.caseNo in fsec)) {
              for (const key1 of Object.keys(combineFsec)) {
                for (const key2 of Object.keys(combineFsec[key1])) {
                  combineFsec[key1][key2].case = caseStr;
                }
              }
              continue;
            }

            const Fsecs: any[] = fsec[caseInfo.caseNo];

            // 同じ部材の同じ着目点位置の断面力を探す
            let f: Object = undefined;
            let mm: string;
            for (const result of Fsecs) {
              mm = result.m.length > 0 ? result.m : mm;
              if (mm === m && point === result.l) {
                f = result;
                break;
              }
            }
            if (f === undefined) {
              break;
            }

            // fx, fy … のループ
            for (const key1 of Object.keys(combineFsec)) {
              const value = combineFsec[key1];
              const temp: {} = (row.toString() in value) ? value[row.toString()] : { row, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0, case: '' };

              // x, y, z, 変位, 回転角 のループ
              for (const key2 in f) {
                if (key2 === 'row') {
                  continue;
                } else if (key2 === 'm') {
                  temp[key2] = m;
                } else if (key2 === 'l') {
                  temp[key2] = point;
                } else if (key2 === 'n') {
                  if (toNumber(f[key2]) !== null) {
                    temp[key2] = f[key2];
                  }
                } else {
                  temp[key2] += caseInfo.coef * f[key2];
                }
              }
              temp['case'] = caseStr;
              value[row.toString()] = temp;
              combineFsec[key1] = value;
              // end key1
            }
            // end caseInfo
          }
          row++;
          // end point
        }
        // end m
      }

      // dx, dy … のループ
      const k: string[] = ['_max', '_min'];
      for (const key1 of Object.keys(combineFsec)) {
        for (let n = 0; n < k.length; n++) {
          let key2: string;
          key2 = key1 + k[n];
          const old = resultFsec[key2];
          const current = combineFsec[key1];
          // 節点番号のループ
          for (const id of Object.keys(current)) {
            if (!(id in old)) {
              old[id] = current[id];
              resultFsec[key2] = old;
              continue;
            }
            const target = current[id];
            const comparison = old[id];
            if ((n === 0 && comparison[key1] < target[key1])
              || (n > 0 && comparison[key1] > target[key1])) {
              old[id] = target;
              resultFsec[key2] = old;
            }
          }
        }
      }

    }
    fsecCombine[combNo] = resultFsec;
  }

  postMessage({ fsecCombine });
});
