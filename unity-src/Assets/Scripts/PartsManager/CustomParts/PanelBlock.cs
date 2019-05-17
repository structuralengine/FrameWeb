using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;




public class PanelBlock : MonoBehaviour
{
	[SerializeField]
	Material	_meshMaterial = null;

	GameObject		_meshObject;
    MeshFilter		_meshFileter;
    MeshRenderer	_meshRender;
	MeshCollider	_meshCollider;



	// Use this for initialization
	void	Awake()
	{
		_meshObject = new GameObject("Panel");
		_meshObject.transform.parent = gameObject.transform.Find("Root");

        _meshFileter   = _meshObject.AddComponent<MeshFilter>();
		_meshRender    = _meshObject.AddComponent<MeshRenderer>();
		_meshCollider  = _meshObject.AddComponent<MeshCollider>();


		Mesh	mesh = new Mesh();

		//----	頂点定義  ---//
		/*
		//	Position
		mesh.vertices = new Vector3[] {
			new Vector3(-0.5f, -0.5f, 0.0f),
			new Vector3( 0.5f,  0.5f, 0.0f),
			new Vector3( 0.5f, -0.5f, 0.0f),
			new Vector3(-0.5f,  0.5f, 0.0f),

			new Vector3(-0.5f, -0.5f, 0.0f),
			new Vector3( 0.5f, -0.5f, 0.0f),
			new Vector3( 0.5f,  0.5f, 0.0f),
			new Vector3(-0.5f,  0.5f, 0.0f),
		};

		
		//	Normal
		mesh.normals = new Vector3[] {
			new Vector3(0.0f, 0.0f, -1.0f),
			new Vector3(0.0f, 0.0f, -1.0f),
			new Vector3(0.0f, 0.0f, -1.0f),
			new Vector3(0.0f, 0.0f, -1.0f),

			new Vector3(0.0f, 0.0f,  1.0f),
			new Vector3(0.0f, 0.0f,  1.0f),
			new Vector3(0.0f, 0.0f,  1.0f),
			new Vector3(0.0f, 0.0f,  1.0f),
		};

		//	UV
		mesh.uv = new Vector2[] {
			new Vector2(0.0f, 0.0f),
			new Vector2(1.0f, 1.0f),
			new Vector2(1.0f, 0.0f),
			new Vector2(0.0f, 1.0f),

			new Vector2(0.0f, 0.0f),
			new Vector2(1.0f, 1.0f),
			new Vector2(1.0f, 0.0f),
			new Vector2(0.0f, 1.0f),
		};

		//	Index
		mesh.triangles = new int[] {
			0, 1, 2,
			0, 2, 3,

			0+4, 2+4, 1+4,
			0+4, 3+4, 2+4,
		};
		*/

		//	その他の定義
		mesh.name = "PanelMesh";
		mesh.RecalculateBounds();
		mesh.RecalculateNormals();

		_meshFileter.mesh = mesh;
		_meshRender.sharedMaterial = _meshMaterial;
		_meshCollider.sharedMesh = mesh;
    }



	/// <summary>
	/// 
	/// </summary>
	/// <param name="vec0"></param>
	/// <param name="vec1"></param>
	/// <param name="vec2"></param>
	/// <param name="vec3"></param>
	public	void	SetPanelPointPosition( Vector3[] vec )
	{
		if( vec.Length < 2 ) {
			return;
		}
		
		Mesh	mesh = _meshFileter.mesh;

		int					i;
		List<Vector3>		listVec = new List<Vector3>();

		//	頂点位置
		for( i=0; i<vec.Length-2; i++ ) {
			listVec.Add( vec[0] );
			listVec.Add( vec[i+1] );
			listVec.Add( vec[i+2] );

			listVec.Add( vec[0] );
			listVec.Add( vec[i+2] );
			listVec.Add( vec[i+1] );
		}

		if( mesh.triangles.Length == listVec.Count ) {		//	数が一緒ならそのまま設定して終わり
			mesh.vertices = listVec.ToArray();
		}
		else { 
			int[]	triangles = new int[listVec.Count];

			//	Index
			for( i=0; i<triangles.Length; i++ ) {
				triangles[i] = i;
			}

			//	数が減るときは先にindexを減らす
			if( mesh.triangles.Length > listVec.Count ) {
				mesh.triangles = triangles;
				mesh.vertices = listVec.ToArray();
			}
			//	数が増えるときは先に頂点を増やす
			else {
				mesh.vertices = listVec.ToArray();
				mesh.triangles = triangles;
			}
		}
		/*
		mesh.vertices = new Vector3[] {
			vec[0],
			vec[1],
			vec[2],

			vec[0],
			vec[2],
			vec[1],

			vec[0],
			vec[2],
			vec[3],

			vec[0],
			vec[3],
			vec[2],
		};

		//	Index
		mesh.triangles = new int[] {
			0, 1, 2,
			3, 4, 5,
			6, 7, 8,
			9, 10, 11,
		};
		*/
		mesh.RecalculateBounds();
		mesh.RecalculateNormals();
	}



