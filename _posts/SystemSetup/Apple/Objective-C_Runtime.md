# OC

## 函数调用 / 消息传递机制

在 OC 里调用类或对象的方法 Func 有以下几个步骤

1. 查找类或对象函数列表，当存在 Func 则调用，不存在就继续向父类查找。
2. 直达继承尽头都无法处理，则执行 `+(BOOL) resolveInstanceMethod:(SEL) sel`。如果内部补充上了 Func，则跳转并执行。
3. `resolveInstanceMethod`没有补充，则执行`-(id) forwardingTargetForSelector:(SEL) sel`
4. forwardInvocation
5. `resolveInstanceMethod`都没法处理 Func 则报错。

所以当**类**实现了 `resolveInstanceMethod`在要执行不能存在的函数时，就可以进行处理。

当**对象**实现了`resolveInstanceMethod`在要执行不能存在的函数时，就可以**转派**进行处理。

``` objective-c
////////////////// Just for back up
@interface TempClass {
}
@end
    
@implementation TempClass {
}

-(void) Temp {
     NSLog(@"TempClass: Temp");
}

@end

////////////////// MyClass for test
@interface MyClass {
}
@end
    
@implementation MyClass {
}

+(BOOL) resolveInstanceMethod:(SEL) sel {
    NSLog(@"resolveInstanceMethod");
    NSLog(@"trying use selector: %s", sel);
    if (sel == @selector(Temp)) {
        NSLog(@"not exist. adding selector: %s", sel);
        // choose one way
        // one way: add objective-c func
        IMP imp = class_getMethodImplementation([self class], @selector(Temp_OC_Func));
        class_addMethod([self class], self, imp, "v@:");
        // another way: add c func
        class_addMethod([self class], self, (IMP) , "v@:");
        
        return YES;
    }
    
    // fallback
    return [super resolveInstanceMethod:sel];
}

-(void) Temp_OC_Func {
    NSLog(@"MyClass: Temp_OC_Func");
}

-(id) forwardingTargetForSelector:(SEL) sel {
    TempClass* tempObj = [[TempClass* alloc] init];
	return tempObj
}
@end
    
void Temp_C_Func(id self, SEL sel) {
    NSLog(@"Other: Temp_C_Func");
}

int main(int argc, const char* argv[]) {
    MyClass* myClass = [[MyClass alloc] init];

    // Error: can't invoke Temp method by this way, there on Temp in myClass
    // [myClass Temp]
    
    // right way
    [myClass performSelector:@selector(Temp)];
    
    return 0;
}
```

在上面的例子中展示了`resolveInstanceMethod`和`forwardingTargetForSelector`的使用方法

在 main 中调用 `[myClass performSelector:@selector(Temp)]`，因为 myClass 中不存在 Temp（直接`[myClass Temp]`则会无法通过编译），所以`resolveInstanceMethod`被调用，并用两种方式将方法加到 myClass 中。其中，对于 objective-c 的方法，需要搭配`class_getMethodImplementation`获取对象中的函数指针，而对于 c 的方法，转为 (IMP) 即可。需要注意的是，其实任何 objective-c 函数的原形都是 `return_type c_funcName(id self, SEL sel, ...)`只不过被隐藏了。所以在指定 c 的方法是，需要加上 `(id self, SEL sel)`。

如果把`resolveInstanceMethod`**注释掉**，则对象不存在可执行的函数，转到`forwardingTargetForSelector`中，在那里返回了一个 TempClass 对象，因为TempClass 实现了 Temp**（必须同名）**，所以转而执行 TempClass 的 Temp 方法。

如果再把  `resolveInstanceMethod`注释掉，则 myClass 任何途径都无法执行 Temp，出现报错。

### 有几点需要注意的

* `resolveInstanceMethod`对`@selector(funcName)`做过一次处理后，如果成功，对于后续的`@selector(funcName)`调用将不再进入`resolveInstanceMethod`。如果失败，将进入`forwardingTargetForSelector`，如果成功处理，后续就不会在进入`resolveInstanceMethod`，但是会再次进入`forwardingTargetForSelector`。如果再次失败，则再次`resolveInstanceMethod`，但因为无法处理，会直接报错。

