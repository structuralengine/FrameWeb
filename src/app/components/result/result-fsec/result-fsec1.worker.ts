/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {

  const fsec = {};
  let error: any = null;

  const jsonData = data.jsonData;
  const member: any[] = data.member;

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


  // 断面力の集計
  try {
    for (const caseNo of Object.keys(jsonData)) {
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
          fyi = (fyi == null) ? 0 : Math.round(fyi * 100) / 100;
          fzi = (fzi == null) ? 0 : Math.round(fzi * 100) / 100;
          mxi = (mxi == null) ? 0 : Math.round(mxi * 100) / 100;
          myi = (myi == null) ? 0 : Math.round(myi * 100) / 100;
          mzi = (mzi == null) ? 0 : Math.round(mzi * 100) / 100;

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
          fyj = (fyj == null) ? 0 : Math.round(fyj * 100) / 100;
          fzj = (fzj == null) ? 0 : Math.round(fzj * 100) / 100;
          mxj = (mxj == null) ? 0 : Math.round(mxj * 100) / 100;
          myj = (myj == null) ? 0 : Math.round(myj * 100) / 100;
          mzj = (mzj == null) ? 0 : Math.round(mzj * 100) / 100;

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

        }
      }
      fsec[caseNo.replace('Case', '')] = target;
    }

  } catch (e) {
    error = e;
  }

  postMessage({ fsec, error });
});