	// 三角ポリゴン同士の衝突関連メソッド
	float cross2D( Vector2 u, Vector2 v)
	{
		return u.y * v.x - u.x * v.y;
	}

	int pointInTriangle2D( Vector2 p, Vector2 a, Vector2 b, Vector2 c )
	{
		float pab = cross2D(p - a, b - a);
		float pbc = cross2D(p - b, c - b);
		if (pab * pbc < 0)
			return 0;
		float pca = cross2D(p - c, a - c);
		if (pab * pca < 0)
			return 0;
		return 1;
	}


	float Signed2DTriArea( Vector2 a, Vector2 b, Vector2 c)
	{
		return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	}

	int test2DSegmentSegment( Vector2 a, Vector2 b, Vector2 c, Vector2 d, out float t, out Vector2 p )
	{
		float a1 = Signed2DTriArea(a, b, d);
		float a2 = Signed2DTriArea(a, b, c);
		if (a1 * a2 < 0.0f) {
			float a3 = Signed2DTriArea(c, d, a);
			float a4 = a3 + a2 - a1;
			if (a3 * a4 < 0.0f) {
				t = a3 / (a3 - a4);
				p = a + t * (b - a);
				return 1;
			}
		}
		t = 0.0f;
		p = Vector2.zero;

		return 0;
	}


	///////////////////////////////////////////
	// 三角ポリゴンと三角ポリゴンの衝突判定
	//
	//  t1[3] : 三角ポリゴン1の頂点座標
	//  t2[3] : 三角ポリゴン2の頂点座標
	//  戻り値: 衝突ならtrue
	struct TriangleHash
	{
		public int i1, i0, i2;

		public TriangleHash( int _i0, int _i1, int _i2 )
		{
			i0 = _i0;
			i1 = _i1;
			i2 = _i2;
		}
	} 

