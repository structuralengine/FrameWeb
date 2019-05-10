using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


/// <summary>
/// バネの表示を管理するクラス
/// </summary>
public class FixMemberDispManager : PartsDispManager {
	const float FIX_MEMBER_SCALE = 0.000001f;
	const float DISTANCE = 0.5f;	//部材からの距離
	const float PADDING = 1.0f;	//パーツの間隔

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
			Debug.Log ( "FixMemberDispManager _webframe == null" );
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

			if (_webframe.GetFixMemberUseList () == null) return;

			// 新しいオブジェクトを生成する
			foreach (int i in _webframe.GetFixMemberUseList().Keys) {
				blockWorkData = new BlockWorkData { gameObject = Instantiate ( _blockPrefab ) };
				base._blockWorkData.Add ( GetBlockID ( i ), blockWorkData );
			}

			// 新しいオブジェクトのプロパティを設定する
			foreach (int i in _webframe.GetFixMemberUseList ().Keys) {
				blockWorkData = base._blockWorkData[GetBlockID ( i )];
				InitBlock ( ref blockWorkData, i, GetBlockID ( i ) );
			}

		} catch (Exception e) {
			Debug.Log ( "FixMemberDispManager CreateNodes" + e.Message );
		}
	}

	/// <summary>
	/// パーツを変更する
	/// </summary>
	public override void ChengeParts () {
		if (_webframe == null) {
			Debug.Log ( "FixMemberDispManager _webframe == null" );
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

			if (_webframe.GetFixMemberUseList () == null) return;

			// 新しいオブジェクトを生成する
			foreach (int i in _webframe.GetFixMemberUseList ().Keys) {
				blockWorkData = new BlockWorkData { gameObject = Instantiate ( _blockPrefab ) };
				base._blockWorkData.Add ( GetBlockID ( i ), blockWorkData );
			}

			// 新しいオブジェクトのプロパティを設定する
			foreach (int i in _webframe.GetFixMemberUseList ().Keys) {
				blockWorkData = base._blockWorkData[GetBlockID ( i )];
				InitBlock ( ref blockWorkData, i, GetBlockID ( i ) );
			}

		} catch (Exception e) {
			Debug.Log ( "FixMemberDispManager CreateNodes" + e.Message );
		}
	}


  	/// <summary> ブロックのIDを取得 </summary>
	/// <param name="i"></param>
	private string GetBlockID (int i) {
		return "FixMember[" + i + "]";
	}
	/// <summary> データのIDを取得 </summary>
	/// <param name="id"></param>
	private int GetDataID (string id) {
		string s1 = id.Replace ( "FixMember[", "" );
		string s2 = s1.Replace ( "]", "" );
		return int.Parse ( s2 );
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

		// 対象のMember取得
		int myId = GetDataID ( id );
		if (_webframe.ListMemberData.ContainsKey(myId)) {
			// 対象のMember取得
			Transform member = GameObject.Find ( "Member[" + myId + "]/Root" ).transform;
			webframe.MemberData myMember = _webframe.ListMemberData[myId];
			Vector3 niPos = _webframe.listNodePoint[myMember.ni];
			Vector3 njPos = _webframe.listNodePoint[myMember.nj];
			Vector3 ijVector = njPos - niPos;

			BlockWorkData blockWorkData = base._blockWorkData[id];
			Transform part = blockWorkData.rootBlockTransform;

			// 自分のパラメータ取得
			webframe.FixMemberData fixMemberData = _webframe.GetFixMemberUseList ()[GetDataID ( id )];

			// 最初の場所指定
			SetMemberPart ( part, member, fixMemberData, niPos );
			float baseScale = part.localScale.y;

			// 何個作る？
			int count = (int)(ijVector.magnitude / (PADDING + baseScale) );
			Vector3 beforePos = niPos;
			for (int i = 1; i < count; i++) {
				Transform partChild = Instantiate ( part, blockWorkData.rootBlockTransform.parent );
				beforePos = niPos + ijVector.normalized * ((PADDING + baseScale) * i);
				SetMemberPart ( partChild, member, fixMemberData, beforePos );
			}

			// 最後に１個作る（直近と近すぎていた場合は作らない）
			Vector3 lastPos = njPos - ijVector.normalized * baseScale;
			if ((lastPos - beforePos).sqrMagnitude > 1.0f) {
				Transform partLast = Instantiate ( part, blockWorkData.rootBlockTransform.parent );
				SetMemberPart ( partLast, member, fixMemberData, lastPos );
			}
		}
	}

	/// <summary>
	/// バネの１パーツの位置と大きさを指定する
	/// </summary>
	/// <param name="part">１バネ分のTransform</param>
	/// <param name="member">対象MemberのTransform</param>
	/// <param name="fixMemberData">fixMemberData</param>
	/// <param name="pos">Member上の位置</param>
	private void SetMemberPart (Transform part, Transform member, webframe.FixMemberData fixMemberData, Vector3 pos) {
		// 位置
		pos += member.up * DISTANCE;
		part.position = pos;

		// 大きさを指定（最低値設定）
		Vector3 size = Vector3.one;
		size.x = Mathf.Clamp ( (float)fixMemberData.tx * FIX_MEMBER_SCALE, 0.5f, float.PositiveInfinity );
		size.y = Mathf.Clamp ( (float)fixMemberData.ty * FIX_MEMBER_SCALE, 0.5f, float.PositiveInfinity );
		size.z = Mathf.Clamp ( (float)fixMemberData.tz * FIX_MEMBER_SCALE, 0.5f, float.PositiveInfinity );
		part.localScale = size;

		// 倒す
		part.rotation = member.rotation;
		part.Rotate ( 0, -90.0f, -90.0f );
	}

  	/// <summary>JSに選択アイテムの変更を通知する </summary>
	public override void SendSelectChengeMessage (int i) {
		ExternalConnect.SendAngularSelectItemChenge ( i );
	}

	/// <summary> ブロックの色を変更 </summary>
	public override void ChengeForcuseBlock (int i) {
		base.ChengeForcuseBlock ( this.GetBlockID ( i ) );
	}
}
