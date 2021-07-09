/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const fsecCombine = data.fsecCombine;

  const result = {};
  for(const combNo of Object.keys(fsecCombine)){
  
    // 組み合わせを探す
    let target1: any[]  = fsecCombine[combNo];

    const result2 = {};
    for(const mode of Object.keys(target1)){

      // 着目項目を探す
      const target2 = (mode in target1) ? target1[mode] : [];
      const result3: any[] = new Array();

      let m: string = null;
      const old = {};
      for (const target3 of target2) {
        const item = {
          m: (m === target3['m']) ? '' : target3['m'],
          n: ('n' in target3) ? target3['n'] : '',
          l: target3['l'].toFixed(3),
          fx: target3['fx'].toFixed(2),
          fy: target3['fy'].toFixed(2),
          fz: target3['fz'].toFixed(2),
          mx: target3['mx'].toFixed(2),
          my: target3['my'].toFixed(2),
          mz: target3['mz'].toFixed(2),
          case: target3['case']
        };
        // 同一要素内の着目点で、直前の断面力と同じ断面力だったら 読み飛ばす
        // if (old['m'] !== item['m'] || old['n'] !== item['n'] 
        //     || old['fx'] !== item['fx'] || old['fy'] !== item['fy'] || old['fz'] !== item['fz']
        //     || old['mx'] !== item['mx'] || old['my'] !== item['my'] || old['mz'] !== item['mz']) {
          result3.push(item);
          m = target3['m'];
          Object.assign(old, item);
        // }
      }
      result2[mode] = result3;
    }
    result[combNo] = result2;
  }

  postMessage({ result });

});
