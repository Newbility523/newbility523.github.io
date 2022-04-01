using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Fog : MonoBehaviour
{
    private Camera c;
    public Material material;

    [Range(1.0f, 10.0f)]
    public float fogSpeedX;
    [Range(1.0f, 10.0f)]
    public float fogSpeedY;
    [Range(1.0f, 10.0f)]
    public float noiseScale;
    public Color fogColor;
    public float fogDensity;

    public Texture fogNoise;

    public float fogStart;
    public float fogEnd;

    private void Awake()
    {
        c = GetComponent<Camera>();
        if (c != null)
        {
            c.depthTextureMode |= DepthTextureMode.Depth;
        }
    }

    public void OnRenderImage(RenderTexture source, RenderTexture destination)
    {
        if (material == null)
        {
            return;
        }

        Vector3 upDir = c.transform.up;
        Vector3 rightDir = c.transform.right;
        float near = c.nearClipPlane;
        float upLenght = near * Mathf.Cos(Mathf.Deg2Rad * c.fieldOfView * 0.5f);
        float rightLenght = upLenght * c.aspect;

        Vector3 up = upDir * upLenght;
        Vector3 right = rightDir * rightLenght;
        Vector3 forward = c.transform.forward * near;

        Vector3 corner1 = (forward - up - right) / near;
        Vector3 corner2 = (forward - up + right) / near;
        Vector3 corner3 = (forward + up + right) / near;
        Vector3 corner4 = (forward + up - right) / near;
        Matrix4x4 cornersRay = new Matrix4x4(corner1, corner2, corner3, corner4);

        material.SetTexture("_FogNoise", fogNoise);
        material.SetFloat("_FogSpeedX", fogSpeedX);
        material.SetFloat("_FogSpeedY", fogSpeedY);
        material.SetFloat("_NoiseScale", noiseScale);
        material.SetColor("_FogColor", fogColor);
        material.SetFloat("_FogDensity", fogDensity);
        material.SetFloat("_FogStart", fogStart);
        material.SetFloat("_FogEnd", fogEnd);
        material.SetMatrix("_CornersRay", cornersRay);

        Graphics.Blit(source, destination, material);
    }
}
