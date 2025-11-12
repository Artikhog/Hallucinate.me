import { useMutation, useQueryClient, type MutateOptions } from "@tanstack/react-query";
import { apiClient } from "../base";
import type { HallucinationReport } from "../api";

export const useReportHallucinationMutation = (options: MutateOptions<HallucinationReport, Error, { sessionId: string, report: HallucinationReport }>) => {
  const queryClient = useQueryClient();
  return useMutation<HallucinationReport, Error, { sessionId: string, report: HallucinationReport }>({
    mutationFn: ({ sessionId, report }: { sessionId: string, report: HallucinationReport }) => {
      return apiClient.gameSessions.reportHallucinationSessionsSessionIdReportHallucinationPost(sessionId, report).then((response) => response.data);
    },
    ...options,
    onSuccess: (...props) => {
      options.onSuccess?.(...props);
      queryClient.invalidateQueries({ queryKey: ['session-messages'] });
      queryClient.invalidateQueries({ queryKey: ['session-info'] });
    },
  });
};