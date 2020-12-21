/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {


    const scene = data.scene;
    const memberLoadList = data.memberLoadList;
    const memberLoadScale = data.memberLoadScale;
    const intersectObjects = data.intersectObjects;
    const THREE = data.THREE;

    // 要素荷重のスケールを変更する
    for (const item of memberLoadList) {
        if (item.name === 'qx') {
        continue;
        }
        if ('localAxis' in item) {
        let scaleX: number = 1;
        let scaleY: number = 1;
        let scaleZ: number = 1;

        if (item.name === "qz") {
            scaleX = 1;
            scaleY = memberLoadScale;
            scaleZ = 1;
        } else if (item.name === "fx" || item.name === "fy" || item.name === "fz") {
            scaleX = memberLoadScale;
            scaleY = memberLoadScale;
            scaleZ = memberLoadScale;
        } else {
            scaleX = memberLoadScale;
            scaleY = memberLoadScale;
            scaleZ = 1;
        }
        for (const item2 of item.children) {
            item2.scale.set(scaleX, scaleY, scaleZ);
        }
        }
    }

    scene.render(); // スケールの変更が終わった時点で、一旦更新する（スケールの変更結果を当り判定に反映するため）


    // -----------------------------------------------------------------------------------------------------------------------
    // 要素荷重が重ならないようにずらす -----------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------
    const check_box = {};   // ここに登録されている変数に当たってはいけない
    const target_box = {};   // 当たらないように避けるオブジェクト

    // 当り判定に用いるオブジェクトと当たらないように避けるオブジェクトを分ける -----------------------------------------------------
    for (const item of memberLoadList) {
        if (!('check_box' in item)) {
        continue;
        }

        const cb = item.check_box;  // 荷重の重なりを判定するためのプロパティ
        const m: string = cb.m;     // 部材番号

        if (cb.direction === 'wr' || cb.direction === 'wx') {
        // markが2 の 分布回転モーメント荷重, 軸方向荷重 は座標を登録するだけ
        if (!(m in check_box)) {
            check_box[m] = { check_point: [], check_load: [] };
        }
        check_box[m].check_point.push(new THREE.Vector3(cb.area.x1, cb.area.y1, cb.area.z1));
        check_box[m].check_point.push(new THREE.Vector3(cb.area.x2, cb.area.y2, cb.area.z2));
        check_box[m].check_load.push(item);

        } else if (cb.direction.indexOf('m') >= 0) {
        // markが11 の 集中回転モーメント荷重 は座標を登録するだけ
        for (const p of cb.pos) {
            if (!(m in check_box)) {
            check_box[m] = { check_point: [], check_load: [] };
            }
            check_box[m].check_point.push(new THREE.Vector3(p.x, p.y, p.z));
            check_box[m].check_load.push(item);
        }

        } else {
        // 当り判定をする荷重を登録
        if (!(m in target_box)) {
            target_box[m] = new Array();
        }
        target_box[m].push(item);
        }
    }



    // 当たらないように避けるオブジェクトの位置を決める --------------------------------------------------------------------
    for (const m of Object.keys(target_box)) {
        if (!(m in check_box)) {
        check_box[m] = { check_point: [], check_load: [] };
        }
        // 部材 m に載荷されている荷重について当り判定を行う
        const targets: any[] = target_box[m];
        for (const item of targets) {

        if (item.check_box.direction.indexOf('p') >= 0) {
            // markが1の集中荷重
            // 当たっているオブジェクトの中で最も遠い距離を算定する
            const direction = new THREE.Vector3(-item.localAxis.x, -item.localAxis.y, -item.localAxis.z);
            let distance: number = 0;
            for (const pos of item.check_box.pos) {
            const origin = new THREE.Vector3(pos.x, pos.y, pos.z);
            const raycaster = new THREE.Raycaster(origin, direction);
            for (const cb of check_box[m].check_load) {
                const intersects = intersectObjects(cb, raycaster);
                if (cb.check_box.direction === 'wr' && intersects.length > 0) {
                // ねじりモーメント荷重との交差判定だけ特別な処理をする
                const p_one: number = Math.abs(cb.check_box.p1) * memberLoadScale;
                const p_two: number = Math.abs(cb.check_box.p2) * memberLoadScale;
                distance = Math.max(distance, p_one, p_two);
                } else {
                for (const ins of intersects) {
                    distance = Math.max(distance, ins.distance);
                }
                }
            }
            }
            // 重ならない位置に修正する
            const posX: number = direction.x * distance;
            const posY: number = direction.y * distance;
            const posZ: number = direction.z * distance;
            item.position.set(posX, posY, posZ);
            scene.render();
            // 当たってはいけないオブジェクトとして登録
            for (const obj of item.children) {
            check_box[m].check_point.push(obj.position);
            }
            check_box[m].check_load.push(item);

        } else {
            // markが2のy, z の分布荷重荷重
            // 当たっているオブジェクトの中で最も遠い距離を算定する
            const direction = new THREE.Vector3(-item.localAxis.x, -item.localAxis.y, -item.localAxis.z);
            const p1 = new THREE.Vector3(item.check_box.area.x1, item.check_box.area.y1, item.check_box.area.z1);
            const p2 = new THREE.Vector3(item.check_box.area.x2, item.check_box.area.y2, item.check_box.area.z2);
            const l0 = p1.distanceTo(p2);
            check_box[m].check_point.push(p1);
            check_box[m].check_point.push(p2);

            // 登録したすべてのポイントに対して距離を調べる
            let distance: number = 0;
            for (const pos of check_box[m].check_point) {
            const l1 = p1.distanceTo(pos);
            const l2 = p2.distanceTo(pos);
            if (l1 <= l0 && l2 <= l0) {
                const raycaster = new THREE.Raycaster(pos, direction);
                // 登録したすべての荷重に対して距離を調べる
                for (const cb of check_box[m].check_load) {
                const intersects = intersectObjects(cb, raycaster);
                if (cb.check_box.direction === 'wr' && intersects.length > 0) {
                    // ねじりモーメント荷重との交差判定だけ特別な処理をする
                    const p_one: number = Math.abs(cb.check_box.p1) * memberLoadScale;
                    const p_two: number = Math.abs(cb.check_box.p2) * memberLoadScale;
                    distance = Math.max(distance, p_one, p_two);
                } else {
                    for (const ins of intersects) {
                    distance = Math.max(distance, ins.distance);
                    }
                }
                }
            }
            }
            // 位置を重ならない位置に修正する
            const posX: number = direction.x * distance;
            const posY: number = direction.y * distance;
            const posZ: number = direction.z * distance;
            item.position.set(posX, posY, posZ);
            scene.render();
            // 当たってはいけないオブジェクトとして登録
            check_box[m].check_load.push(item);

        }

        }
    }
      
  
    postMessage({status: true});
   
  });
  