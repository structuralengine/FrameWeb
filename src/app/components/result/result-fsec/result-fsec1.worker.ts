/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const fsec = {};
  let error: any = null;

  const jsonData = data.jsonData;
  const member: any[] = data.member;
  const dim: number = (data.dimension===2) ? -1 : 1;

  // 同じidをもつ部材を探す
  const getMember = (memberNo: string) => {
    const m = member.find((columns) => {
      return columns.id === memberNo;
    })
    if (m === undefined) {
      return { ni: null, nj: null };
    }
    return m;
  }

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


  const max_values = {};
  // 断面力の集計
  try {
    for (const caseNo of Object.keys(jsonData)) {
      const max_value = {
        fx: 0, fy: 0, fz: 0,
        mx: 0, my: 0, mz: 0
      }
  
      const target = new Array();
      const caseData: {} = jsonData[caseNo];
      if (typeof (caseData) !== 'object') {
        continue;
      }
      if (!('fsec' in caseData)) {
        continue;
      }
      const json: {} = caseData['fsec'];
      let row = 0;
      let memberNo = '';
      for (const m of Object.keys(json)) {

        let noticePoint = 0.0;
        memberNo = m.replace('member', '');
        const js: {} = json[m];

        let result = {};
        const memb = getMember(memberNo);
        let ni: string = memb.ni;
        let nj = '';
        let counter = 1;
        const data_length: number = Object.keys(js).length;
        while (counter <= data_length) {
          const p = 'P' + counter.toString();
          if (!(p in js)) {
            break;
          }
          const item: {} = js[p];
          let fxi: number = toNumber(item['fxi']);
          let fyi: number = toNumber(item['fyi']);
          let fzi: number = toNumber(item['fzi']);
          let mxi: number = toNumber(item['mxi']);
          let myi: number = toNumber(item['myi']);
          let mzi: number = toNumber(item['mzi']);
          fxi = (fxi == null) ? 0 : Math.round(fxi * 100) / 100;
          fyi = ((fyi == null) ? 0 : Math.round(fyi * 100) / 100) * dim;
          fzi = (fzi == null) ? 0 : Math.round(fzi * 100) / 100;
          mxi = (mxi == null) ? 0 : Math.round(mxi * 100) / 100;
          myi = (myi == null) ? 0 : Math.round(myi * 100) / 100;
          mzi = ((mzi == null) ? 0 : Math.round(mzi * 100) / 100) * dim;

          result = {
            m: memberNo,
            n: ni,
            l: noticePoint,
            fx: fxi,
            fy: fyi,
            fz: fzi,
            mx: mxi,
            my: myi,
            mz: mzi
          };

          row++;
          result['row'] = row;
          target.push(result);

          memberNo = '';
          ni = '';
          if (counter === data_length) {
            nj = memb.nj;
          }

          const l = toNumber(item['L']);
          let fxj: number = toNumber(item['fxj']);
          let fyj: number = toNumber(item['fyj']);
          let fzj: number = toNumber(item['fzj']);
          let mxj: number = toNumber(item['mxj']);
          let myj: number = toNumber(item['myj']);
          let mzj: number = toNumber(item['mzj']);
          noticePoint += Math.round(l * 1000) / 1000;
          fxj = (fxj == null) ? 0 : Math.round(fxj * 100) / 100;
          fyj = ((fyj == null) ? 0 : Math.round(fyj * 100) / 100) * dim;
          fzj = (fzj == null) ? 0 : Math.round(fzj * 100) / 100;
          mxj = (mxj == null) ? 0 : Math.round(mxj * 100) / 100;
          myj = (myj == null) ? 0 : Math.round(myj * 100) / 100;
          mzj = ((mzj == null) ? 0 : Math.round(mzj * 100) / 100) * dim;

          result = {
            m: '',
            n: nj,
            l: noticePoint,
            fx: fxj,
            fy: fyj,
            fz: fzj,
            mx: mxj,
            my: myj,
            mz: mzj
          };

          row++;
          result['row'] = row;
          target.push(result);
          counter++;

          max_value.fx = Math.max(Math.abs(fxi), Math.abs(fxj), max_value.fx);
          max_value.fy = Math.max(Math.abs(fyi), Math.abs(fyj), max_value.fy);
          max_value.fz = Math.max(Math.abs(fzi), Math.abs(fzj), max_value.fz);
          max_value.mx = Math.max(Math.abs(mxi), Math.abs(mxj), max_value.mx);
          max_value.my = Math.max(Math.abs(myi), Math.abs(myj), max_value.my);
          max_value.mz = Math.max(Math.abs(mzi), Math.abs(mzj), max_value.mz);

        }
      }
      const key = caseNo.replace('Case', '');
      fsec[key] = target;
      max_values[key] = max_value;
    }

  } catch (e) {
    error = e;
  }

  postMessage({ fsec, max_values, error });
});
