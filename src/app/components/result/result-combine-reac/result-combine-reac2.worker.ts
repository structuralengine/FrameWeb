/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const reacCombine = data.reacCombine;

  const result = {};
  for (const combNo of Object.keys(reacCombine)) {

    // 組み合わせを探す
    let target1: any[] = reacCombine[combNo];

    const result2 = {};
    for (const mode of Object.keys(target1)) {

      // 着目項目を探す
      const target2 = (mode in target1) ? target1[mode] : [];
      const result3: any[] = new Array();

    for (const id of Object.keys(target2)) {
      const item = target2[id];
        const tx = item.tx === null ? 0 : Math.round(100 * item.tx) / 100;
        const ty = item.ty === null ? 0 : Math.round(100 * item.ty) / 100;
        const tz = item.tz === null ? 0 : Math.round(100 * item.tz) / 100;
        const mx = item.mx === null ? 0 : Math.round(100 * item.mx) / 100;
        const my = item.my === null ? 0 : Math.round(100 * item.my) / 100;
        const mz = item.mz === null ? 0 : Math.round(100 * item.mz) / 100;
        result3.push({
          id: id,
          tx: tx.toFixed(2),
          ty: ty.toFixed(2),
          tz: tz.toFixed(2),
          mx: mx.toFixed(2),
          my: my.toFixed(2),
          mz: mz.toFixed(2),
          case: item.case,
          comb: item.comb
        });
      }
      result2[mode] = result3;
    }
    result[combNo] = result2;
  }

  postMessage({ result });




});
