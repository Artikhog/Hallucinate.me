import { UserLeaderBoardCard } from "@/entities/user/ui/UserLeaderboardCard"
import type { LeaderboardEntry } from "@/shared/api/api"
import { apiClient } from "@/shared/api/base"
import { useEffect, useState } from "react"


export const LeaderBoardPage = () => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])

    useEffect(() => {
        apiClient.leaderboard.getGlobalLeaderboardLeaderboardGet().then(response => setLeaders(response.data));
    }, [])

    return <div>{
        leaders.map((leader, index) => <UserLeaderBoardCard place={index+1} user={leader} key={leader.username}/>)
    }</div>
}