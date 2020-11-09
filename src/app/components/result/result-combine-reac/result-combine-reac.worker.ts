/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const combList = data.combList;
  const reac = data.reac;
  const reacCombine = {};

  // combineのループ
  for (const combNo of Object.keys(combList)) {
    const resultReac = {
      tx_max: {}, tx_min: {}, ty_max: {}, ty_min: {}, tz_max: {}, tz_min: {},
      mx_max: {}, mx_min: {}, my_max: {}, my_min: {}, mz_max: {}, mz_min: {}
    };

    // defineのループ
    const combines: any[] = combList[combNo];
    for (const com of combines) {
      const combineReac = { tx: {}, ty: {}, tz: {}, mx: {}, my: {}, mz: {} };

      // 基本ケースのループ
      let caseStr = '';
      for (const caseInfo  of com) {
        if (caseInfo.coef >= 0) {
          caseStr += '+' + caseInfo.caseNo.toString();
        } else {
          caseStr += '-' + caseInfo.caseNo.toString();
        }

        if (!(caseInfo.caseNo in reac)) {
          for (const key1 of Object.keys(combineReac)) {
            for (const key2 of Object.keys(combineReac[key1])) {
              combineReac[key1][key2].case = caseStr;
            }
          }
          continue;
        }
        // 節点番号のループ
        const Reacs: any[] = reac[caseInfo.caseNo];
        for (const result of Reacs) {
          const id = result['id'];

          // dx, dy … のループ
          for (const key1 of Object.keys(combineReac)) {
            const value = combineReac[key1];
            const temp: {} = (id in value) ? value[id] : { id: id, tx: 0, ty: 0, tz: 0, mx: 0, my: 0, mz: 0, case: '' };

            // x, y, z, 変位, 回転角 のループ
            for (const key2 in result) {
              if (key2 === 'id') {
                continue;
              }
              temp[key2] += caseInfo.coef * result[key2];
            }
            temp['case'] = caseStr;
            value[id] = temp;
            combineReac[key1] = value;
          }
        }
      }

      // dx, dy … のループ
      const k: string[] = ['_max', '_min'];
      for (const key1 of Object.keys(combineReac)) {
        for (let n = 0; n < k.length; n++) {
          let key2: string;
          key2 = key1 + k[n];
          const old = resultReac[key2];
          const current = combineReac[key1];
          // 節点番号のループ
          for (const id of Object.keys(current)) {
            if (!(id in old)) {
              old[id] = current[id];
              resultReac[key2] = old;
              continue;
            }
            const target = current[id];
            const comparison = old[id]
            if ((n === 0 && comparison[key1] < target[key1])
              || (n > 0 && comparison[key1] > target[key1])) {
              old[id] = target;
              resultReac[key2] = old;
            }
          }
        }
      }
    }
    reacCombine[combNo] = resultReac;
  }

  postMessage({reacCombine});
 
});
