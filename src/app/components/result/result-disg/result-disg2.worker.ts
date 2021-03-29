/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const disg = data.disg;
  const table = {};
  let error: any = null;

  // html table 用の変数を用意する
  try {

    for (const typNo of Object.keys(disg)){
      if(typNo === 'max_value'){
        continue;
      }
      // タイプ番号を探す
      const target = disg[typNo];

      // 行を探す
      const result: any[] = new Array();
      for(const item of target){
        const dx = item.dx === null ? 0 : Math.round(10000 * item.dx) / 10000;
        const dy = item.dy === null ? 0 : Math.round(10000 * item.dy) / 10000;
        const dz = item.dz === null ? 0 : Math.round(10000 * item.dz) / 10000;
        const rx = item.rx === null ? 0 : Math.round(10000 * item.rx) / 10000;
        const ry = item.ry === null ? 0 : Math.round(10000 * item.ry) / 10000;
        const rz = item.rz === null ? 0 : Math.round(10000 * item.rz) / 10000;
        result.push( {
          id: item.id,
          dx: dx.toFixed(4),
          dy: dy.toFixed(4),
          dz: dz.toFixed(4),
          rx: rx.toFixed(4),
          ry: ry.toFixed(4),
          rz: rz.toFixed(4),
        });
      }
      table[typNo] = result;
    }
  } catch(e){
    error = e;
  }

  postMessage({ table, error });
});
