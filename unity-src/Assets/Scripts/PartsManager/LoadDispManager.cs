using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// 荷重（ノード）の表示を管理するクラス
/// </summary>
public class LoadDispManager : PartsDispManager
{
    public GameObject memberPrefab; //Member用プレハブ

    const float TRIANGLE_HEIGHT = 0.4f; //矢印の三角形部分の高さ。この長さ分、矢印の棒部分を短くする
    const float MEMBER_PADDING = 0.4f;  //Memberの矢印の間隔

    int nodeCount = 0;  //使用するLoadNodeの数。ID計算で使用する。

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void CreateParts()
    {
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

            //Node個数指定
            nodeCount = _webframe.ListLoadData.load_node.Count;

            // 新しいオブジェクトを生成・プロパティを設定
            for (int i = 0; i < nodeCount + _webframe.ListLoadData.load_member.Count; i++)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate((i < nodeCount) ? _blockPrefab[0] : memberPrefab) };
                base._blockWorkData.Add(GetBlockID(i, (i < nodeCount)), blockWorkData);
                base.InitBlock(ref blockWorkData, i, GetBlockID(i, (i < nodeCount)));
            }

        }
        catch (Exception e)
        {
            Debug.Log("LoadDispManager CreateNodes" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i, bool isNode)
    {
        return "Load" + ((isNode) ? "Node" : "Member") + "[" + i + "]";
    }
    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("LoadNode[", "");
        s1 = s1.Replace("LoadMember[", "");
        s1 = s1.Replace("]", "");
        return int.Parse(s1);
    }

    /// <summary> 荷重のNodeかMemberか判定 </summary>
    /// <param name="id"></param>
    private bool IsNode(string id)
    {
        return id.Contains("LoadNode");
    }

    /// <summary> ブロックのステータスを変更 </summary>
    public override void SetBlockStatus(string id)
    {
        if (!base._blockWorkData.ContainsKey(id))
            return;

        PartsDispStatus partsDispStatus;
        partsDispStatus.id = id;
        partsDispStatus.enable = true;

        if (base.SetBlockStatusCommon(partsDispStatus) == false)
        {
            return;
        }

        // 対象オブジェクトと何番目かを取得する
        int blockNum = 0;
        BlockWorkData blockWorkData = null;
        foreach (var item in base._blockWorkData)
        {
            if (item.Key == id)
            {
                blockWorkData = item.Value;
                break;
            }
            blockNum++;
        }

        // NodeとMemberで分岐
        if (IsNode(id))
        {
            SetNode(blockNum, blockWorkData);
        }
        else
        {
            blockNum -= nodeCount;  //Node個数分引く
            SetMember(blockNum, blockWorkData);
        }
    }

    /// <summary>
    /// 荷重Nodeのステータス変更
    /// </summary>
    /// <param name="id">対象オブジェクトのID</param>
    /// <param name="blockWorkData">対象オブジェクトのBlockWorkData</param>
    private void SetNode(int id, BlockWorkData blockWorkData)
    {
        // パラメータ取得
        FrameWeb.LoadNodeData loadNodeData = _webframe.ListLoadData.load_node[id];

        // 位置指定（どのNodeに付くか）
        Vector3 pos = _webframe.listNodePoint[loadNodeData.n];
        blockWorkData.gameObjectTransform.position = pos;

        Vector3 target = new Vector3((float)loadNodeData.tx, (float)loadNodeData.ty, (float)loadNodeData.tz);

        // 矢印と円どっちか
        if (target.sqrMagnitude > 0.0f)
        {
            // 矢印の場合
            // 向き指定
            blockWorkData.gameObjectTransform.LookAt(pos + target);

            // 大きさ指定：棒オブジェクトのみリサイズする。矢印の頭部分があるので、それを引いた分の大きさを計算する。
            try
            {
                blockWorkData.rootBlockTransform.Find("Arrow").transform.localScale = new Vector3(1, 1, target.magnitude - TRIANGLE_HEIGHT);
                blockWorkData.rootBlockTransform.Find("Circle").gameObject.SetActive(false);
            }
            catch (Exception ex)
            {
                Debug.LogError(ex);
            }
        }
        else
        {
            // 円の場合
            target = new Vector3((float)loadNodeData.rx, (float)loadNodeData.ry, (float)loadNodeData.rz);
            // 向き指定
            blockWorkData.gameObjectTransform.Rotate(target);

            // 表示オブジェクト指定
            try
            {
                blockWorkData.rootBlockTransform.Find("Arrow").gameObject.SetActive(false);
                blockWorkData.rootBlockTransform.Find("Triangle").gameObject.SetActive(false);
            }
            catch (Exception ex)
            {
                Debug.LogError(ex);
            }
        }
    }

    /// <summary>
    /// 荷重Memberのステータス変更
    /// </summary>
    /// <param name="id">対象オブジェクトのID</param>
    /// <param name="blockWorkData">対象オブジェクトのBlockWorkData</param>
    private void SetMember(int id, BlockWorkData blockWorkData)
    {
        // パラメータ取得
        FrameWeb.LoadMemberData loadMemberData = _webframe.ListLoadData.load_member[id];

        // 矢印のベースとなるオブジェクト
        Transform part = blockWorkData.rootBlockTransform.Find("MemberPart");
        Transform stick = blockWorkData.rootBlockTransform.Find("Stick");

        // 基本位置指定：IをRoot位置とする
        Vector3 niPos = _webframe.listNodePoint[_webframe.ListMemberData[loadMemberData.m].ni];
        Vector3 njPos = _webframe.listNodePoint[_webframe.ListMemberData[loadMemberData.m].nj];
        Vector3 ijVector = njPos - niPos;   //IからJに向けたベクトル
        blockWorkData.gameObjectTransform.position = niPos;

        // MARK 1
        if (loadMemberData.mark == 1)
        {
            // P1の場所指定
            part.position = ijVector.normalized * (float)loadMemberData.L1;

            // P2作成
            Transform part2 = Instantiate(part, blockWorkData.rootBlockTransform);
            part2.position = ijVector.normalized * (float)loadMemberData.L2;

            // 向きと大きさ指定
            SetMemberPart(part, loadMemberData, 0.0f);
            SetMemberPart(part2, loadMemberData, 1.0f);

            // 繋ぐ棒消す
            stick.gameObject.SetActive(false);

            // MARK 2
        }
        else
        {
            // P1の場所指定
            part.position = ijVector.normalized * (float)loadMemberData.L1;
            Vector3 startPos = SetMemberPart(part, loadMemberData, 0.0f);

            // 何個作る？
            int count = (int)((ijVector.magnitude - (float)loadMemberData.L1 - (float)loadMemberData.L2) / MEMBER_PADDING);
            for (int i = 1; i < count; i++)
            {   //0位置はP1なので、1からスタート
                Transform partChild = Instantiate(part, blockWorkData.rootBlockTransform);
                partChild.position = ijVector.normalized * ((float)loadMemberData.L1 + i * MEMBER_PADDING);
                SetMemberPart(partChild, loadMemberData, 1.0f / (float)count * (float)i);
            }

            // P2作成
            Transform part2 = Instantiate(part, blockWorkData.rootBlockTransform);
            part2.position = ijVector.normalized * (ijVector.magnitude - (float)loadMemberData.L2);
            Vector3 endPos = SetMemberPart(part2, loadMemberData, 1.0f);

            // 棒繋ぐ
            stick.localScale = new Vector3(1, 1, (startPos - endPos).magnitude);
            stick.position = startPos;
            stick.LookAt(endPos);
        }
    }

    /// <summary>
    /// Memberの１パーツの大きさを設定する
    /// </summary>
    /// <param name="part">パーツ（１矢印分）</param>
    /// <param name="loadMemberData">対象のLoadMemberData</param>
    /// <param name="scaleFactor">大きさ係数（0=P1, 1=P2, 0.5=P1とP2の中間50%）</param>
    private Vector3 SetMemberPart(Transform part, FrameWeb.LoadMemberData loadMemberData, float scaleFactor)
    {
        float scale = Mathf.Lerp((float)loadMemberData.P1, (float)loadMemberData.P2, scaleFactor);

        // 向きと大きさ指定
        if (loadMemberData.direction == "r")
        {
            // ねじりの場合
            // 大きさ
            part.Find("Circle").transform.localScale = new Vector3(scale, scale, 1);

            // 矢印消す
            part.Find("Arrow").gameObject.SetActive(false);
            part.Find("Triangle").gameObject.SetActive(false);
            return Vector3.zero;

        }
        else
        {
            // 矢印の場合
            // 大きさ
            part.Find("Arrow").transform.localScale = new Vector3(1, 1, scale - TRIANGLE_HEIGHT);

            // 向き
            Transform member = GameObject.Find("Member[" + loadMemberData.m + "]/Root").transform;
            Vector3 target = Vector3.zero;
            if (loadMemberData.direction == "x") target = member.right;
            if (loadMemberData.direction == "y") target = member.up;
            if (loadMemberData.direction == "z") target = member.forward;
            if (loadMemberData.direction == "gx") target = Vector3.right;
            if (loadMemberData.direction == "gy") target = Vector3.up;
            if (loadMemberData.direction == "gz") target = Vector3.forward;
            part.LookAt(part.position + target);

            // 円消す
            part.Find("Circle").gameObject.SetActive(false);

            return part.position + target * scale;
        }
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public override void SendSelectChengeMessage(int i)
    {
        ExternalConnect.SendAngularSelectItemChenge(i);
    }

    /// <summary> ブロックの色を変更 </summary>
    public override void ChengeForcuseBlock(int i)
    {
        Debug.LogWarning(i);
        Debug.LogWarning(base._blockWorkData[i.ToString()].gameObject.name);
        base.ChengeForcuseBlock("a");
    }
}
