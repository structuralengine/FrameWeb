using UnityEngine;
using System;


public class Singleton<T> where T : class
{
	private static readonly T _singleton = null;
    public static T Instance {
        get { return _singleton; }
    }


    static Singleton()
	{
        Type t = typeof(T);
        object obj = Activator.CreateInstance(t, true);
        _singleton = obj as T;
    }


	public static bool Enable
	{
		get
		{
			return	(_singleton!=null);
		}
	}
    
}
