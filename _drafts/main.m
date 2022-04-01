//
//  main.m
//  objective-c
//
//  Created by Huangzhuofu on 2020/12/14.
//

#import <Foundation/Foundation.h>
#import "objc/runtime.h"

@interface TempClass : NSObject {
}
@end;

@implementation TempClass

-(void)abc {
    NSLog(@"running TempClass abc");
}

@end
@interface MyClass : NSObject {
    int a;
    int b;
    @private
    NSString* _name;
}

@property int age;
@property NSString* name;

@end

@implementation MyClass

@dynamic name;

-(void)setName:(NSString *)name
{
    _name = name;
}

-(NSString* )name {
    return _name;
}

+(int)Func{
    return 1;
}

-(int)Func2 : (NSNumber*) numberObj {
    return [numberObj intValue];
}

- (void)Func3 : (int) input1 param2:(NSString *) str {
//    NSString* output = @"hello world 2";
//    NSLog(output);
    NSLog(@"hello world3");
    NSLog([[NSString alloc] initWithFormat:@"input1 = %d, input2 = %@", input1, str], nil);
}

void DynamicFunc (id self, SEL _cmd){
    NSLog(@"Using DynamicFunc");
}

+(BOOL) resolveInstanceMethod:(SEL) sel
{
    NSLog(@"resolveInstanceMethod");
    NSLog(@"tring use %s", sel);

    if (sel == @selector(Temp))
    {
        IMP imp = class_getMethodImplementation([self class], @selector(OC_Func:name:));
        class_addMethod([self class], sel, imp, "v@:@@");
        
        //class_addMethod([self class], sel, (IMP) C_Func, "v@:@@");

        return YES;
    }

    
//    if (sel == @selector())
//    {
//        NSLog(@"No DynamicFunc, adding");
//        class_addMethod([self class], sel, (IMP) DynamicFunc, "v@:");
//        return TRUE;
//    }
//
    return [super resolveInstanceMethod:sel];
}

-(id)forwardingTargetForSelector:(SEL) sel {
    NSLog(@"running forwardingTargetForSelector");
    TempClass* temp = [[TempClass alloc] init];
    return temp;
}

-(void) OC_Func:(NSString*) a name:(NSString*) n
{
    NSLog(@"OC func : param1:%@, params2:%@", a, n);
}

void C_Func(id self, SEL sel, NSString* str1, NSString* str2)
{
    NSLog(@"C func: params1: %@, params2: %@", str1, str2);
}

//-(void) Temp:(NSString*) a
//{
//    NSLog(@"temp : param1:%@", a);
//}

//-(void) Temp
//{
//    NSLog(@"temp :none");
//}

@end



int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // insert code here...
        NSLog(@"Hello, World!");
    }
    
    MyClass* myClass = [[MyClass alloc] init];
//
//    [myClass performSelector:@selector(Temp:name:) withObject:@"test1-1" withObject:@"test1-2"];
    
//    [myClass performSelector:@selector(Temp:)];
    
    [myClass performSelector:@selector(Temp) withObject:@"test1-1" withObject:@"test1-2"];
    
    
    return 0;
}
