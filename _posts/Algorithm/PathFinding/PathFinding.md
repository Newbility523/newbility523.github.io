

参考文档 https://www.redblobgames.com/pathfinding/a-star/introduction.html

Jump point search https://zerowidth.com/2013/a-visual-explanation-of-jump-point-search.html

Jump point search 优化手段 https://zhuanlan.zhihu.com/p/290924212#:~:text=JPS%20%E5%8F%88%E5%90%8D%E8%B7%B3%E7%82%B9,%E5%AF%BB%E6%89%BE%E5%90%8E%E7%BB%A7%E8%8A%82%E7%82%B9%E7%9A%84%E6%93%8D%E4%BD%9C%E3%80%82

Breadth First Serach 广度优先寻路

Dijkstra 优先队列广度优先寻路

Heuristic 启发式寻路寻路

A* 寻路



曼哈顿距离：各轴差值之和1

```python
def heuristic(test_pos, target_pos):
    dx = abs(target_pos[0] - test_pos[0])
    dy = abs(target_pos[1] - test_pos[1])
    
    # 曼哈顿距离 - 偏向 L 字
    return dx + dy
```

欧式几何距离：两点直线距离

```python
def heuristic(test_pos, target_pos):
    dx = abs(target_pos[0] - test_pos[0])
    dy = abs(target_pos[1] - test_pos[1])
   
    # 欧式距离 - 偏向两点直线
    return dx * dx + dy * dy
```



启发算法选用曼哈顿距离会偏向 L 字型