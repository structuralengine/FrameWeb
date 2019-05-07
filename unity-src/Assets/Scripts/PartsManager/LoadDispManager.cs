using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// 荷重（ノード）の表示を管理するクラス
/// </summary>
public class LoadDispManager : PartsDispManager {
	const float TRIANGLE_HEIGHT = 0.4f;	//矢印の三角形部分の高さ。この長さ分、矢印の棒部分を短くする

  	/// <summary>ブロックの初期値を設定する </summary>
	/// <param name="blockWorkData"></param>
	/// <param name="data_id"> データID </param>
	private void InitBlock (ref BlockWorkData blockWorkData, int data_id, string block_id) {
		blockWorkData.gameObjectTransform = blockWorkData.gameObject.transform;
		blockWorkData.rootBlockTransform = blockWorkData.gameObjectTransform.Find ( "Root" );
		blockWorkData.blockData = blockWorkData.gameObject.GetComponentInChildren<BlockData> ();
		blockWorkData.blockData.id = data_id;
		blockWorkData.directionArrow = blockWorkData.gameObject.GetComponentInChildren<DirectionArrow> ();
		blockWorkData.renderer = blockWorkData.gameObject.GetComponentInChildren<Renderer> ();
		if (blockWorkData.renderer == null)
			return;

		blockWorkData.renderer.sharedMaterial = Instantiate ( blockWorkData.renderer.sharedMaterial );
		blockWorkData.materialPropertyBlock = new MaterialPropertyBlock ();
		blockWorkData.materialPropertyBlock.SetColor ( "_Color", Color.white );
		blockWorkData.renderer.SetPropertyBlock ( blockWorkData.materialPropertyBlock );

		blockWorkData.gameObject.name = block_id;
		blockWorkData.gameObjectTransform.parent = this.gameObject.transform;
		blockWorkData.gameObject.SetActive ( false );

		//	メシュの取得
		MeshFilter meshFileter;
		meshFileter = blockWorkData.gameObject.GetComponentInChildren<MeshFilter> ();
		if (meshFileter != null) {
			blockWorkData.mesh = meshFileter.mesh;
		}

	}

  	/// <summary>
	/// パーツを作成する
	/// </summary>
	public override void CreateParts () {
		if (_webframe == null) {
			Debug.Log ( "LoadDispManager _webframe == null" );
			return;
		}

		try {
			BlockWorkData blockWorkData;

			// 前のオブジェクトを消す
			foreach (string id in base._blockWorkData.Keys) {
				try {
					Destroy ( base._blockWorkData[id].renderer.sharedMaterial );
					Destroy ( base._blockWorkData[id].gameObject );
				} catch { }
			}
			base._blockWorkData.Clear ();

			// 新しいオブジェクトを生成する
			foreach (KeyValuePair<int, webframe.LoadData> item in _webframe.ListLoadData) {
				for (int i = 0; i < item.Value.load_node.Count; i++) {
					blockWorkData = new BlockWorkData { gameObject = Instantiate ( _blockPrefab ) };
					base._blockWorkData.Add ( GetBlockID ( i, true ), blockWorkData );
				}
			}

			// 新しいオブジェクトのプロパティを設定する
			int objIndex = 0;
			foreach (webframe.LoadNodeData i in _webframe.GetLoadUseData ().load_node) {
				blockWorkData = base._blockWorkData[GetBlockID ( objIndex, true )];
				InitBlock ( ref blockWorkData, objIndex, GetBlockID ( objIndex, true ) );
				// 座標変更
				SetBlockStatus ( GetBlockID ( objIndex, true ) );

				objIndex++;
			}

		} catch (Exception e) {
			Debug.Log ( "LoadDispManager CreateNodes" + e.Message );
		}
	}

	/// <summary>
	/// パーツを変更する
	/// </summary>
	public override void ChengeParts () {
		if (_webframe == null) {
			Debug.Log ( "LoadDispManager _webframe == null" );
			return;
		}

		try {
			BlockWorkData blockWorkData;

      		// データに無いブロックは消す
			List<string> DeleteKeys = new List<string> ();
			foreach (string id in base._blockWorkData.Keys) {
				int i = GetDataID ( id );
				if (!_webframe.listNodePoint.ContainsKey ( i )) {
					try {
						Destroy ( base._blockWorkData[id].renderer.sharedMaterial );
						Destroy ( base._blockWorkData[id].gameObject );
					} catch { } finally {
						DeleteKeys.Add ( id );
					}
				}
			}
			foreach (string id in DeleteKeys) {
				base._blockWorkData.Remove ( id );
			}

			// 前のオブジェクトを消す
			foreach (string id in base._blockWorkData.Keys) {
				try {
					Destroy ( base._blockWorkData[id].renderer.sharedMaterial );
					Destroy ( base._blockWorkData[id].gameObject );
				} catch { }
			}
			base._blockWorkData.Clear ();


			// 新しいオブジェクトを生成する
			foreach (KeyValuePair<int, webframe.LoadData> item in _webframe.ListLoadData) {
				for (int i = 0; i < item.Value.load_node.Count; i++) {
					blockWorkData = new BlockWorkData { gameObject = Instantiate ( _blockPrefab ) };
					base._blockWorkData.Add ( GetBlockID ( i, true ), blockWorkData );
				}
			}

			// 新しいオブジェクトのプロパティを設定する
			int objIndex = 0;
			foreach (webframe.LoadNodeData i in _webframe.GetLoadUseData ().load_node) {
				blockWorkData = base._blockWorkData[GetBlockID ( objIndex, true )];
				InitBlock ( ref blockWorkData, objIndex, GetBlockID ( objIndex, true ) );
				// 座標変更
				SetBlockStatus ( GetBlockID ( objIndex, true ) );

				objIndex++;
			}

		} catch (Exception e) {
			Debug.Log ( "LoadDispManager CreateNodes" + e.Message );
		}
	}


