using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

public class JointDispManager : PartsDispManager
{
    public override void ChangeTypeNo(int TypeNo)
    {
        _webframe.JointType = TypeNo;
    }

    public override void CreateParts()
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
    }

    /// <summary>
    /// パーツを作成する
    /// </summary>
    /// <remarks>
    /// データの状況によって 生成するパーツの 個数が変わる本DispManbager は
    /// CreateParts ではなく SetBlockStatusAll でパーツの生成を行う
    /// </remarks>
    public override void SetBlockStatusAll()
    {
        try
        {
            // 新しいオブジェクトを生成する
            foreach (int i in _webframe.ListJointData.Keys)
            {
                FrameWeb.JointData jo = _webframe.ListJointData[i];
                if (!_webframe.ListMemberData.ContainsKey(jo.m)) continue;
                FrameWeb.MemberData memberData = _webframe.ListMemberData[jo.m];
                if (!_webframe.listNodePoint.ContainsKey(memberData.ni)) continue;
                Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
                if (!_webframe.listNodePoint.ContainsKey(memberData.nj)) continue;
                Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

                foreach (var target in new Dictionary<string, int>() { { "xi", jo.xi }, { "yi", jo.yi }, { "zi", jo.zi }, { "xj", jo.xj }, { "yj", jo.yj }, { "zj", jo.zj } })
                {
                    if (target.Value == 0) continue;
                    string id = i.ToString() + target.Key;
                    Vector3 nodePoint = new Vector3();
                    Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i);
                    Quaternion move_q = new Quaternion();

                    switch (target.Key)
                    {
                        case "xi":
                            nodePoint = pos_i;
                            move_q = Quaternion.Euler(90f, 0f, 0f);
                            break;
                        case "yi":
                            nodePoint = pos_i;
                            move_q = Quaternion.Euler(0f, 90f, 0f);
                            break;
                        case "zi":
                            nodePoint = pos_i;
                            move_q = Quaternion.Euler(0f, 0f, 90f);
                            break;
                        case "xj":
                            nodePoint = pos_j;
                            move_q = Quaternion.Euler(90f, 0f, 0f);
                            break;
                        case "yj":
                            nodePoint = pos_j;
                            move_q = Quaternion.Euler(0f, 90f, 0f);
                            break;
                        case "zj":
                            nodePoint = pos_j;
                            move_q = Quaternion.Euler(0f, 0f, 90f);
                            break;
                    }

                    //	表示に必要なパラメータを用意する
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    base.InitBlock(ref blockWorkData, i, id);

                    //	姿勢を設定
                    blockWorkData.gameObjectTransform.position = nodePoint;
                    blockWorkData.gameObjectTransform.localScale = new Vector3(_webframe.JointBlockScale, _webframe.JointBlockScale, _webframe.JointBlockScale);
                    blockWorkData.gameObjectTransform.rotation = rotate * move_q;

                    // 登録
                    base._blockWorkData.Add(id, blockWorkData);
                    PartsDispManager.PartsDispStatus partsDispStatus;
                    partsDispStatus.id = id;
                    partsDispStatus.enable = true;

                    if (base.SetBlockStatusCommon(partsDispStatus) == false)
                    {
                        return;
                    }

                    //	色の指定
                    base.SetPartsColor(id, s_noSelectColor);
                }

            }
        }
        catch (Exception e)
        {
            Debug.Log("JointDispManager CreateNodes" + e.Message);
        }
    }


    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int row)
    {
        ExternalConnect.SendAngularSelectItemChenge(row);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        base.ChengeForcuseBlock(i.ToString());
    }


}
