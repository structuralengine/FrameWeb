using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;



public class MemberDispManager : PartsDispManager
{
    static readonly Color s_lineTypeBlockColor = Color.black;

    public enum DispType
    {
        Block,
        Line
    }

    private DispType _dispType = DispType.Line;

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
        if (_webframe == null)
        {
            Debug.Log("MemberDispManager _webframe == null");
            return;
        }

        try
        {
            BlockWorkData blockWorkData;

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
            foreach (int i in _webframe.ListMemberData.Keys)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                string id = GetBlockID(i);
                base.InitBlock(ref blockWorkData, i, GetBlockID(i));
                base._blockWorkData.Add(id, blockWorkData);
            }
        }
        catch (Exception e)
        {
            Debug.Log("MemberDispManager CreateMembers" + e.Message);
        }
    }


    /// <summary>
    /// パーツを変更する
    /// </summary>
    public override void ChengeParts()
    {
        if (_webframe == null)
        {
            Debug.Log("MemberDispManager _webframe == null");
            return;
        }

        try
        {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys)
            {
                int i = GetDataID(id);
                if (!_webframe.ListMemberData.ContainsKey(i))
                {
                    try
                    {
                        Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                        Destroy(base._blockWorkData[id].gameObject);
                    }
                    catch { }
                    finally
                    {
                        DeleteKeys.Add(id);
                    }
                }
            }
            foreach (string id in DeleteKeys)
            {
                base._blockWorkData.Remove(id);
            }

            // 新しいブロックを生成する
            foreach (int i in _webframe.ListMemberData.Keys)
            {
                string id = GetBlockID(i);
                if (!base._blockWorkData.ContainsKey(id))
                {
                    // 新しいオブジェクトを生成する
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                    base.InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
                // 座標を修正する
                SetBlockStatus(id);
            }
        }
        catch (Exception e)
        {
            Debug.Log("MemberDispManager ChengeParts" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i)
    {
        return "Member[" + i + "]";
    }

    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("Member[", "");
        string s2 = s1.Replace("]", "");
        return int.Parse(s2);
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int inputID)
    {
        ExternalConnect.SendAngularSelectItemChenge(inputID);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        string id = this.GetBlockID(i);

        base.ChengeForcuseBlock(id);
        foreach (string j in base._blockWorkData.Keys)
        {
            if (j == id)
                this.SetAllowStatus(j, true);
            else
                this.SetAllowStatus(j, false);
        }

    }

    /// <summary> ブロックの矢印を設定する </summary>
    /// <param name="onoff"></param>
    private void SetAllowStatus(string id, bool onoff)
    {
        BlockWorkData blockWorkData = base._blockWorkData[id];

        if (blockWorkData.directionArrow != null)
        {
            blockWorkData.directionArrow.EnableRenderer(onoff);
        }
    }

    /// <summary>
    /// 
    /// </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        int i = GetDataID(id);

        webframe.MemberData memberData = _webframe.ListMemberData[i];

        BlockWorkData blockWorkData;

        // 節点が有効かどうか調べる
        int nodeI = memberData.ni;
        int nodeJ = memberData.nj;

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
        if (_dispType == DispType.Block)
        {
            //	幅と高さを設定する
            scale = _webframe.ElementBlockScale(memberData.e);
            scale.z = length;
        }

        //	姿勢を設定
        blockWorkData = base._blockWorkData[id];

        blockWorkData.rootBlockTransform.position = pos_i;
        blockWorkData.rootBlockTransform.LookAt(pos_j);
        blockWorkData.rootBlockTransform.localScale = scale;

        //	方向矢印の表示
        if (blockWorkData.directionArrow != null)
        {
            if (_dispType == DispType.Block)
            {
                Quaternion rotate = Quaternion.LookRotation(pos_j - pos_i, Vector3.forward);
                Vector3 arrowCenter = Vector3.Lerp(pos_i, pos_j, 0.5f);
                Vector3 arrowSize = new Vector3(Line_scale/2, Line_scale/2, length * 0.25f);

                blockWorkData.directionArrow.SetArrowDirection(arrowCenter, rotate, arrowSize);
                blockWorkData.directionArrow.EnableRenderer(enabled);
            }
            else
            {
                blockWorkData.directionArrow.EnableRenderer(false);
            }
        }


        //	色の指定
        Color color = (_dispType == DispType.Block) ? s_noSelectColor : s_lineTypeBlockColor;
        base.SetPartsColor(id, color);
        this.SetAllowStatus(id, false);


    }


    /// <summary>
    /// 指定された節点と一致するブロックを設定する
    /// </summary>
    /// <param name="search_node"></param>
    public void CheckNodeAndUpdateStatus(int search_node)
    {
        Dictionary<int, webframe.MemberData> ListMemberData = _webframe.ListMemberData;

        foreach (int i in ListMemberData.Keys)
        {
            int nodeI = ListMemberData[i].ni;
            int nodeJ = ListMemberData[i].nj;

            float length = 0.0f;
            if (_webframe.GetNodeLength(nodeI, nodeJ, out length) == false)
                continue;
            if (search_node != nodeI && search_node != nodeJ)
            {
                continue;       //	関わっていないので無視
            }
            this.SetBlockStatus(GetBlockID(i));
        }
    }


    /// <summary>
    /// 
    /// </summary>
    public override void InputMouse()
    {
        if (_dispType == DispType.Block)
        {
            base.InputMouse();
        }
    }



    /// <summary>
    /// 
    /// </summary>
    /// <param name="dispType"></param>
    public void ChangeDispMode(DispType dispType)
    {
        if (_dispType == dispType)
        {
            return;
        }

        _dispType = dispType;
        SetBlockStatusAll();
    }

}
