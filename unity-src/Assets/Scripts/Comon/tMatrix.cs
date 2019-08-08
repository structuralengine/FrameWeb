using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;

namespace Assets.Scripts.Comon
{
  public class Matrix
  {
    private int column; // Horizontal Size = No. of columns
    private int row;    // Vertical Size = No. of Rows
    private double[,] array;

    public int Cols
    {
      get
      {
        return this.column;
      }
    }

    public int Rows
    {
      get
      {
        return this.row;
      }
    }

    public double this[int X, int Y]
    {
      get{ return this.array[X, Y]; }
      set{ this.array[X, Y] = value; }
    }

    public Matrix(int X, int Y, double DefaultValue = 0)
    {
      this.column = X;
      this.row = Y;
      this.array = new double[column, row];

      if (DefaultValue != 0){
        for (int i = 0; i < column; i++){
          for (int j = 0; j < row; j++){
            array[i, j] = DefaultValue;
          }
        }
      }
    }

    public static Matrix operator +(Matrix A, Matrix B)
    {
      if (A == null & B == null)
        return null;
      if (A == null)
        return B;
      if (B == null)
        return A;

      if (A.column != B.column | A.row != B.row)
        throw new Exception("Matrices size Mismatch.");

      Matrix C = new Matrix(A.column, A.row);

      for (int i = 0; i < A.column; i++){
        for (int j = 0; j < A.row; j++){
          C.array[i, j] = A.array[i, j] + B.array[i, j];
        }
      }
      return C;
    }

    public static Matrix operator *(Matrix A, Matrix B)
    {
      if (A.column != B.row){
        throw new Exception("Matrices size Mismatch.");
      }

      Matrix C = new Matrix(B.column, A.row);

      for (int j = 0; j < A.row; j++) {
        for (int i = 0; i < B.column; i++) {
          for (int k = 0; k < A.column; k++) {
            C.array[i, j] += A.array[k, j] * B.array[i, k];
          }
        }
      }
      return C;
    }

    /// <summary>転置行列計算</summary>
    ///     ''' <returns>転置行列</returns>
    ///     ''' <remarks></remarks>
    public Matrix Transpose()
    {
      Matrix result = new Matrix(this.row, this.column);

      for (int x = 0; x < this.column; x++) {
        for (int y = 0; y < this.row; y++) {
          result.array[y, x] = array[x, y];
        }
      }
      return result;
    }

  }

  public class tMatrix
  {

    public static Vector3 upwards(Vector3 p1, Vector3 p2, double ang = 0)
    {
      tMatrix tM = new tMatrix(p1, p2, ang);
      Matrix M = new Matrix(1, 3);
      M[0, 2] = 1; // z だけ1の行列
      Matrix rM = tM.tMatrix3.Transpose() * M;
      Vector3 result = new Vector3();
      result.x = p1.x - (float)rM[0, 0];
      result.y = p1.y + (float)rM[0, 1];
      result.z = p1.z + (float)rM[0, 2];
      return result;
    }

    private double _angle;
    private Vector3 _Point1;
    private Vector3 _Point2;

    private double distance()
    {
      return Vector3.Distance(this._Point1, this._Point2);
    }

    /// <summary>コンストラクター</summary>
    ///     ''' <param name="p1">起点</param>
    ///     ''' <param name="p2">終点</param>
    ///     ''' <param name="ang">コードアングル</param>
    public tMatrix(Vector3 p1, Vector3 p2, double ang = 0)
    {
      _Point1 = p1;
      _Point2 = p2;
      _angle = ang;
    }

    public Matrix tMatrix3
    {
      get
      {
        Matrix result = new Matrix(3, 3);
        var FAII = _angle;
        double DX = (this._Point2.x - this._Point1.x);
        double DY = (this._Point2.y - this._Point1.y);
        double DZ = (this._Point2.z - this._Point1.z);
        double EL = this.distance();

        if ((DX == 0 & DY == 0))
        {
          result[0, 0] = 0.0;
          result[0, 1] = 0.0;
          result[0, 2] = 1.0;
          result[1, 0] = Math.Cos(FAII);
          result[1, 1] = Math.Sin(FAII);
          result[1, 2] = 0.0;
          result[2, 0] = -Math.Sin(FAII);
          result[2, 1] = Math.Cos(FAII);
          result[2, 2] = 0.0;
        }
        else
        {
          double xL = DX / EL;
          double XM = DY / EL;
          double XN = DZ / EL;
          double xlm = Math.Sqrt(xL * xL + XM * XM);
          Matrix ts = new Matrix(3, 3);
          Matrix tf = new Matrix(3, 3);
          ts[0, 0] = xL;
          ts[0, 1] = XM;
          ts[0, 2] = XN;
          ts[1, 0] = -XM / xlm;
          ts[1, 1] = xL / xlm;
          ts[1, 2] = 0;
          ts[2, 0] = -XN * xL / xlm;
          ts[2, 1] = -XM * XN / xlm;
          ts[2, 2] = xlm;
          tf[0, 0] = 1;
          tf[0, 1] = 0;
          tf[0, 2] = 0;
          tf[1, 0] = 0;
          tf[1, 1] = Math.Cos(FAII);
          tf[1, 2] = Math.Sin(FAII);
          tf[2, 0] = 0;
          tf[2, 1] = -Math.Sin(FAII);
          tf[2, 2] = Math.Cos(FAII);

          result = ts * tf;
        }
        return result;
      }
    }
  }
}
