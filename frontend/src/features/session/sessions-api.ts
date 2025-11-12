import { apiClient } from '@/shared/api/base.ts'
import type {UserSession} from "@/features/session/types/user-session.ts";

class SessionsApi {
    async getUserSessions(): Promise<UserSession[]> {
        const { data } = await apiClient.instance.get<UserSession[]>('/users/me/sessions')
        return data
    }
}

export const sessionsApi = new SessionsApi()