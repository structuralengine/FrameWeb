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
  const disg = {};
  let error: any = null;

  try {

    let max_d = 0;
    let max_r = 0;

    for (const caseNo of Object.keys(jsonData)) {
      const target = new Array();
      const caseData: {} = jsonData[caseNo];

      // 存在チェック
      if (typeof caseData !== "object") {
        continue;
      }
      if (!("disg" in caseData)) {
        continue;
      }
      const json: {} = caseData["disg"];

      for (const n of Object.keys(json)) {

        const id = n.replace("node", "");
        if (id.includes('n')) {
          continue; // 着目節点は除外する
        }
        if (id.includes('l')) {
          continue; // 荷重による分割点は除外する
        }

        const item: {} = json[n];

        let dx: number = toNumber(item["dx"]);
        let dy: number = toNumber(item["dy"]);
        let dz: number = toNumber(item["dz"]);
        let rx: number = toNumber(item["rx"]);
        let ry: number = toNumber(item["ry"]);
        let rz: number = toNumber(item["rz"]);
        dx = dx == null ? 0 : dx * 1000;
        dy = dy == null ? 0 : dy * 1000;
        dz = dz == null ? 0 : dz * 1000;
        rx = rx == null ? 0 : rx * 1000;
        ry = ry == null ? 0 : ry * 1000;
        rz = rz == null ? 0 : rz * 1000;
        const result = {
          id: id,
          dx: dx,
          dy: dy,
          dz: dz,
          rx: rx,
          ry: ry,
          rz: rz,
        };
        target.push(result);

        // 最大値を記録する three.js で使う
        for (const v of [dx, dy, dz]) {
          if (Math.abs(max_d) < Math.abs(v)) {
            max_d = v;
          }
        }
        for (const v of [rx, ry, rz]) {
          if (Math.abs(max_r) < Math.abs(v)) {
            max_r = v;
          }
        }
      }
      disg[caseNo.replace("Case", "")] = target;
    }
    disg["max_value"] = Math.abs(max_d); // Math.max(Math.abs(max_d), Math.abs(max_r));

  } catch (e) {
    error = e;
  }

  postMessage({ disg, error });


});
