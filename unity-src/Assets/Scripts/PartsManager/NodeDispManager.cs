using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class NodeDispManager : PartsDispManager
{
	const	float	NODE_SCALE = 0.02f;

	float	_maxNodeLangth = 0.0f;
	float	_nodeScale = 1.0f;

    /// <summary>ブロックの初期値を設定する </summary>
    /// <param name="_blockWorkData"></param>
    /// <param name="data_id"> データID </param>
    private void InitBlock(ref BlockWorkData blockWorkData, int data_id, string block_id)
    {
        blockWorkData.gameObjectTransform = blockWorkData.gameObject.transform;
        blockWorkData.rootBlockTransform = blockWorkData.gameObjectTransform.Find("Root");
        blockWorkData.blockData = blockWorkData.gameObject.GetComponentInChildren<BlockData>();
        blockWorkData.blockData.id = data_id;
        blockWorkData.directionArrow = blockWorkData.gameObject.GetComponentInChildren<DirectionArrow>();
        blockWorkData.renderer = blockWorkData.gameObject.GetComponentInChildren<Renderer>();
        if (blockWorkData.renderer == null)
            return;

        blockWorkData.renderer.sharedMaterial = Instantiate(blockWorkData.renderer.sharedMaterial);
        blockWorkData.materialPropertyBlock = new MaterialPropertyBlock();
        blockWorkData.materialPropertyBlock.SetColor("_Color", Color.white);
        blockWorkData.renderer.SetPropertyBlock(blockWorkData.materialPropertyBlock);

        blockWorkData.gameObject.name = block_id;
        blockWorkData.gameObjectTransform.parent = this.gameObject.transform;
        blockWorkData.gameObject.SetActive(false);

        //	メシュの取得
        MeshFilter meshFileter;
        meshFileter = blockWorkData.gameObject.GetComponentInChildren<MeshFilter>();
        if (meshFileter != null)
        {
            blockWorkData.mesh = meshFileter.mesh;
        }

    }

    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void	CreateParts()
	{
        if ( _webframe == null ) {
            Debug.Log("NodeDispManager _webframe == null");
            return;
		}

        try { 
            BlockWorkData blockWorkData;

            // 前のオブジェクトを消す
            foreach(string id in base._blockWorkData.Keys)
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
            foreach (int i in _webframe.listNodePoint.Keys)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                base._blockWorkData.Add(GetBlockID(i), blockWorkData);
            }

            // 新しいオブジェクトのプロパティを設定する
            foreach ( int i in _webframe.listNodePoint.Keys)
            {
                blockWorkData = base._blockWorkData[GetBlockID(i)];
                InitBlock(ref blockWorkData, i, GetBlockID(i));
            }
        }
        catch (Exception e)
        {
            Debug.Log("NodeDispManager CreateNodes" + e.Message);
        }
    }

    /// <summary>
    /// パーツを変更する
    /// </summary>
    public override void ChengeParts()
    {
        if (_webframe == null)
        {
            Debug.Log("NodeDispManager _webframe == null");
            return;
        }

        try {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys){
                int i = GetDataID(id);
                if (!_webframe.listNodePoint.ContainsKey(i)){
                    try {
                        Destroy(base._blockWorkData[id].renderer.sharedMaterial);
                        Destroy(base._blockWorkData[id].gameObject);
                    }
                    catch {}
                    finally {
                        DeleteKeys.Add(id);
                    }
                }
            }
            foreach( string id in DeleteKeys){
                base._blockWorkData.Remove(id);
            }

            // 円のスケールを再計算する
            //CalcNodeBlockScale(); ・・・後でやるのでコメントアウト

            // 新しいブロックを生成する
            foreach (int i in _webframe.listNodePoint.Keys)
            {
                string id = GetBlockID(i);
                if (!base._blockWorkData.ContainsKey(id)){
                    // 新しいオブジェクトを生成する
                    blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                    InitBlock(ref blockWorkData, i, id);
                    base._blockWorkData.Add(id, blockWorkData);
                }
                // 座標を修正する
                //SetBlockStatus(id); ・・・後でやるのでコメントアウト
            }
        }
        catch (Exception e)
        {
            Debug.Log("NodeDispManager ChengeParts" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i)
    {
        return "Node[" + i + "]";
    }

    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("Node[", "");
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


    /// <summary> ブロックのステータスを変更 </summary>
    public override void SetBlockStatus( string id )
	{
        if (!base._blockWorkData.ContainsKey(id))
            return;

        Vector3	nodePoint = _webframe.listNodePoint[GetDataID(id)];

		PartsDispManager.PartsDispStatus partsDispStatus;

		partsDispStatus.id	  = id;
		partsDispStatus.enable = true;

		if( base.SetBlockStatusCommon(partsDispStatus) == false ) {
			return;
		}

        //	表示に必要なパラメータを用意する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        //	姿勢を設定
        blockWorkData.gameObjectTransform.position = nodePoint;
        blockWorkData.gameObjectTransform.localScale = new Vector3(_nodeScale, _nodeScale, _nodeScale);
    }


    /// <summary> 接点を表示するためのサイズの計算をする </summary>
    public bool CalcNodeBlockScale( int search_node=-1 )
	{
        Dictionary<int, Vector3> listNodePoint = _webframe.listNodePoint;
		Vector3	startPos, endPos, disVec;
		float	max_length = 0.0f;
		float	length = 0.0f;

		//	全検索
		if( search_node == -1 ) { 

            foreach( int i in listNodePoint.Keys) {
				if( listNodePoint.ContainsKey(i) == false ) {
					continue;
				}
				startPos = listNodePoint[i];

                foreach (int j in listNodePoint.Keys)
                {
                    if (i == j)
                        continue;

                    if (listNodePoint.ContainsKey(j) == false)
						continue;

                    endPos = listNodePoint[j];
					disVec = endPos - startPos;
					length = Vector3.Dot( disVec, disVec );		//	高速化のためsqrtはしない
					if( max_length < length ) {
						max_length = length;
					}
				}
			}
		}
		else {
            //	空にされたら全検索し直す
            if (listNodePoint.ContainsKey(search_node) == false){
                return	CalcNodeBlockScale();
			}
			//	指定されたものだけ検索をする
			else{
				startPos = listNodePoint[search_node];

                foreach (int i in listNodePoint.Keys){
                    if (listNodePoint.ContainsKey(i) == false){
                        continue;
					}
					endPos = listNodePoint[i];
					disVec = endPos - startPos;
					length = Vector3.Dot( disVec, disVec );		//	高速化のためsqrtはしない
					if( max_length < length ) {
						max_length = length;
					}
				}
			}
		}

		max_length = (float)System.Math.Sqrt( max_length );
		if( _maxNodeLangth == max_length ) {
			return	false;
		}

        if (max_length > 0) {
           _maxNodeLangth = max_length;
            _nodeScale = _maxNodeLangth * NODE_SCALE;
        }
        else{
            // デフォルト値
            _maxNodeLangth = 0.0f;
            _nodeScale = 1.0f;
        }

        return	true;
	}
}
