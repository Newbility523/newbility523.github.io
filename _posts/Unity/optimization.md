```c#
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Profiling;
using UnityEngine.Events;
using System;

public class LoadTest : MonoBehaviour
{
    public GameObject targetItem;

    private List<GameObject> Item;

    public int testCount = 0;

    // Start is called before the first frame update
    void Start()
    {
        Test(default, "default");
    }

    private void Test(UnityAction func, string tag)
    {
        GC.Collect();
        float t = Time.time;
        float usedMemory = Profiler.usedHeapSizeLong;
        func();
        Debug.Log(string.Format("[%s] : use time = %s, usedHeapSizeLong = %s, maxUsed = %s", Time.time - t, Profiler.usedHeapSizeLong - usedMemory, Profiler.maxUsedMemory);
    }

    private void Default()
    {

    }

    // Update is called once per frame
    void Update()
    {
        
    }
}

```

