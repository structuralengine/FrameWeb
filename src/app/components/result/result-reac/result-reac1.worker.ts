/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  // 文字列string を数値にする
  const toNumber = (num: string) => {
    let result: number = null;
    try {
      const tmp: string = num.toString().trim();
      if (tmp.length > 0) {
        result = ((n: number) => isNaN(n) ? null : n)(+tmp);
      }
    } catch {
      result = null;
    }
    return result;
  };


  const jsonData = data.jsonData;
  const reac = {};
  let error: any = null;

  try {
    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];

      // 存在チェック
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('reac' in caseData)) {
        continue;
      }
      const json: {} = caseData['reac'];
      if (json === null) {
        continue;
      }

      for (const n of Object.keys(json)) {
        const item: {} = json[n];

        let tx: number = toNumber(item['tx']);
        let ty: number = toNumber(item['ty']);
        let tz: number = toNumber(item['tz']);
        let mx: number = toNumber(item['mx']);
        let my: number = toNumber(item['my']);
        let mz: number = toNumber(item['mz']);

        const result = {
          id: n.replace('node', ''),
          tx: (tx == null) ? 0 : tx,
          ty: (ty == null) ? 0 : ty,
          tz: (tz == null) ? 0 : tz,
          mx: (mx == null) ? 0 : mx,
          my: (my == null) ? 0 : my,
          mz: (mz == null) ? 0 : mz
        };
        target.push(result);
      }
      reac[caseNo.replace('Case', '')] = target;
    }
  } catch (e) {
    error = e;
  }

  postMessage({ reac, error  });
});
