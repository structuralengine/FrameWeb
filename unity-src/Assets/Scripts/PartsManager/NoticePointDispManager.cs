using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;

public class NoticePointDispManager : PartsDispManager
{
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
            foreach (int i in _webframe.ListNoticePoint.Keys)
            {
                FrameWeb.NoticePointData np = _webframe.ListNoticePoint[i];
                if (!_webframe.ListMemberData.ContainsKey(np.m)) continue;
                FrameWeb.MemberData memberData = _webframe.ListMemberData[np.m];
                float length = 0.0f;
                if (!_webframe.GetNodeLength(memberData.ni, memberData.nj, out length)) continue;
                Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
                Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

                int j = 0;
                foreach (var target in np.Points)
                {
                    string id = i.ToString() + j.ToString();
                    Vector3 noticePoint = Vector3.Lerp(pos_i, pos_j, target / length);
                    Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i);

                    //	表示に必要なパラメータを用意する
                    BlockWorkData blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                    base.InitBlock(ref blockWorkData, i, id);

                    //	姿勢を設定
                    blockWorkData.gameObjectTransform.position = noticePoint;
                    blockWorkData.gameObjectTransform.localScale = new Vector3(_webframe.NoticePointBlockScale, _webframe.NoticePointBlockScale, _webframe.NoticePointBlockScale);
                    blockWorkData.gameObjectTransform.rotation = rotate;

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

                    j++;
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
