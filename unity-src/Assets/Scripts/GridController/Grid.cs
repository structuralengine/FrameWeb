using UnityEngine;
using System.Collections;


[RequireComponent(typeof(MeshFilter),typeof(MeshRenderer))]
public class Grid : MonoBehaviour
{
	public enum GridFace
	{
		XY,
		ZX,
		YZ,
	};

	[SerializeField]
	float		_gridSize = 1f;

	[SerializeField]
	int			_gridCount = 8;

	[SerializeField]
	Color		_gridColor = Color.gray;

	[SerializeField]
	GridFace	_gridFace = GridFace.XY;

	//[SerializeField]
	//bool		_enableCenterGrid = true;

	//[SerializeField]
	//Color		_centerGridColor = Color.white;
	
	Mesh			_mesh;
	MeshRenderer	_meshRenderer;


	/// <summary>
	///	グリッドの再構築
	/// </summary>
	void	ReGrid()
	{
		if( _mesh == null ) {
			return;
		}
		if( _meshRenderer == null ) {
			return;
		}

		_meshRenderer.sharedMaterial = new Material(Shader.Find("Sprites/Default"));
		//_meshRenderer.sharedMaterial = new Material(Shader.Find("GUI/Text Shader"));

		//	数値補正
		if( _gridSize < 0 ){
			_gridSize=0.000001f;
		}
		if(_gridCount < 0 ){
			_gridCount=1;
		}
		_mesh.Clear();

		int			drawSize;
		float		width;
		int			resolution;
		float		diff;
		Vector3[]	vertices;
		Vector2[]	uvs;
		int[]		lines;
		Color[]		colors;

		drawSize = _gridCount * 2;
		width = _gridSize * drawSize / 4.0f;
		Vector2 startPosition = new Vector2 (-width, -width);
		Vector2 endPosition = new Vector2 (width, width);
		diff = width / drawSize;
		resolution = (drawSize + 2) * 2;
		//最期の２辺を追加している

		vertices = new Vector3[resolution];
		uvs = new Vector2[resolution];
		lines = new int[resolution];
		colors = new Color[resolution];

		for (int i = 0; i < vertices.Length; i += 4) {
			vertices [i] = new Vector3 (startPosition.x + (diff * (float)i), startPosition.y, 0);
			vertices [i + 1] = new Vector3 (startPosition.x + (diff * (float)i), endPosition.y, 0);
			vertices [i + 2] = new Vector3 (startPosition.x, endPosition.y - (diff * (float)i), 0);
			vertices [i + 3] = new Vector3 (endPosition.x, endPosition.y - (diff * (float)i), 0);
		}

		for (int i = 0; i < resolution; i++) {
			uvs [i] = Vector2.zero;
			lines [i] = i;
			colors [i] = _gridColor;
		}

		Vector3 rotDirection;
		switch (_gridFace) {
			case GridFace.XY:
				rotDirection = Vector3.forward;
				break;
			case GridFace.ZX:
				rotDirection = Vector3.up;
				break;
			case GridFace.YZ:
				rotDirection = Vector3.right;
				break;
			default:
				rotDirection = Vector3.forward;
				break;
		}

		_mesh.vertices = RotationVertices(vertices,rotDirection);
		_mesh.uv = uvs;
		_mesh.colors = colors;
		_mesh.SetIndices (lines, MeshTopology.Lines, 0);
	}



	/// <summary>
	/// 頂点配列データーをすべて指定の方向へ回転移動させる
	/// </summary>
	/// <param name="vertices"></param>
	/// <param name="rotDirection"></param>
	/// <returns></returns>
	Vector3[] RotationVertices(Vector3[] vertices,Vector3 rotDirection)
	{
		Vector3[] ret= new Vector3[vertices.Length];
		for (int i = 0; i < vertices.Length; i++) {
			ret[i] = Quaternion.LookRotation(rotDirection) * vertices[i];
		}
		return ret;
	}
   


	/// <summary>
	/// 
	/// </summary>
	void	Start()
	{
		GetComponent<MeshFilter>().mesh = _mesh = new Mesh();
		_meshRenderer = GetComponent<MeshRenderer>();
		ReGrid();
	}



	/// <summary>
	/// 
	/// </summary>
	void Update()
	{
	}



#if UNITY_EDITOR
	void	OnValidate()
	{
		ReGrid();
	}
#endif
}
