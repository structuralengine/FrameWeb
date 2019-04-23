using UnityEngine;
using System.Collections;

// クラス名が被っているといけないので、namespaceで囲む
public class CameraController : MonoBehaviour
{
	enum MouseButtonDown
	{
		MBD_LEFT = 0,
		MBD_RIGHT,
		MBD_MIDDLE,
	};


	[SerializeField]
	GameObject		_focusObj;			// 注視点となるオブジェクト
	Transform		_focusTransform;
	Transform		_chacheTransform;
	Vector3			_oldPos;			// マウスの位置を保存する変数

  [SerializeField]
  RuntimeSceneGizmo.SceneGizmoRenderer gizmoRenderer;

  /// <summary>
  ///	注視点オブジェクトが未設定の場合、新規に生成する 
  /// </summary>
  /// <param name="name"></param>
  void setupFocusObject(string name)
	{
		_focusObj = new GameObject(name);
    _focusObj.AddComponent<RuntimeSceneGizmo.CameraGizmoListener>();
    _focusObj.AddComponent<RuntimeSceneGizmo.CameraMovement>();
		_focusTransform = _focusObj.transform;
		_focusTransform.position = Vector3.zero;

    gizmoRenderer.OnComponentClicked.AddListener((a) => 
      _focusObj.GetComponent<RuntimeSceneGizmo.CameraGizmoListener>().OnGizmoComponentClicked(a)
    );
  }



	/// <summary>
	///	マウス関係のイベント 
	/// </summary>
	void mouseEvent()
	{
		// マウスホイールの回転量を取得
		float delta = Input.GetAxis("Mouse ScrollWheel");
		// 回転量が0でなければホイールイベントを処理
		if( delta != 0.0f ) { 
			mouseWheelEvent(delta);
		}

		// マウスボタンが押されたタイミングで、マウスの位置を保存する
		if (Input.GetMouseButtonDown((int)MouseButtonDown.MBD_LEFT) ||
		Input.GetMouseButtonDown((int)MouseButtonDown.MBD_MIDDLE) ||
		Input.GetMouseButtonDown((int)MouseButtonDown.MBD_RIGHT))
			_oldPos = Input.mousePosition;

		// マウスドラッグイベント
		mouseDragEvent(Input.mousePosition);
	}



	/// <summary>
	///	マウスホイールイベント 
	/// </summary>
	/// <param name="delta"></param>
	void mouseWheelEvent(float delta)
	{
		// 注視点からカメラまでのベクトルを計算
		Vector3 focusToPosition = _chacheTransform.position - _focusTransform.position;

		// ホイールの回転量を元に上で求めたベクトルの長さを変える
		Vector3 post = focusToPosition * (1.0f + -delta);

		// 長さを変えたベクトルの長さが一定以上あれば、カメラの位置を変更する
		if( post.magnitude > 0.01f ) { 
			_chacheTransform.position = _focusTransform.position + post;
		}
	}


	/// <summary>
	///	マウスドラッグイベント関数 
	/// </summary>
	/// <param name="mousePos"></param>
	void mouseDragEvent(Vector3 mousePos)
	{
		// マウスの現在の位置と過去の位置から差分を求める
		Vector3 diff = mousePos - _oldPos;

		// 差分の長さが極小数より小さかったら、ドラッグしていないと判断する
		if( diff.magnitude < Vector3.kEpsilon ) { 
			return;
		}

		if (Input.GetMouseButton((int)MouseButtonDown.MBD_LEFT))
		{
			// マウス左ボタンをドラッグした場合(なにもしない)
		}
		else if (Input.GetMouseButton((int)MouseButtonDown.MBD_MIDDLE))
		{
			// マウス中ボタンをドラッグした場合(注視点の移動)
			diff.y *= -1;
			cameraTranslate(diff / 10.0f);

		}
		else if (Input.GetMouseButton((int)MouseButtonDown.MBD_RIGHT))
		{
			// マウス右ボタンをドラッグした場合(カメラの回転)
			cameraRotate(new Vector3(diff.y, diff.x, 0.0f));
		}

		// 現在のマウス位置を、次回のために保存する
		_oldPos = mousePos;
	}



	/// <summary>
	///	カメラを移動する関数 
	/// </summary>
	/// <param name="vec"></param>
	void cameraTranslate(Vector3 vec)
	{
		// カメラのローカル座標軸を元に注視点オブジェクトを移動する
		_focusTransform.Translate((_chacheTransform.right * -vec.x) + (_chacheTransform.up * vec.y));
	}



