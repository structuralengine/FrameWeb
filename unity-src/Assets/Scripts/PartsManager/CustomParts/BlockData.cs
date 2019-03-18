using UnityEngine;
using System.Collections;


/// <summary>
/// ブロックの情報を定義
/// </summary>
public class BlockData : MonoBehaviour
{
	[SerializeField]
	private	int		_id;
	public		int id { set { _id = value; } get { return _id;} }
}
