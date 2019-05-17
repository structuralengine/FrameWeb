using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class FixNodeDispManager : PartsDispManager
{
	const	float	FIXNODE_SCALE = 0.5f;

	float	_maxFixNodeLangth = 0.0f;
	float	_fixnodeScale = 0.4f;

  public enum DispType
  {
    Block,
    Line,
  }

  private DispType _dispType = DispType.Line;

	[SerializeField]
	private GameObject[] _prefabs;


    /// <summary>
    /// パーツを作成する
    /// </summary>
    public override void	CreateParts()
	{
        // データの状況によって 生成するパーツの 個数が変わる本DispManbager は
        // SetBlockStatusAll でパーツの生成を行う

        try
        { 
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
            foreach (int i in _webframe.ListFixNode[_webframe.FixNodeType].Keys)
            {
				if (!_webframe.ListFixNode[_webframe.FixNodeType].ContainsKey(i)) continue;

				var list = _webframe.ListFixNode[_webframe.FixNodeType][i];
				double tx = list.tx;
				double ty = list.ty;
				double tz = list.tz;
				double rx = list.rx;
				double ry = list.ry;
				double rz = list.rz;

                // データ入力パターンと図形描画に従い、パターンに応じて表示させる図形を変更する
                int blockIndex = 0;
				// ------------------------------------
				// t系に1が入っている場合に描画するモデル
				// ------------------------------------
				if ((tx == 1 && ty == 0 && tz == 0) ||
					(tx == 0 && ty == 1 && tz == 0) ||
					(tx == 0 && ty == 0 && tz == 1) ||
					(tx == 1 && ty == 1 && tz == 0) ||
					(tx == 0 && ty == 1 && tz == 1) ||
					(tx == 1 && ty == 0 && tz == 1))
				{

                    blockIndex = 0;
				}
				// ------------------------------------


				// ------------------------------------
				// r系に1が入っている場合に描画するモデル
				// ------------------------------------
				if ((rx == 1 && ry == 0 && rz == 0) ||
					(rx == 0 && ry == 1 && rz == 0) ||
					(rx == 0 && ry == 0 && rz == 1) ||
					(rx == 1 && ry == 1 && rz == 0) ||
					(rx == 0 && ry == 1 && rz == 1) ||
					(rx == 1 && ry == 0 && rz == 1) ||
					(rx == 1 && ry == 1 && rz == 1)) {
                    blockIndex = 1;

                }
				// ------------------------------------

				// ------------------------------------
				// t系の値が1以外の場合
				// TODO:「1以外」とすると 0 も含まれてしまい、上で設定したものが上書きされる恐れがあるため「0以外」も含めています。
				if ( (tx != 0 && tx != 1) || (ty != 0 && ty != 1) || (tz != 0 && tz != 1)) {
                    blockIndex = 2;

                }

				// ------------------------------------
				// r系の値が1以外の場合
				// TODO:「1以外」とすると 0 も含まれてしまい、上で設定したものが上書きされる恐れがあるため「0以外」も含めています。
				if ( (rx != 0 && rx != 1) || (ry != 0 && ry != 1) || (rz != 0 && rz != 1)) {
                    blockIndex = 3;

                }

				blockWorkData = new BlockWorkData { gameObject = Instantiate(_blockPrefab[blockIndex]) };
				base._blockWorkData.Add(GetBlockID(i), blockWorkData);
            }

            // 新しいオブジェクトのプロパティを設定する
            foreach ( int i in _webframe.ListFixNode[_webframe.FixNodeType].Keys)
            {
                blockWorkData = base._blockWorkData[GetBlockID(i)];
                base.InitBlock(ref blockWorkData, i, GetBlockID(i));
            }
        }
        catch (Exception e)
        {
            Debug.Log("FixNodeDispManager CreateFixNodes" + e.Message);
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

        int i = GetDataID(id);
		FrameWeb.FixNodeData fixnodePoint = _webframe.ListFixNode[_webframe.FixNodeType][i];

        PartsDispManager.PartsDispStatus partsDispStatus;

        partsDispStatus.id	  = id;
        partsDispStatus.enable = true;

        if( base.SetBlockStatusCommon(partsDispStatus) == false ) {
            return;
        }

        //	表示に必要なパラメータを用意する
        BlockWorkData blockWorkData = base._blockWorkData[id];

        //	姿勢を設定
        blockWorkData.gameObjectTransform.position = _webframe.listNodePoint[id]; 
        blockWorkData.gameObjectTransform.localScale = _webframe.NodeBlockScale; 


        double tx = fixnodePoint.tx;
		double ty = fixnodePoint.ty;
		double tz = fixnodePoint.tz;
		double rx = fixnodePoint.rx;
		double ry = fixnodePoint.ry;
		double rz = fixnodePoint.rz;

		float x = 0f;
		float y = 0f;
		float z = 0f;

		// ------------------------------------
		// t系に1が入っている場合の描画
		// ------------------------------------
		if ((tx == 1 && ty == 0 && tz == 0) || (tx != 0 && tx != 1)) {
			x = 0f;
			y = 0f;
			z = 90f;
		}
		if ((tx == 0 && ty == 1 && tz == 0) || (ty != 0 && ty != 1)) {
			x = 0f;
			y = 90f;
			z = 0f;
		}
		if ((tx == 0 && ty == 0 && tz == 1) || (tz != 0 && tz != 1)) {
			x = -90f;
			y = 0f;
			z = 0f;
		}

		if (tx == 1 && ty == 1 && tz == 0) {
			x = 90f;
			y = 90f;
			z = 0f;
		}
		if (tx == 0 && ty == 1 && tz == 1) {
			x = 0f;
			y = 90f;
			z = 90f;
		}
		if (tx == 1 && ty == 0 && tz == 1) {
			x = 90f;
			y = 0f;
			z = 90f;
		}
		// ------------------------------------


		// ------------------------------------
		// r系に1が入っている場合の描画
		// ------------------------------------
		if ((rx == 1 && ry == 0 && rz == 0) || (rx != 0 && rx != 1)) {
			x = 90f;
			y = 0f;
			z = 0f;
		}
		if ((rx == 0 && ry == 1 && rz == 0) || (ry != 0 && ry != 1)) {
			x = 0f;
			y = 90f;
			z = 0f;
		}
		if ((rx == 0 && ry == 0 && rz == 1) || (rz != 0 && rz != 1)) {
			x = 0f;
			y = 0f;
			z = 90f;
		}

		if ((rx == 1 && ry == 1 && rz == 0) || ( (rx != 0 && rx != 1) && (ry != 0 && ry != 1) )) {
			x = 90f;
			y = 90f;
			z = 0f;
		}
		if ((rx == 0 && ry == 1 && rz == 1) || ( (ry != 0 && ry != 1) && (rz != 0 && rz != 1) )) {
			x = 0f;
			y = 90f;
			z = 90f;
		}
		if ((rx == 1 && ry == 0 && rz == 1) || ( (rx != 0 && rx != 1) && (rz != 0 && rz != 1) )) {
			x = 90f;
			y = 0f;
			z = 90f;
		}
		if ((rx == 1 && ry == 1 && rz == 1) || ( (rx != 0 && rx != 1) && (ry != 0 && ry != 1) && (rz != 0 && rz != 1) )) {
			x = 90f;
			y = 90f;
			z = 90f;
		}
		// ------------------------------------
		blockWorkData.gameObjectTransform.localRotation = Quaternion.Euler(x, y, z);

    }


    /// <summary> 接点を表示するためのサイズの計算をする </summary>
    public bool CalcFixNodeBlockScale( int search_fixnode=-1 )
	{
        Dictionary<int, FrameWeb.FixNodeData> ListFixNode = _webframe.ListFixNode[0];
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

		max_length = Mathf.Sqrt( max_length );
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

	/// <summary>
	/// 
	/// </summary>
	public void ChangeDispMode(DispType dispType) {
		if (_dispType == dispType)
		{
			return;
		}

		_dispType = dispType;
		SetBlockStatusAll();
	}

}
