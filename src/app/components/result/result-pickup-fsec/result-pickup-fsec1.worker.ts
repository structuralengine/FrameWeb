/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const pickList = data.pickList;
  const fsecCombine = data.fsecCombine;
  const fsecPickup = {};
  const max_values = {};

  // pickupのループ
  for (const pickNo of Object.keys(pickList)) {
    const max_value = {
      fx: 0, fy: 0, fz: 0,
      mx: 0, my: 0, mz: 0
    }

    const combines: any[] = pickList[pickNo];
    let tmp: {} = null;
    for (const combNo of combines) {
      const com = fsecCombine[combNo];
      if (tmp == null) {
        tmp = com;

        continue;
      }
      for (const k of Object.keys(com)) {
        const key = k.split('_');
        const target = com[k];
        const comparison = tmp[k];
        for (const id of Object.keys(comparison)) {
          const a = comparison[id];
          if (!(id in target)) {
            continue;
          }
          const b = target[id];
          if (key[1] === 'max') {
            if (b[key[0]] > a[key[0]]) {
              tmp[k][id] = com[k][id];
            }
          } else {
            if (b[key[0]] < a[key[0]]) {
              tmp[k][id] = com[k][id];
            }
          }
        }

        // 最大値を 集計する
        for (const value of tmp[k]) {
          max_value.fx = Math.max(Math.abs(value.fx), max_value.fx);
          max_value.fy = Math.max(Math.abs(value.fy), max_value.fy);
          max_value.fz = Math.max(Math.abs(value.fz), max_value.fz);
          max_value.mx = Math.max(Math.abs(value.mx), max_value.mx);
          max_value.my = Math.max(Math.abs(value.my), max_value.my);
          max_value.mz = Math.max(Math.abs(value.mz), max_value.mz);
        }  
      }
    }
    fsecPickup[pickNo] = tmp;
    max_values[pickNo] = max_value;
  }
  postMessage({ fsecPickup, max_values });
});
