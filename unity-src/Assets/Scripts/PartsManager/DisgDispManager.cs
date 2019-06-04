using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;



public class DisgDispManager : PartsDispManager
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

            // 基準線を生成する
            foreach (string id in _webframe.ListMemberData.Keys)
            {
                if (!base._blockWorkData.ContainsKey(id))
                {
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[2]) };
                    FrameWeb.MemberData memberData = _webframe.ListMemberData[id];
                    this.InitLine(ref blockWorkData,  id, _webframe.ListMemberData[id]);
                    base._blockWorkData.Add(id, blockWorkData);
                }
            }
            
        }
        catch (Exception e)
        {
            Debug.Log("MemberDispManager CreateMembers" + e.Message);
        }
    }

    private void InitLine(ref BlockWorkData blockWorkData,  string block_id, FrameWeb.MemberData memberData)
    {
        int data_id = ComonFunctions.ConvertToInt(block_id);

        blockWorkData.gameObjectTransform = blockWorkData.gameObject.transform;
        blockWorkData.rootBlockTransform = blockWorkData.gameObjectTransform.Find("Root");
        blockWorkData.blockData = blockWorkData.gameObject.GetComponentInChildren<BlockData>();
        blockWorkData.blockData.id = data_id;
        blockWorkData.directionArrow = blockWorkData.gameObject.GetComponentInChildren<DirectionArrow>();
        blockWorkData.renderer = blockWorkData.gameObject.GetComponentInChildren<Renderer>();
        if (blockWorkData.renderer == null)
            return;

        blockWorkData.gameObject.name = block_id;
        blockWorkData.gameObjectTransform.parent = this.gameObject.transform;
        blockWorkData.gameObject.SetActive(true);

        //	メシュの取得
        MeshFilter meshFileter;
        meshFileter = blockWorkData.gameObject.GetComponentInChildren<MeshFilter>();
        if (meshFileter != null)
        {
            blockWorkData.mesh = meshFileter.mesh;
        }

        // 位置を決定
        Vector3 pos_i = _webframe.listNodePoint[memberData.ni];
        Vector3 pos_j = _webframe.listNodePoint[memberData.nj];

        Transform LineBlock = blockWorkData.rootBlockTransform.Find("Line");
        LineRenderer lRend = LineBlock.GetComponent<LineRenderer>();
        lRend.positionCount = 2;
        lRend.startWidth = _webframe.DisgLineScale;
        lRend.endWidth = _webframe.DisgLineScale;
        lRend.SetPosition(0, pos_i);
        lRend.SetPosition(1, pos_j);
    }

    /// <summary>
    /// 
    /// </summary>
    public override void SetBlockStatus(string id)
    {
        return;

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

        float Line_scale = _webframe.MemberLineScale;
        Vector3 scale = new Vector3(Line_scale, Line_scale, length);

        //	姿勢を設定
        blockWorkData = base._blockWorkData[id];

        blockWorkData.rootBlockTransform.position = pos_i;
        blockWorkData.rootBlockTransform.LookAt(pos_j);
        blockWorkData.rootBlockTransform.localScale = scale;

    }

}
