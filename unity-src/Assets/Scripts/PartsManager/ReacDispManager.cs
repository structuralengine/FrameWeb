using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine;


/// <summary>
/// 反力（Reac）の表示を管理するクラス
/// </summary>
public class ReacDispManager : PartsDispManager
{

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
        try
        {
            // 前のオブジェクトを消す
            foreach (string id in base._blockWorkData.Keys)
            {
                try
                {
                    Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                    Destroy(base._blockWorkData[id].gameObject);
                }
                catch { }
            }
            base._blockWorkData.Clear();

            // 新しいオブジェクトを生成する
            BlockWorkData blockWorkData;
            foreach (string id in _webframe.ListReacData.Keys)
            {
                if (!_webframe.listNodePoint.ContainsKey(id))
                    continue;

                if (!base._blockWorkData.ContainsKey(id))
                {
                    int i = ComonFunctions.ConvertToInt(id);
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    base.InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
            }

        }
        catch (Exception e)
        {
            Debug.Log("ReacDispManager CreateNodes" + e.Message);
        }
    }


    /// <summary> ブロックのステータスを変更 </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        Vector3 nodePoint = _webframe.listNodePoint[id];

        PartsDispManager.PartsDispStatus partsDispStatus;

        partsDispStatus.id = id;
        partsDispStatus.enable = true;

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        //	姿勢を設定
        blockWorkData.gameObjectTransform.position = nodePoint;
        Vector3 scale = new Vector3(_webframe.ReacBlockScale, _webframe.ReacBlockScale, _webframe.ReacBlockScale);
        blockWorkData.gameObjectTransform.localScale = scale;

        //	色の指定
        base.SetPartsColor(id, s_noSelectColor);

    }

}
