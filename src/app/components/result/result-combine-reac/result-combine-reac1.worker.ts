/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const defList = data.defList;
  const combList = data.combList;
  const reac = data.reac;
  const reacKeys = data.reacKeys;
  
  // defineのループ
  const reacDefine = {};
  for(const defNo of Object.keys(defList)) {
    const temp = {};
    //
    for(const caseInfo of defList[defNo]) {
      const baseNo: string = Math.abs(caseInfo).toString();
      const coef: number = Math.sign(caseInfo);

      if (!(baseNo in reac)) {
        if(caseInfo === 0 ){
          // 値が全て0 の case 0 という架空のケースを用意する
          // 値は coef=0 であるため 0 となる
          reac['0'] = Object.values(reac)[0];
        } else {
          continue;
        }
      }

      // カレントケースを集計する
      for (const key of reacKeys) {
        // 節点番号のループ
        const obj = {};
        for (const d of reac[baseNo]) {
          obj[d.id] = {
            tx: coef * d.tx,
            ty: coef * d.ty,
            tz: coef * d.tz,
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
          for (const nodeNo of Object.keys(temp[key])) {
            if(k2==='max'){
              if(temp[key][nodeNo][k1] < obj[nodeNo][k1]){
                temp[key][nodeNo] = obj[nodeNo];
              }
            } else if (k2==='min'){
              if(temp[key][nodeNo][k1] > obj[nodeNo][k1]){
                temp[key][nodeNo] = obj[nodeNo];
              }
            }
          }

        } else {
          temp[key] = obj;
        }
      }
    }
    reacDefine[defNo] = temp;
  }


  // combineのループ
  const reacCombine = {};
  for (const combNo of Object.keys(combList)) {
    const temp = {};
    //
    for (const caseInfo of combList[combNo]) {
      const caseNo = Number(caseInfo.caseNo);
      const defNo: string = caseInfo.caseNo.toString();
      const coef: number = caseInfo.coef;

      if (!(defNo in reacDefine)) {
        continue;
      }
      if (coef === 0) {
        continue;
      }

      const reacs = reacDefine[defNo];
      // カレントケースを集計する
      const c2 = Math.abs(caseNo).toString().trim();
      for (const key of reacKeys){
        // 節点番号のループ
        const obj = {};
        for (const nodeNo of Object.keys(reacs[key])) {
          const d = reacs[key][nodeNo];
          const c1 = Math.sign(coef) < 0 ? -1 : 1 * d.case;
          let caseStr = '';
          if (c1 !== 0){
            caseStr = (c1 < 0 ? "-" : "+") + c2;
          }
          obj[nodeNo] = {
            tx: coef * d.tx,
            ty: coef * d.ty,
            tz: coef * d.tz,
            mx: coef * d.mx,
            my: coef * d.my,
            mz: coef * d.mz,
            case: caseStr,
          };
        }

        if (key in temp) {
          for (const nodeNo of Object.keys(reacs[key])) {
              for(const k of Object.keys(obj[nodeNo])){
                temp[key][nodeNo][k] += obj[nodeNo][k];
              }
          }
        } else {
          temp[key] = obj;
        }
      }
    }
    reacCombine[combNo] = temp;
  }

  postMessage({ reacCombine });
});