  	/// <summary> ブロックのIDを取得 </summary>
	/// <param name="i"></param>
	private string GetBlockID (int i, bool isNode) {
		return "Load" +((isNode) ? "Node" : "Member" ) + "["+i + "]";
	}
	/// <summary> データのIDを取得 </summary>
	/// <param name="id"></param>
	private int GetDataID (string id) {
		string s1 = id.Replace ( "LoadNode[", "" );
		s1 = s1.Replace ( "LoadMember[", "" );
		s1 = s1.Replace ( "]", "" );
		return int.Parse ( s1 );
	}

	/// <summary> 荷重のNodeかMemberか判定 </summary>
	/// <param name="id"></param>
	private bool IsNode (string id) {
		return id.Contains ( "LoadNode" );
	}

 	/// <summary> ブロックのステータスを変更 </summary>
	public override void SetBlockStatus (string id) {
		if (!base._blockWorkData.ContainsKey ( id ))
			return;
		

		PartsDispStatus partsDispStatus;
		partsDispStatus.id = id;
		partsDispStatus.enable = true;

		if (base.SetBlockStatusCommon ( partsDispStatus ) == false) {
			return;
		}

		// 対象オブジェクトと何番目かを取得する
		int blockNum = 0;
		BlockWorkData blockWorkData = null;
		foreach (var item in base._blockWorkData) {
			if (item.Key == id) {
				blockWorkData = item.Value;
				break;
			}
			blockNum++;
		}

		// NodeとMemberで分岐
		if (IsNode(id)) {
			SetNode ( blockNum, blockWorkData );
		} else {
			
		}
	}

	/// <summary>
	/// 荷重Nodeのステータス変更
	/// </summary>
	/// <param name="id">対象オブジェクトのID</param>
	/// <param name="blockWorkData">対象オブジェクトのBlockWorkData</param>
	private void SetNode (int id, BlockWorkData blockWorkData) {
		// パラメータ取得
		webframe.LoadNodeData loadNodeData = _webframe.GetLoadUseData ().load_node[id];

		// 位置指定（どのNodeに付くか）
		Vector3 pos = _webframe.listNodePoint[loadNodeData.n];
		blockWorkData.gameObjectTransform.position = pos;

		Vector3 target = new Vector3 ( (float)loadNodeData.tx, (float)loadNodeData.ty, (float)loadNodeData.tz );

		// 矢印と円どっちか
		if (target.sqrMagnitude > 0.0f) {
			// 矢印の場合
			// 向き指定
			blockWorkData.gameObjectTransform.LookAt ( pos + target );

			// 大きさ指定：棒オブジェクトのみリサイズする。矢印の頭部分があるので、それを引いた分の大きさを計算する。
			try {
				blockWorkData.gameObjectTransform.Find ( "Root/Arrow" ).transform.localScale = new Vector3 ( 1, 1, target.magnitude - TRIANGLE_HEIGHT );
				blockWorkData.gameObjectTransform.Find ( "Root/Circle" ).gameObject.SetActive ( false );
			} catch (Exception ex) {
				Debug.LogError ( ex );
			}
		} else {
			// 円の場合
			target = new Vector3 ( (float)loadNodeData.rx, (float)loadNodeData.ry, (float)loadNodeData.rz );
			// 向き指定
			blockWorkData.gameObjectTransform.Rotate ( target );

			// 表示オブジェクト指定
			try {
				blockWorkData.gameObjectTransform.Find ( "Root/Arrow" ).gameObject.SetActive ( false );
				blockWorkData.gameObjectTransform.Find ( "Root/Triangle" ).gameObject.SetActive ( false );
			} catch (Exception ex) {
				Debug.LogError ( ex );
			}
		}
	}


  	/// <summary>JSに選択アイテムの変更を通知する </summary>
	public override void SendSelectChengeMessage (int i) {
		ExternalConnect.SendAngularSelectItemChenge ( i );
	}

	/// <summary> ブロックの色を変更 </summary>
	public override void ChengeForcuseBlock (int i) {
		Debug.LogWarning ( i );
		Debug.LogWarning ( base._blockWorkData[i.ToString()].gameObject.name );
		base.ChengeForcuseBlock ("a" );
	}
}
