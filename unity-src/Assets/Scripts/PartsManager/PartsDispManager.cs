using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;


public class PartsDispManager : MonoBehaviour
{
    public struct PartsDispStatus
    {
        public string id;
        public bool enable;
    }


    protected static readonly Color s_selectColor = new Color(1.0f, 0.5f, 1.0f);
    protected static readonly Color s_noSelectColor = new Color(1.0f, 1.0f, 1.0f);
    protected static readonly Color s_lineTypeBlockColor = Color.black;

    protected FrameDataService _webframe = null;
    protected MainFrameManager _mainFrameManager = null;


    /// <summary>
    /// 
    /// </summary>
    protected class BlockWorkData
    {
        public GameObject gameObject;
        public Transform gameObjectTransform;
        public Transform rootBlockTransform;
        public Renderer renderer;
        public BlockData blockData;
        public DirectionArrow directionArrow;
        public MaterialPropertyBlock materialPropertyBlock;
        public Mesh mesh;
    }

    [SerializeField]
    public GameObject[] _blockPrefab = null;

    protected Dictionary<string, BlockWorkData> _blockWorkData = new Dictionary<string, BlockWorkData>();

    /// <summary>
    /// 
    /// </summary>
    /// <param name="statusBase"></param>
    /// <returns></returns>
    protected bool SetBlockStatusCommon(PartsDispStatus partsDispStatus)
    {
        if (_blockWorkData.ContainsKey(partsDispStatus.id) == false)
        {
            return false;
        }

        BlockWorkData blockWorkData = _blockWorkData[partsDispStatus.id];

        //	無効な場合
        if (partsDispStatus.enable == false)
        {
            if (blockWorkData.gameObject != null)
            {
                if (blockWorkData.gameObject.activeSelf)
                {
                    blockWorkData.gameObject.SetActive(false);
                }
            }
            return false;
        }


        //	有効な場合
        if (blockWorkData.gameObject == null)
        {
            return false;
        }

        if (!blockWorkData.gameObject.activeSelf)
        {
            blockWorkData.gameObject.SetActive(true);
        }

        return true;
    }

    protected void InitBlock(ref BlockWorkData blockWorkData, int data_id, string block_id)
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
    /// パーツの作成の仮想関数
    /// </summary>
    public virtual void CreateParts()
    {
    }



    /// <summary>
    /// 表示ブロックの設定の仮想関数
    /// </summary>
    public virtual void SetBlockStatus(string id)
    {
    }


    /// <summary> 表示ブロックの設定 </summary>
    public virtual void SetBlockStatusAll()
    {
        foreach (string id in _blockWorkData.Keys)
        {
            SetBlockStatus(id);
        }
    }


    /// <summary>ブロックの色を設定する </summary>
    /// <param name="id">ブロックのID</param>
    /// <param name="color">色</param>
    public void SetPartsColor(string id, Color color)
    {
        BlockWorkData blockWorkData = _blockWorkData[id];

        blockWorkData.materialPropertyBlock.SetColor("_Color", color);
        blockWorkData.renderer.SetPropertyBlock(blockWorkData.materialPropertyBlock);
    }

    /// <summary>JSに選択アイテムの変更を通知する </summary>
    public virtual void SendSelectChengeMessage(int i)
    {

    }

    /// <summary> マウスの入力制御 </summary>
    public virtual void InputMouse()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit = new RaycastHit();

            if (Physics.Raycast(ray, out hit))
            {
                GameObject obj = hit.collider.gameObject;

                //	ブロックが選択された
                {
                    BlockData blockData;
                    blockData = obj.GetComponentInParent<BlockData>();
                    if (blockData != null)
                    {
                        ChengeForcuseBlock(blockData.id);
                        SendSelectChengeMessage(blockData.id);
                    }
                }
            }
        }
    }


    /// <summary> ブロックの色を変更の仮想関数 </summary>
    public virtual void ChengeForcuseBlock(int i)
    {

    }

    /// <summary> ブロックの色を変更 </summary>
    /// <param name="id"></param>
    public void ChengeForcuseBlock(string id)
    {
        foreach (string i in _blockWorkData.Keys)
        {
            if (i == id)
                SetPartsColor(i, s_selectColor);
            else
                SetPartsColor(i, s_noSelectColor);
        }
    }

    // Use this for initialization
    void Awake()
    {
        try
        {
            _webframe = FrameDataService.Instance;
            _mainFrameManager = FindObjectOfType<MainFrameManager>();
        }
        catch (Exception e)
        {
            Debug.Log("PartsDispManager Awake" + e.Message);
        }
    }

    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }


}
