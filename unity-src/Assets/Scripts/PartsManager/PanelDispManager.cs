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
        if ( _webframe == null ) {
            Debug.Log("PanelDispManager _webframe == null");
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
            foreach (int i in _webframe.ListPanelData.Keys)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                string id = GetBlockID(i);
                base.InitBlock(ref blockWorkData, i, id);
                base._blockWorkData.Add(id, blockWorkData);
            }
        }
        catch (Exception e)
        {
            Debug.Log(" PanelDispManager CreatePanels" + e.Message);
        }
    }

    /// <summary>
    /// パーツを変更する
    /// </summary>
    public override void ChengeParts()
    {
        if (_webframe == null)
        {
            Debug.Log("PanelDispManager _webframe == null");
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
                if (!_webframe.ListPanelData.ContainsKey(i))
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
            foreach (string id in DeleteKeys){
                base._blockWorkData.Remove(id);
            }

            // 新しいブロックを生成する
            foreach (int i in _webframe.ListPanelData.Keys)
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
            Debug.Log("PanelDispManager ChengeParts" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i)
    {
        return "Panel[" + i + "]";
    }
    
    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("Panel[", "");
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
        base.ChengeForcuseBlock(this.GetBlockID(i));
    }

    /// <summary>
    /// 
    /// </summary>
    public	override void	SetBlockStatus( string id )
	{
        if (!base._blockWorkData.ContainsKey(id))
            return;

        int i = GetDataID(id);

        webframe.PanelData panelData = _webframe.ListPanelData[i];
        Dictionary<int, Vector3> ListNodeData = _webframe.listNodePoint;

        PartsDispStatus	partsDispStatus;

		//	パネルの有効をチェック
		List<int>	nodeNo = new List<int>();

		partsDispStatus.id = id;
		partsDispStatus.enable = false;

        int[] nodeNos = { panelData.no1, panelData.no2, panelData.no3 };
        foreach(int no in nodeNos)
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
	public	void CheckNodeAndUpdateStatus( int search_node )
	{
        Dictionary<int, webframe.PanelData> listPanelData = _webframe.ListPanelData;

        foreach (int i in listPanelData.Keys) {
            bool UpdateFlg = false;
            int[] nodeNos = { listPanelData[i].no1, listPanelData[i].no2, listPanelData[i].no3 };
            foreach (int nodeNo in nodeNos) { 
				if( nodeNo == search_node ) {
                    UpdateFlg = true;
                    break;
				}
			}
			if( UpdateFlg == false ) {		//	同じのが見つからなかったため更新する必要はない
				continue;
			}
			SetBlockStatus(GetBlockID(i));
		}
	}
	
}
