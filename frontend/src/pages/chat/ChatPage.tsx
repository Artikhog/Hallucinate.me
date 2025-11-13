import { ReportsSection } from '@/features/report/section/ReportsSection'
import { ChatSection } from '@/shared/ui/shadcn/chat'

export const ChatPage = () => {

    
    return (
        <div className="flex flex-row flex-1 w-full">
            <ChatSection />
            <ReportsSection />
        </div>
    )
}