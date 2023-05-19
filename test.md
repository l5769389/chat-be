```javascript
 joinRoom:{
    roomId, 
    joinUserIds,  // 为了告知客户端群中的用户信息
    chatroomName
}

singlemsg: {
  fromUserId,
    chatId  // 单人消息中应等于 fromUserId  
    msg:{
      type, 
      content
  }
}

multimsg: {
  fromUserId, //消息是谁发出的？
  chatId     //消息对应的chatId
    msg:{
    type,     // text img
    content   // 消息内容 
  }
}
```