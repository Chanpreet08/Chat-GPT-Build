import { startNewChat } from "@/features/home/action/start-new-chat";
import { redirect } from "next/navigation";

const page = async () => {
  const conversationId = await startNewChat();
  redirect(`/c/${conversationId}`);
}


export default page;
