using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;
using UnityEngine;

/// <summary>
/// バネの表示を管理するクラス
/// </summary>
public class FixMemberDispManager : PartsDispManager
{
    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
        try
        {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys)
            {
                if (!_webframe.ListMemberData.ContainsKey(id))
                    DeleteKeys.Add(id);
            }
            // 前のオブジェクトを消す
            foreach (string id in DeleteKeys)
            {
                try
                {
                    Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                    Destroy(base._blockWorkData[id].gameObject);
                    base._blockWorkData.Remove(id);
                }
                catch { }
            }

            // 新しいオブジェクトを生成する
            foreach (string id in _webframe.ListMemberData.Keys)
            {
                int i = ComonFunctions.ConvertToInt(id);
                if (!base._blockWorkData.ContainsKey(id))
                {
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[1]) };
                    base.InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
            }
        }
        catch (Exception e)
        {
            Debug.Log("FixMemberDispManager CreateMembers" + e.Message);
        }
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int inputID)
    {
        ExternalConnect.SendAngularSelectItemChenge(inputID);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        string id = i.ToString();
        base.ChengeForcuseBlock(id);
    }


    /// <summary>
    /// 
    /// </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        FrameWeb.MemberData memberData = _webframe.ListMemberData[id];

        BlockWorkData blockWorkData;

        // 節点が有効かどうか調べる
        string nodeI = memberData.ni;
        string nodeJ = memberData.nj;

        float length = 0.0f;

        PartsDispStatus partsDispStatus;
        partsDispStatus.id = id;
        partsDispStatus.enable = _webframe.GetNodeLength(nodeI, nodeJ, out length);

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        //	表示に必要なパラメータを用意する
        Vector3 pos_i = _webframe.listNodePoint[nodeI];
        Vector3 pos_j = _webframe.listNodePoint[nodeJ];

        float Line_scale = _webframe.MemberLineScale();
        Vector3 scale = new Vector3(Line_scale, Line_scale, length);

        //	幅と高さを設定する
        scale = _webframe.ElementBlockScale(memberData.e);
        scale.z = length;

        //	姿勢を設定
        blockWorkData = base._blockWorkData[id];

        blockWorkData.rootBlockTransform.position = pos_i;
        blockWorkData.rootBlockTransform.LookAt(pos_j);
        blockWorkData.rootBlockTransform.localScale = scale;



        //	色の指定
        base.SetPartsColor(id, s_noSelectColor);

    }


}
