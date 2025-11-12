import type { GameSession } from "../api";
import { apiClient } from "../base";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export const useGetCurrentSessions = (): UseQueryResult<GameSession[], Error> => {
    return useQuery({
        queryKey: ['current-sessions'],
        queryFn: () => apiClient.users.getUserSessionsUsersMeSessionsGet(),
        select: (response) => response.data,
    });
};