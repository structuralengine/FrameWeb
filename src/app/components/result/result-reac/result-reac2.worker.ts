/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const reac = data.reac;
  const table = {};
  let error: any = null;

  // html table 用の変数を用意する
  try {

    for (const typNo of Object.keys(reac)){
      if(typNo === 'max_value'){
        continue;
      }
      // タイプ番号を探す
      const target = reac[typNo];

      // 行を探す
      const result: any[] = new Array();
      for(const item of target){
        const tx = item.tx === null ? 0 : Math.round(100 * item.tx) / 100;
        const ty = item.ty === null ? 0 : Math.round(100 * item.ty) / 100;
        const tz = item.tz === null ? 0 : Math.round(100 * item.tz) / 100;
        const mx = item.mx === null ? 0 : Math.round(100 * item.mx) / 100;
        const my = item.my === null ? 0 : Math.round(100 * item.my) / 100;
        const mz = item.mz === null ? 0 : Math.round(100 * item.mz) / 100;
        result.push( {
          id: item.id,
          tx: tx.toFixed(2),
          ty: ty.toFixed(2),
          tz: tz.toFixed(2),
          mx: mx.toFixed(2),
          my: my.toFixed(2),
          mz: mz.toFixed(2),
        });
      }
      table[typNo] = result;
    }
  } catch(e){
    error = e;
  }

  postMessage({ table, error });
});
