using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using SystemUtility;


public class PanelDispManager : PartsDispManager
{
    /// <summary>
    /// パーツを作成する
    /// </summary>
    public	override void	CreateParts()
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

            // 新しいオブジェクトを生成する
            foreach (string id in _webframe.ListPanelData.Keys)
            {
                int i = ComonFunctions.ConvertToInt(id);
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[0]) };
                base.InitBlock(ref blockWorkData, i, id);
                base._blockWorkData.Add(id, blockWorkData);
            }
        }
        catch (Exception e)
        {
            Debug.Log(" PanelDispManager CreatePanels" + e.Message);
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
        base.ChengeForcuseBlock(i.ToString());
    }

    /// <summary>
    /// 
    /// </summary>
    public	override void	SetBlockStatus( string id )
	{
        if (!base._blockWorkData.ContainsKey(id))
            return;

        FrameWeb.PanelData panelData = _webframe.ListPanelData[id];
        Dictionary<string, Vector3> ListNodeData = _webframe.listNodePoint;

        PartsDispStatus	partsDispStatus;

		//	パネルの有効をチェック
		List<string>	nodeNo = new List<string>();

		partsDispStatus.id = id;
		partsDispStatus.enable = false;

        string[] nodeNos = { panelData.no1, panelData.no2, panelData.no3 };
        foreach(string no in nodeNos)
        {
            if (ListNodeData.ContainsKey(no))
            {
                partsDispStatus.enable = true;
                nodeNo.Add(no);
            }
        }

        // 3つの頂点が有効でなかったら
        if (nodeNo.Count < 3){
            partsDispStatus.enable = false;
            return;
        }

        //	同じIDがないか検索
        for ( int j=0; j<nodeNo.Count; j++ ){
			for( int k=j+1; k<nodeNo.Count; k++ ){
				if( nodeNo[j] == nodeNo[k] ) {
					partsDispStatus.enable = false;
					break;
				}
			}
			if( j!=nodeNo.Count ) {
				break;
			}
		}

		if( SetBlockStatusCommon(partsDispStatus) == false ) {
			return;
		}


        //	頂点位置を再定義する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        PanelBlock panelBlock = blockWorkData.gameObject.GetComponentInChildren<PanelBlock>();
		Vector3[]	position = new Vector3[nodeNo.Count];

		for ( int j=0; j<nodeNo.Count; j++ ){
            Vector3 node = _webframe.listNodePoint[nodeNo[j]];
            position[j] = node;
		}
		panelBlock.SetPanelPointPosition( position );
    }



	/// <summary>
	/// 
	/// </summary>
	/// <param name="search_node"></param>
	public	void CheckNodeAndUpdateStatus( string search_node )
	{
        Dictionary<string, FrameWeb.PanelData> listPanelData = _webframe.ListPanelData;

        foreach (string id in listPanelData.Keys) {
            bool UpdateFlg = false;
            string[] nodeNos = { listPanelData[id].no1, listPanelData[id].no2, listPanelData[id].no3 };
            foreach (string nodeNo in nodeNos) { 
				if( nodeNo == search_node ) {
                    UpdateFlg = true;
                    break;
				}
			}
			if( UpdateFlg == false ) {		//	同じのが見つからなかったため更新する必要はない
				continue;
			}
			SetBlockStatus(id);
		}
	}
	
}
