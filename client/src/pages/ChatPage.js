import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider"
import SideDrawer from "../components/authentication/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats.js"
import ChatBox from "../components/ChatBox.js";
import { useEffect, useState } from "react";

const ChatPage = () => {
    const { user, flag } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false)
    useEffect(() => {
        if (flag) {
            window.location.reload(false)
        }

    }, [flag])
    return (
        <div style={{ width: "100%" }}>
            {user && <SideDrawer />}

            <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
                {user && <MyChats fetchAgain={fetchAgain} />}
                {user && (
                    <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                )}
            </Box>

        </div>
    )
}

export default ChatPage