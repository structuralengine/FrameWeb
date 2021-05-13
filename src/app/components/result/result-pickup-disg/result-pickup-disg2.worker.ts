/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const disgPickup = data.disgPickup;

  const result = {};
  for (const combNo of Object.keys(disgPickup)) {

    // 組み合わせを探す
    let target1: any[] = disgPickup[combNo];

    const result2 = {};
    for (const mode of Object.keys(target1)) {

      // 着目項目を探す
      const target2 = (mode in target1) ? target1[mode] : [];
      const result3: any[] = new Array();

      for (const id of Object.keys(target2)) {
        const item = target2[id];
        const dx = item.dx === null ? 0 : Math.round(10000 * item.dx) / 10000;
        const dy = item.dy === null ? 0 : Math.round(10000 * item.dy) / 10000;
        const dz = item.dz === null ? 0 : Math.round(10000 * item.dz) / 10000;
        const rx = item.rx === null ? 0 : Math.round(10000 * item.rx) / 10000;
        const ry = item.ry === null ? 0 : Math.round(10000 * item.ry) / 10000;
        const rz = item.rz === null ? 0 : Math.round(10000 * item.rz) / 10000;
        result3.push({
          id: id,
          dx: dx.toFixed(4),
          dy: dy.toFixed(4),
          dz: dz.toFixed(4),
          rx: rx.toFixed(4),
          ry: ry.toFixed(4),
          rz: rz.toFixed(4),
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
