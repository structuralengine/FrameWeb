using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class FixNodeDispManager : PartsDispManager
{
	const	float	FIXNODE_SCALE = 0.02f;

	float	_maxFixNodeLangth = 0.0f;
	float	_fixnodeScale = 1.0f;

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
            Debug.Log("FixNodeDispManager _webframe == null");
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
            foreach (int i in _webframe.ListFixNode.Keys)
            {
                blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab) };
                base._blockWorkData.Add(GetBlockID(i), blockWorkData);
            }

            // 新しいオブジェクトのプロパティを設定する
            foreach ( int i in _webframe.ListFixNode.Keys)
            {
                blockWorkData = base._blockWorkData[GetBlockID(i)];
                InitBlock(ref blockWorkData, i, GetBlockID(i));
            }
        }
        catch (Exception e)
        {
            Debug.Log("FixNodeDispManager CreateFixNodes" + e.Message);
        }
    }

    /// <summary>
    /// パーツを変更する
    /// </summary>
    public override void ChengeParts()
    {
        if (_webframe == null)
        {
            Debug.Log("FixNodeDispManager _webframe == null");
            return;
        }

        try {
            BlockWorkData blockWorkData;

            // データに無いブロックは消す
            List<string> DeleteKeys = new List<string>();
            foreach (string id in base._blockWorkData.Keys){
                int i = GetDataID(id);
                if (!_webframe.ListFixNode.ContainsKey(i)){
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
            //CalcFixNodeBlockScale(); ・・・後でやるのでコメントアウト

            // 新しいブロックを生成する
            foreach (int i in _webframe.ListFixNode.Keys)
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
            Debug.Log("FixNodeDispManager ChengeParts" + e.Message);
        }
    }


    /// <summary> ブロックのIDを取得 </summary>
    /// <param name="i"></param>
    private string GetBlockID(int i)
    {
        return "FixNode[" + i + "]";
    }

    /// <summary> データのIDを取得 </summary>
    /// <param name="id"></param>
    private int GetDataID(string id)
    {
        string s1 = id.Replace("FixNode[", "");
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

        webframe.FixNodeData fixnodePoint = _webframe.ListFixNode[0][GetDataID(id)];

		PartsDispManager.PartsDispStatus partsDispStatus;

		partsDispStatus.id	  = id;
		partsDispStatus.enable = true;

		if( base.SetBlockStatusCommon(partsDispStatus) == false ) {
			return;
		}

        //	表示に必要なパラメータを用意する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        //	姿勢を設定
        blockWorkData.gameObjectTransform.position = new Vector3((float)fixnodePoint.tx, (float)fixnodePoint.ty, (float)fixnodePoint.tz);
        blockWorkData.gameObjectTransform.localScale = new Vector3(_fixnodeScale, _fixnodeScale, _fixnodeScale);
    }


    /// <summary> 接点を表示するためのサイズの計算をする </summary>
    public bool CalcFixNodeBlockScale( int search_fixnode=-1 )
	{
        Dictionary<int, webframe.FixNodeData> ListFixNode = _webframe.ListFixNode[0];
		Vector3	startPos, endPos, disVec;
		float	max_length = 0.0f;
		float	length = 0.0f;

		//	全検索
		if( search_fixnode == -1 ) { 

            foreach( int i in ListFixNode.Keys) {
				if( ListFixNode.ContainsKey(i) == false ) {
					continue;
				}
				startPos = new Vector3( (float)ListFixNode[i].tx, (float)ListFixNode[i].ty, (float)ListFixNode[i].tz);

                foreach (int j in ListFixNode.Keys)
                {
                    if (i == j)
                        continue;

                    if (ListFixNode.ContainsKey(j) == false)
						continue;

                    endPos = new Vector3((float)ListFixNode[j].tx, (float)ListFixNode[j].ty, (float)ListFixNode[j].tz); 
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
            if (ListFixNode.ContainsKey(search_fixnode) == false){
                return	CalcFixNodeBlockScale();
			}
			//	指定されたものだけ検索をする
			else{
				startPos = new Vector3((float)ListFixNode[search_fixnode].tx, (float)ListFixNode[search_fixnode].ty, (float)ListFixNode[search_fixnode].tz);

                foreach (int i in ListFixNode.Keys){
                    if (ListFixNode.ContainsKey(i) == false){
                        continue;
					}
					endPos = new Vector3((float)ListFixNode[i].tx, (float)ListFixNode[i].ty, (float)ListFixNode[i].tz);
					disVec = endPos - startPos;
					length = Vector3.Dot( disVec, disVec );		//	高速化のためsqrtはしない
					if( max_length < length ) {
						max_length = length;
					}
				}
			}
		}

		max_length = (float)System.Math.Sqrt( max_length );
		if( _maxFixNodeLangth == max_length ) {
			return	false;
		}

        if (max_length > 0) {
           _maxFixNodeLangth = max_length;
            _fixnodeScale = _maxFixNodeLangth * FIXNODE_SCALE;
        }
        else{
            // デフォルト値
            _maxFixNodeLangth = 0.0f;
            _fixnodeScale = 1.0f;
        }

        return	true;
	}
}
