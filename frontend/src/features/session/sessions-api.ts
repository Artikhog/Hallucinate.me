import { apiClient } from '@/shared/api/base.ts'
import type { GameSession } from '@/shared/api/api';

class SessionsApi {
    async getUserSessions(): Promise<GameSession[]> {
        const { data } = await apiClient.users.getUserSessionsUsersMeSessionsGet();
        // const { data } = await apiClient.instance.get<UserSession[]>('/users/me/sessions')
        return data
    }
}

export const sessionsApi = new SessionsApi()