/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const pickList = data.pickList;
  const disgCombine = data.disgCombine;
  const disgPickup = {};

  // pickupのループ
  for (const pickNo of Object.keys(pickList)) {
    const combines: any[] = pickList[pickNo];
    let tmp: {} = null;
    for (const combNo of combines) {
      const com = disgCombine[combNo];
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
              tmp[k] = com[k];
            }
          } else {
            if (b[key[0]] < a[key[0]]) {
              tmp[k] = com[k];
            }
          }
        }
      }
    }
    if (tmp !== null) {
      disgPickup[pickNo] = tmp;
    }
  }

  postMessage({ disgPickup });
});
