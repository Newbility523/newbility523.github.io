1. basePanel 中

```lua
function P:AddChild(childKey, panelCls, createParams, isImmShow)
...
  if not self.childCreatingMark[childKey] then		-- 创建标志被清除说明父节点调用了销毁
    panel:Destroy()
    return
  end
...
end
```

没有清空计数，是存在说 addchild 瞬间调用 destroy 后，造成父节点创建失败，锁住。

并且存在两种计数方式 childCreatingMark 以及 childCreateLock，单纯使用 next(childCreatingMark) 也许更靠谱



2. XX 同样 AddChild 中，回调处理

```lua
local callback = createParams.callback -- 1
	createParams.callback = function(panel)
		if not self.childCreatingMark[childKey] then
			panel:Destroy()
			return
		end
		if isImmShow then
			panel:Show(createParams)
		else
			panel:Hide()
		end
  
		if callback then
			callback(panel)
		end

 
		self.childCreatingMark[childKey] = false  -- 2 			
		self.childPanels[childKey] = panel     
		self.childCreateLock = self.childCreateLock - 1
		self:_ChildCreateFinishCallBack()					-- 3
	end
```



local callback = createParams.callback

3. basePanel 中应该补充 parentPanel

4. _SkinShow 应该在 _LogicShow 前被执行

5. _LogicShow 第一个参数还是应该 params。

6. _loginShow 的判断

   ```lua
   	-- 被动调起且之前没有被动隐藏逻辑
   	if isBeShow and not self.isNeedShowBack then
   		return
   	end
   ```

   无法处理父节点的显隐对子节点的通知