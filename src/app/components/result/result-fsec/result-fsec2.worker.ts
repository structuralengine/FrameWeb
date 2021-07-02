/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const fsec = data.fsec;
  const table = {};
  let error: any = null;

  // html table 用の変数を用意する
  try {

    for (const typNo of Object.keys(fsec)){
      // タイプ番号を探す
      const target2 = fsec[typNo];

      // 行を探す
      const result: any[] = new Array();
      let m: string = null;
      const old = {};
      for( let i = 0; i < target2.length; i++){
        const target3 = target2[i];
        const item = {
          m: (m === target3['m']) ? '' : target3['m'],
          n: ('n' in target3) ? target3['n'] : '',
          l: target3['l'].toFixed(3),
          fx: (Math.round(target3.fx * 100) / 100).toFixed(2),
          fy: (Math.round(target3.fy * 100) / 100).toFixed(2),
          fz: (Math.round(target3.fz * 100) / 100).toFixed(2),
          mx: (Math.round(target3.mx * 100) / 100).toFixed(2),
          my: (Math.round(target3.my * 100) / 100).toFixed(2),
          mz: (Math.round(target3.mz * 100) / 100).toFixed(2)
        };
        // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
        // if (old['m'] !== item['m'] || old['n'] !== item['n'] 
        //     || old['fx'] !== item['fx'] || old['fy'] !== item['fy'] || old['fz'] !== item['fz']
        //     || old['mx'] !== item['mx'] || old['my'] !== item['my'] || old['mz'] !== item['mz']) {
          result.push(item);
          m = target3['m'];
          Object.assign(old, item);
        // }
      }
      table[typNo] = result;
    }
  } catch(e){
    error = e;
  }

  postMessage({ table, error });
});
