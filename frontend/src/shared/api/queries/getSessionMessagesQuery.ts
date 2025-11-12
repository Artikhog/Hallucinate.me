import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { Message } from "../api";
import { apiClient } from "../base";

export const useGetSessionMessagesQuery = (sessionId: string): UseQueryResult<Message[], Error> => {
    return useQuery({
        queryKey: ['session-messages', sessionId],
        queryFn: () => apiClient.gameSessions.getChatHistorySessionsSessionIdMessagesGet(sessionId),
        select: (response) => response.data,
    });
};