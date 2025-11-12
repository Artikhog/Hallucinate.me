import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { GameSession } from "../api";
import { apiClient } from "../base";

export const useGetSessionInfoQuery = (sessionId: string): UseQueryResult<GameSession, Error> => {
    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => apiClient.gameSessions.getSessionInfoSessionsSessionIdGet(sessionId),
        select: (response) => response.data,
    });
};