	bool intersectTriangleTriangle( Vector3[] t1, Vector3[] t2 )
	{
		// t1を含む平面とt0の3頂点の距離の符号が同じならば衝突していない
		Vector3 N1, N2;
		N1 = Vector3.Cross( (t1[1]-t1[0]), (t1[2]-t1[0]) );
		N1 = Vector3.Normalize( N1 );
		N2 = Vector3.Cross( (t2[1]-t2[0]), (t2[2]-t2[0]));
		N2 = Vector3.Normalize( N2 );


		float dot1 = Vector3.Dot( -N1, t1[0] );
		float dot2 = Vector3.Dot( -N2, t2[0] );
		float[] dist1 = new float[3];
		float[] dist2 = new float[3];

		int sign1 = 0, sign2 = 0;
		int	i, j;

		for ( i = 0; i < 3; i++) {
			dist1[i] = Vector3.Dot( N2, t1[i] ) + dot2;
			if (dist1[i] > 0) {
				sign1 |= (1 << i);
			}
			dist2[i] = Vector3.Dot( N1, t2[i]) + dot1;
			if (dist2[i] > 0) {
				sign2 |= (1 << i);
			}
		}
		if (sign1 == 0 || sign1 == 7 || sign2 == 0 || sign2 == 7) {
			// 全dist1 == 0の場合は同一平面衝突の可能性がある
			if (Mathf.Abs(dist1[0]) >= 0.00001f || Mathf.Abs(dist1[1]) >= 0.00001f || Mathf.Abs(dist1[2]) >= 0.00001f) {
				return false;
			}
			// 三角ポリゴンの頂点を軸並行平面へ投影
			Vector2[]	t1_2D = new Vector2[3];
			Vector2[]	t2_2D = new Vector2[3];

			if (Mathf.Abs(N1.x) >= Mathf.Abs(N1.y) && Mathf.Abs(N1.x) >= Mathf.Abs(N1.z)) {
				// YZ平面
				for ( i = 0; i < 3; i++) {
					t1_2D[i].x = t1[i].y; t1_2D[i].y = t1[i].z;
					t2_2D[i].x = t2[i].y; t2_2D[i].y = t2[i].z;
				}
			} else if (Mathf.Abs(N1.y) >= Mathf.Abs(N1.z)) {
				// XZ平面
				for ( i = 0; i < 3; i++) {
					t1_2D[i].x = t1[i].x; t1_2D[i].y = t1[i].z;
					t2_2D[i].x = t2[i].x; t2_2D[i].y = t2[i].z;
				}
			} else {
				// XY平面
				for ( i = 0; i < 3; i++) {
					t1_2D[i].x = t1[i].x; t1_2D[i].y = t1[i].y;
					t2_2D[i].x = t2[i].x; t2_2D[i].y = t2[i].y;
				}
			}
			// 線分間衝突
			float t;
			Vector2 p;
			for ( i = 0; i < 3; i++) {
				for ( j = 0; j < 3; j++) {
					if (test2DSegmentSegment(t1_2D[i], t1_2D[(i+1)%3], t2_2D[j], t2_2D[(j+1)%3], out t, out p) > 0)
						return true;
				}
			}

			// 点含有
			for ( i = 0; i < 3; i++) {
				if (pointInTriangle2D(t1_2D[i], t2_2D[0], t2_2D[1], t2_2D[2]) > 0 )
					return true;
			}
			for ( i = 0; i < 3; i++) {
				if (pointInTriangle2D(t2_2D[i], t1_2D[0], t1_2D[1], t1_2D[2]) > 0 )
					return true;
			}

			// 残念・・・
			return false;
		}

		/////////////////////////////////
		// 同一平面には無い
		////

		// 頂点の片側を合わせるためのハッシュテーブル
		TriangleHash[] hash = new TriangleHash[7]{
			new TriangleHash(0, 0, 0),
			new TriangleHash(0, 1, 2), // idx0
			new TriangleHash(1, 0, 2), // idx1
			new TriangleHash(2, 0, 1), // idx2
			new TriangleHash(2, 0, 1), // idx2
			new TriangleHash(1, 0, 2), // idx1
			new TriangleHash(0, 1, 2), // idx0
		};

		// 2三角形の共通線Lで交わっているか？
		Vector3 D;

		D = Vector3.Cross( N1, N2 );
		D = Vector3.Normalize( D );
		{
			float[] p1 = new float[3]{
				Vector3.Dot( D, t1[hash[sign1].i0]),
				Vector3.Dot( D, t1[hash[sign1].i1]),
				Vector3.Dot( D, t1[hash[sign1].i2]),
			};
			float[] p2 = new float[3]{
				Vector3.Dot( D, t2[hash[sign2].i0]),
				Vector3.Dot( D, t2[hash[sign2].i1]),
				Vector3.Dot( D, t2[hash[sign2].i2]),
			};
			float[] d1 = new float[3]{
				dist1[hash[sign1].i0],
				dist1[hash[sign1].i1],
				dist1[hash[sign1].i2],
			};
			float[] d2 = new float[3]{
				dist2[hash[sign2].i0],
				dist2[hash[sign2].i1],
				dist2[hash[sign2].i2],
			};

			float t1_1 = p1[0] + (p1[1] - p1[0]) * d1[0] / (d1[0] - d1[1]);
			float t1_2 = p1[2] + (p1[1] - p1[2]) * d1[2] / (d1[2] - d1[1]);
			float t2_1 = p2[0] + (p2[1] - p2[0]) * d2[0] / (d2[0] - d2[1]);
			float t2_2 = p2[2] + (p2[1] - p2[2]) * d2[2] / (d2[2] - d2[1]);

			// t1_1～t1_2の間にある？
			if (t1_1 < t1_2) {
				if (t2_1 < t2_2) {
					if (t2_2 < t1_1 || t1_2 < t2_1)
						return false;
				} else {
					if (t2_1 < t1_1 || t1_2 < t2_2)
						return false;
				}
			} else {
				if (t2_1 < t2_2) {
					if (t2_2 < t1_2 || t1_1 < t2_1)
						return false;
				} else {
					if (t2_1 < t1_2 || t1_1 < t2_2)
						return false;
				}
			}
		}
		return true;
	}

}
