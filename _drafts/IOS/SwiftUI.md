```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
        }
        .padding()
    }
}
```

解释下里面的用法

大量使用的尾随闭包

```swift
// 定义
func travel(action: () -> Void) {
    print("I'm getting ready to go.")
    action()
    print("I arrived!")
}

// 简化1
travel() {
    print("I'm driving in my car")
}

// 简化1
travel {
    print("I'm driving in my car")
}
```

