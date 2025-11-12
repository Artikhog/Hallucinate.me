import {
  useMutation,
  useQueryClient,
  type MutateOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { GameSession } from "../api";
import { apiClient } from "../base";

export const useStartLevelMutation = (
  options: MutateOptions<GameSession, Error, string>
): UseMutationResult<GameSession, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (levelId: string) =>
      apiClient.gameSessions
        .startGameSessionSessionsLevelsLevelIdStartPost(levelId)
        .then((response) => response.data),
    ...options,
    onSuccess: (data, ...props) => {
      options.onSuccess?.(data, ...props);
      queryClient.invalidateQueries({ queryKey: ['current-sessions'] });
    },
  });
};
