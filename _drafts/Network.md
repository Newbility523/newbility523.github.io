服务端创建 socket 后，当监听到有新的连接，是否一定要 “accept” 使用新的 FD 进行连接，能不能不创建 FD，用原有的 socket。



客户端是否也能再连接成功后，新建新的 socket 对接服务器的新 socket.



服务端接收到连接请求后，怎么筛选拒绝某些连接。



客户端使用 connect 连接，实际消息是从什么端口出去的。如果能获取端口号，能不能新建socket 对端口号进行 bind。



实现 echo 客户端时为什么要传 buffer_size -1



尽量整合成C++样式

Char** 如何获取长度

控制台怎么输入输出