* 关于`resolveInstanceMethod`的返回值，YES 和 NO 并没有实际意义。

* `class_addMethod`的第四个参数，是用于描述新增函数所接受的参数类型的，对于无返回无参数的函数为 "v@:"，v 代表无返回指，@代表该方法的函数只恨指针，：则是搭配 @ 表示函数输入。如果函数接受参数，则需要在后补充字符描述参数类型，具体可看[苹果开发者文档](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html)。但是在我的实际测试中，写错或者直接为空字符串都不影响函数响应。

  在看完后[苹果开发者文档](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html)，可能会觉得一来函数的参数类型标签容易写错，而且在指定了一个明确的方法后还要手动传入这个函数参数类型也不太符合常理。所以 objective-c 还提供了另一种方式

  ``` objective-c
  +(BOOL) resolveInstanceMethod:(SEL) sel {
      if (sel == @selector(Temp)) {
         	Method method = class_getInstanceMethod([self class], @selector(Temp_OC_Func));
          IMP imp = class_getMethodImplementation([self class], @selector(Temp_OC_Func));
          class_addMethod([self class], self, imp, method_getTypeEncoding(method));
          
          return YES;
      }
      
      // fallback
      return [super resolveInstanceMethod:sel];
  }
  ```

  没错，还是要传，但是可以用`class_getInstanceMethod`获取参数描述传入，虽然还要传入，但是总比自己写靠谱。。。

## Runtime 传参问题

Runtime 调用函数，使用`performSelector`， 跳转到`performSelector`的定义发现有三种方式：

``` objective-c
-(id) performSelector:(SEL) selector;
-(id) performSelector:(SEL) selector withObject:(id) object;
-(id) performSelector:(SEL) selector withObject:(id) object withObject:(id) object;
```

可以看出默认提供最多允许传入两个参数，并且只允许对象类型。

但由于可以传入对象，通过传入数组，字典，hash 表就足以处理传入多参的情况了。

objective-c 函数名称实际上是要用过联级拼接得到的，例如

``` objective-c
-(void) Func_One:(NSString*) n1 {
    NSLog(@"Func_One param = %@,", n1);
}

-(void) Func_Two:(NSString*) n1 Name:(NSString*) n2 {
    NSLog(@"Func_Two params1 = %@, params2 = %@", n1, n2);
}

void main() {
    // [myClass performSelector:@selector(Func_One), withObject:@"str1"]; // wrong
    [myClass performSelector:@selector(Func_One:), withObject:@"str1"]; // right
    [myClass performSelector:@selector(Func_Two:Name:), withObject:@"str2-1", withObject:@"str2-2"]; // right
}
```

当配合 `resolveInstanceMethod`使用时，还可以做些非常规的操作

``` objective-c
//...
+(BOOL) resolveInstanceMethod:(SEL) sel {
    if (sel == @selector(Temp)) {
        IMP imp = class_getMethodImplementation([self class], @selector(Temp_OC_Func:Name:));
        class_addMethod([self class], self, imp, "v@:");

        return YES;
    }
    
    // fallback
    return [super resolveInstanceMethod:sel];
}

-(void) Temp_OC_Func:(NSString*) n1 Name:(NSString*) n2 {
    NSLog(@"Func_Two params1 = %@, params2 = %@", n1, n2);
}
//...

void main() {
    [myClass performSelector:@selector(Temp) withObject:@"str2-1", withObject:@"str2-2"];
}
```

上面的代码，用过`resolveInstanceMethod`修改了`Temp`的实际相应函数为`Temp_OC_Func:Name:`，所以 `performSelector`传入的参数必须为两个。

也就是说`performSelector`传入的参数要与实际处理的函数对应，而不是匹配`performSelector`调用时使用的函数名，否则会报错，或者产生非预期的结果，传入参数可以多，但是不能少。

##  Runtime 调用的返回值

可以发现`performSelector`的返回值是个 id 类型，可知返回值无法通过`performSelector`接收。如果需要调用有返回值的函数，请使用 `NSInvocation`





