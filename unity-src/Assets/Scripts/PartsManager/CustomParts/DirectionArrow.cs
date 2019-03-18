using UnityEngine;
using System.Collections;

public class DirectionArrow : MonoBehaviour
{
	[SerializeField]
	Material	_meshMaterial = null;

	GameObject		_meshObject;
	Transform		_meshTransform;
    MeshFilter		_meshFileter;
    MeshRenderer	_meshRender;


	// Use this for initialization
	void	Awake()
	{
		_meshObject = new GameObject("Arrow");
		_meshTransform = _meshObject.transform;
		_meshTransform.parent = this.gameObject.transform;

        _meshFileter   = _meshObject.AddComponent<MeshFilter>();
		_meshRender    = _meshObject.AddComponent<MeshRenderer>();

		Mesh	mesh = new Mesh();

		Vector3[]	vertices = new Vector3[] {
			new Vector3(0.0f, 0.0f, 0.0f),
			new Vector3(1.0f, 0.0f, 0.0f),
			new Vector3(0.0f, 0.0f, 0.0f),
			new Vector3(0.0f, 1.0f, 0.0f),
			new Vector3(0.0f, 0.0f, 0.0f),
			new Vector3(0.0f, 0.0f, 1.0f),
		};
		int[]	indexes = new int[] {
			0, 1, 2, 3, 4, 5,
		};
		Color[]	colors = new Color[]{
			Color.red, Color.red, Color.green, Color.green, Color.blue, Color.blue,
		};

		mesh.vertices = vertices;
		mesh.colors = colors;
		mesh.SetIndices( indexes, MeshTopology.Lines, 0 );


		//	その他の定義
		mesh.name = "ArrowMesh";
		_meshFileter.mesh = mesh;
		_meshRender.sharedMaterial = _meshMaterial;
	}



	/// <summary>
	/// 矢印の姿勢を設定する
	/// </summary>
	/// <param name="center"></param>
	/// <param name="degRotation"></param>
	/// <param name="size"></param>
	public	void SetArrowDirection( Vector3 center, Quaternion	rotate, Vector3 scale )
	{
		_meshTransform.position = center;
		_meshTransform.rotation = rotate;
		_meshTransform.localScale = Vector3.one;
	}


	/// <summary>
	/// 
	/// </summary>
	/// <param name="b"></param>
	public void EnableRenderer( bool b )
	{
		_meshRender.enabled = b;
	}
}
