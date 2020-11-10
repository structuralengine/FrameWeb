/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const combList = data.combList;
  const disg = data.disg;
  const  disgCombine = {};

  // combineのループ
  for (const combNo of Object.keys(combList)) {
    const resultDisg = {
      dx_max: {}, dx_min: {}, dy_max: {}, dy_min: {}, dz_max: {}, dz_min: {},
      rx_max: {}, rx_min: {}, ry_max: {}, ry_min: {}, rz_max: {}, rz_min: {}
    };

    // defineのループ
    const combines: any[] = combList[combNo];
    for (const com of combines) {
      const combineDisg = { dx: {}, dy: {}, dz: {}, rx: {}, ry: {}, rz: {} };

      // 基本ケースのループ
      let caseStr = '';
      for (const caseInfo of com) {
        if (caseInfo.coef >= 0) {
          caseStr += '+' + caseInfo.caseNo.toString();
        } else {
          caseStr += '-' + caseInfo.caseNo.toString();
        }
        if (!(caseInfo.caseNo in disg)) {
          for (const key1 of Object.keys(combineDisg)) {
            for (const key2 of Object.keys(combineDisg[key1])) {
              combineDisg[key1][key2].case = caseStr;
            }
          }
          continue;
        }
        // 節点番号のループ
        const disgs: any[] = disg[caseInfo.caseNo];
        for (const result of disgs) {
          const id = result['id'];

          // dx, dy … のループ
          for (const key1 of Object.keys(combineDisg)) {
            const value = combineDisg[key1];
            const temp: {} = (id in value) ? value[id] : { id, dx: 0, dy: 0, dz: 0, rx: 0, ry: 0, rz: 0, case: '' };

            // x, y, z, 変位, 回転角 のループ
            for (const key2 in result) {
              if (key2 === 'id') {
                continue;
              }
              temp[key2] += caseInfo.coef * result[key2];
            }
            temp['case'] = caseStr;
            value[id] = temp;
            combineDisg[key1] = value;
          }
        }
      }

      // dx, dy … のループ
      const k: string[] = ['_max', '_min'];
      for (const key1 of Object.keys(combineDisg)) {
        for (let n = 0; n < k.length; n++) {
          let key2: string;
          key2 = key1 + k[n];
          const old = resultDisg[key2];
          const current = combineDisg[key1];
          // 節点番号のループ
          for (const id of Object.keys(current)) {
            if (!(id in old)) {
              old[id] = current[id];
              resultDisg[key2] = old;
              continue;
            }
            const target = current[id];
            const comparison = old[id]
            if ((n === 0 && comparison[key1] < target[key1])
              || (n > 0 && comparison[key1] > target[key1])) {
              old[id] = target;
              resultDisg[key2] = old;
            }
          }
        }
      }
    }
    disgCombine[combNo] = resultDisg;
  }

  postMessage({disgCombine});

});
