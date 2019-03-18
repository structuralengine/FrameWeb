using UnityEngine;
using System;
using System.Text;
using System.IO;
using System.Collections;



/// <summary>
/// 
/// </summary>
namespace SystemUtility
{
    /*
	[Serializable]
	public class StringVector3
	{
		public	string	x = "";
		public	string	y = "";
		public	string	z = "";

		public void Set( Vector3 vec )
		{
			x = vec.x.ToString();
			y = vec.y.ToString();
			z = vec.z.ToString();
		}

		public string this[int index]{
			set
			{
				switch( index ) {
					case	0:
						x = value;
						break;
					case	1:
						y = value;
						break;
					case	2:
						z = value;
						break;
				}
			}
			get
			{
				switch( index ) {
					case	0:
						return	x;
					case	1:
						return	y;
					case	2:
						return	z;
				}
				return	"";
			}
		}
		

		public static	implicit operator Vector3( StringVector3 sv )
		{
			Vector3		v;

			v.x = string.IsNullOrEmpty(sv.x) ? 0.0f : float.Parse(sv.x);
			v.y = string.IsNullOrEmpty(sv.y) ? 0.0f : float.Parse(sv.y);
			v.z = string.IsNullOrEmpty(sv.z) ? 0.0f : float.Parse(sv.z);
				
			return	v;
		}

		public bool	isNullOrEmpty
		{
			get{
				return	string.IsNullOrEmpty(this.x) || string.IsNullOrEmpty(this.y) || string.IsNullOrEmpty(this.z);
			}
		}
	}
    */

	public	class ComonFunctions
    {
        public static int ConvertToInt(object obj, int defaultvalue = 0 )
        {
            int result = 0;

            string str = obj.ToString();
            if (!int.TryParse(str, out result))
                result = defaultvalue;

            return result;
        }
        public static double ConvertToDouble(object obj, double defaultvalue = 0.0)
        {
            double result = 0;

            string str = obj.ToString();
            if (!double.TryParse(str, out result))
                result = defaultvalue;

            return result;
        }
        public static float ConvertToSingle(object obj, float defaultvalue = 0.0F)
        {
            float result = 0;

            string str = obj.ToString();
            if (!float.TryParse(str, out result))
                result = defaultvalue;

            return result;
        }

        /// <summary>
        /// 引数に有効な、数値が含まれているか調べる
        /// </summary>
        /// <param name="a"></param>
        /// <returns></returns>
        public static bool IsEnableData(params string[] a)
        {
            for (int i = 1; i < a.Length; ++i)
            {
                double d;
                if (double.TryParse(a[i], out d))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        ///	string を integer に変換
        /// </summary>
        /// <param name="strId"></param>
        /// <returns></returns>
        public static int GetIntValue(string strId)
        {
            if (string.IsNullOrEmpty(strId))
            {
                return -1;
            }

            return int.Parse(strId) - 1;        //	１始まりのため
        }

        /// <summary>
        ///	string を float に変換
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static float GetFloatValue( string str )
		{
			if( string.IsNullOrEmpty(str) ) {
				return	0.0f;
			}

			return	float.Parse( str );
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="strValue"></param>
		/// <param name="strFormat"></param>
		/// <returns></returns>
		public	static string GetFloatFormatString( string strValue, string strFormat )
		{
			if( string.IsNullOrEmpty(strFormat) ) {
				return	strValue;
			}
			
			float	f;

			if( string.IsNullOrEmpty(strValue) ) {
				return	strValue;
			}
			else {
				f = float.Parse(strValue);
			}

			return	f.ToString(strFormat);
		}
	}
}
