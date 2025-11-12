import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "../base";
import type { Level } from "../api";

export const useGetLevelsQuery = (): UseQueryResult<Level[], Error> => {
    return useQuery({
        queryKey: ['levels'],
        queryFn: () => apiClient.levels.getLevelsLevelsGet(),
        select: (response) => response.data,
    });
};