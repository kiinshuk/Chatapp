import { Avatar, HStack, Text} from '@chakra-ui/react'
import React from 'react'

const Message = ({text, url, user="other"}) => {
  return (
    <HStack alignSelf={user==="me"?"flex-end":"flex-start"} bg="gray.100" paddingY={"2"} paddingX={user==="me"?"4":"2"} borderRadius={"base"}>
        
        {
            user ==="other" && <Avatar src={url}></Avatar>
        }
        <Text>{text}</Text>
        {
            user ==="me" && <Avatar src={url}></Avatar>
        }
        
    </HStack>
  )
}

export default Message
