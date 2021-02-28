/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const defList = data.defList;
  const combList = data.combList;
  const disg = data.disg;

  // defineのループ
  const disgDefine = {};
  for (const defNo of Object.keys(defList)) {
    const temp = {}

    //
    for (const caseInfo of defList[defNo]){
     
      const baseNo: string = Math.abs(caseInfo).toString();
      const coef: number = Math.sign(caseInfo);

      if(!(baseNo in disg)) {
        continue;
      }

      // 節点番号のループ
      for (const d of disg[baseNo] ){
        const nodeNo: string = d.id;
        const obj = {
          dx: coef * d.dx,
          dy: coef * d.dy,
          dz: coef * d.dz,
          rx: coef * d.rx,
          ry: coef * d.ry,
          rz: coef * d.rz,
          case: caseInfo
        };
        if(nodeNo in temp){
          const a = temp[nodeNo];
          for(const k1 of ['d', 'r']){
            for(const k2 of ['x', 'y', 'z']){
              const kk0 = k1+k2;
              const kk1 = kk0+'_max';
              if(a[kk1][kk0] < d[kk0]) {
                a[kk1] = obj;
              }
              const kk2 = kk0+'_min';
              if(a[kk2][kk0] > d[kk0]) {
                a[kk2] = obj;
              }
            }
          }
        } else {
          temp[nodeNo] = {
            dx_max: obj, dx_min: obj, dy_max: obj, dy_min: obj, dz_max: obj, dz_min: obj,
            rx_max: obj, rx_min: obj, ry_max: obj, ry_min: obj, rz_max: obj, rz_min: obj
          };
        }
      }
    }
    disgDefine[defNo] = temp;
  }

  // combineのループ
  const disgCombine = {};
  for (const combNo of Object.keys(combList)) {
    const temp = {}

    //
    for (const caseInfo of combList[combNo]){
      const defNo: string = caseInfo.caseNo.toString();
      const coef: number = caseInfo.coef;

      if(!(defNo in disgDefine)) {
        continue;
      }

      // 節点番号のループ
      for (const a of disgDefine[defNo] ){

      }
    }
    disgCombine[combNo] = {};//resultDisg;
  }

  postMessage({disgCombine});

});