	/// <summary>
	///	カメラを回転する関数 
	/// </summary>
	/// <param name="eulerAngle"></param>
	public void cameraRotate(Vector3 eulerAngle)
	{
		Vector3 focusPos = _focusTransform.position;

		// 回転前のカメラの情報を保存する
		Vector3 preUpV, preAngle, prePos;
		preUpV = _chacheTransform.up;
		preAngle = _chacheTransform.localEulerAngles;
		prePos = _chacheTransform.position;

		// カメラの回転
		// 横方向の回転はグローバル座標系のY軸で回転する
		_chacheTransform.RotateAround(focusPos, Vector3.up, eulerAngle.y);
		// 縦方向の回転はカメラのローカル座標系のX軸で回転する
		_chacheTransform.RotateAround(focusPos, _chacheTransform.right, -eulerAngle.x);

		// カメラを注視点に向ける
		_chacheTransform.LookAt(focusPos);

		//	ジンバルロック対策
		//	カメラが真上や真下を向くとジンバルロックがおきる
		//	ジンバルロックがおきるとカメラがぐるぐる回ってしまうので、
		//	一度に90度以上回るような計算結果になった場合は回転しないようにする(計算を元に戻す)
		Vector3 up = _chacheTransform.up;
		if(Vector3.Angle(preUpV, up) > 90.0f){
			_chacheTransform.localEulerAngles = preAngle;
			_chacheTransform.position = prePos;
		}
	}


    //X軸の周りでカメラを90℃ずつ回転させる
    public void RotCamX()
    {
        var pos = Camera.main.transform.position;

        float distance = 0;
        float y = _focusTransform.position.y;           //注視点を取得
        float z = _focusTransform.position.z;
        if (pos.y == y && pos.z == z) distance = pos.x;
        else distance = Mathf.Sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);      //原点からの距離を計算
        if (pos.y - y > 0 && pos.z - z >= 0)             //YZ平面のどの象限に位置するかで場合分け
        {
            pos.y = y;
            pos.z = z + distance;
        }
        else if (pos.y - y >= 0 && pos.z - z < 0)
        {
            pos.y = y + distance;
            pos.z = z;
        }
        else if (pos.y - y <= 0 && pos.z - z > 0)
        {
            pos.y = y - distance;
            pos.z = z;
        }
        else if (pos.y - y < 0 && pos.z - z <= 0)
        {
            pos.y = y;
            pos.z = z - distance;
        }
        pos.x = 0;
        Camera.main.transform.position = pos;
        _chacheTransform.LookAt(_focusTransform.position);
    }

    //Y軸の周りでカメラを90℃ずつ回転させる
    public void RotCamY()
    {
        var pos = Camera.main.transform.position;

        float distance = 0;
        float z = _focusTransform.position.z;
        float x = _focusTransform.position.x;
        if (pos.z == z && pos.x == x) distance = pos.y;
        else distance = Mathf.Sqrt(pos.y * pos.y + pos.z * pos.z + pos.x * pos.x);
        if (pos.z - z > 0 && pos.x - x >= 0)
        {
            pos.z = z;
            pos.x = x + distance;
        }
        else if (pos.z - z >= 0 && pos.x - x < 0)
        {
            pos.z = z + distance;
            pos.x = x;
        }
        else if (pos.z - z <= 0 && pos.x - x > 0)
        {
            pos.z = z - distance;
            pos.x = x;
        }
        else if (pos.z - z < 0 && pos.x - x <= 0)
        {
            pos.z = z;
            pos.x = x - distance;
        }
        pos.y = 0;
        Camera.main.transform.position = pos;
        _chacheTransform.LookAt(_focusTransform.position);
    }

    //Z軸の周りでカメラを90℃ずつ回転させる
    public void RotCamZ()
    {
        var pos = Camera.main.transform.position;

        float distance = 0;
        float x = _focusTransform.position.x;
        float y = _focusTransform.position.y;
        if (pos.x == x && pos.y == y) distance = pos.x;
        else distance = Mathf.Sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
        if (pos.x - x > 0 && pos.y - y >= 0)
        {
            pos.x = x;
            pos.y = y + distance;
        }
        else if (pos.x - x >= 0 && pos.y - y < 0)
        {
            pos.x = x + distance;
            pos.y = y;
        }
        else if (pos.x - x <= 0 && pos.y - y > 0)
        {
            pos.x = x - distance;
            pos.y = y;
        }
        else if (pos.x - x < 0 && pos.y - y <= 0)
        {
            pos.x = x;
            pos.y = y - distance;
        }
        pos.z = 0;
        Camera.main.transform.position = pos;
        _chacheTransform.LookAt(_focusTransform.position);
    }


    /// <summary>
    /// 
    /// </summary>
    void Start()
	{
		_chacheTransform = this.transform;

		// 注視点オブジェクトの有無を確認
		if( _focusObj == null ) { 
			setupFocusObject("CameraFocusObject");
		}
		else {
			_focusTransform = _focusObj.transform;
		}

		// 注視点オブジェクトをカメラの親にする
		_chacheTransform.parent = _focusTransform;

		// カメラの方向ベクトル(ローカルのZ方向)を注視点オブジェクトに向ける
//		_chacheTransform.LookAt(_focusTransform.position);
	}



	/// <summary>
	/// 
	/// </summary>
	void Update()
	{
		mouseEvent();
	}
}

