/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** MessageRole */
export enum MessageRole {
  User = "user",
  Assistant = "assistant",
}

/** GameSession */
export interface GameSession {
  /** Id */
  id: string;
  /** Level Id */
  level_id: string;
  /** Username */
  username: string;
  /**
   * Messages
   * @default []
   */
  messages?: Message[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HallucinationReport */
export interface HallucinationReport {
  /** Incorrect Fact */
  incorrect_fact: string;
  /** Source Url */
  source_url: string;
}

/** LeaderboardEntry */
export interface LeaderboardEntry {
  /** Username */
  username: string;
  /** Score */
  score: number;
}

/** Level */
export interface Level {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Base Score */
  base_score: number;
  /** Article Link */
  article_link: string;
  /** Article Name */
  article_name: string;
}

/** Message */
export interface Message {
  role: MessageRole;
  /** Content */
  content: string;
}

/** TokenResponse */
export interface TokenResponse {
  /** Access Token */
  access_token: string;
  /**
   * Token Type
   * @default "bearer"
   */
  token_type?: string;
  /** Username */
  username: string;
}

/** UserLogin */
export interface UserLogin {
  /** Username */
  username: string;
  /** Password */
  password: string;
}

/** UserRegister */
export interface UserRegister {
  /**
   * Username
   * @minLength 3
   * @maxLength 50
   */
  username: string;
  /**
   * Password
   * @minLength 6
   */
  password: string;
}

/** UserStats */
export interface UserStats {
  /** Total Score */
  total_score: number;
  /** Sessions Played */
  sessions_played: number;
  /** Successful Reports */
  successful_reports: number;
  /** Global Rank */
  global_rank: number;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title AI Hallucination Game API
 * @version 1.0.0
 *
 * API для игры по обнаружению галлюцинаций ИИ
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name RootGet
   * @summary Root
   * @request GET:/
   * @response `200` `any` Successful Response
   */
  rootGet = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/`,
      method: "GET",
      format: "json",
      ...params,
    });

  authentication = {
    /**
     * No description
     *
     * @tags Authentication
     * @name RegisterAuthRegisterPost
     * @summary Register
     * @request POST:/auth/register
     * @response `200` `TokenResponse` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    registerAuthRegisterPost: (
      data: UserRegister,
      params: RequestParams = {},
    ) =>
      this.request<TokenResponse, HTTPValidationError>({
        path: `/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authentication
     * @name LoginAuthLoginPost
     * @summary Login
     * @request POST:/auth/login
     * @response `200` `TokenResponse` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    loginAuthLoginPost: (data: UserLogin, params: RequestParams = {}) =>
      this.request<TokenResponse, HTTPValidationError>({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  levels = {
    /**
     * No description
     *
     * @tags Levels
     * @name GetLevelsLevelsGet
     * @summary Get Levels
     * @request GET:/levels/
     * @secure
     * @response `200` `(Level)[]` Successful Response
     */
    getLevelsLevelsGet: (params: RequestParams = {}) =>
      this.request<Level[], any>({
        path: `/levels/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  gameSessions = {
    /**
     * No description
     *
     * @tags Game Sessions
     * @name StartGameSessionSessionsLevelsLevelIdStartPost
     * @summary Start Game Session
     * @request POST:/sessions/levels/{level_id}/start
     * @secure
     * @response `200` `GameSession` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    startGameSessionSessionsLevelsLevelIdStartPost: (
      levelId: string,
      params: RequestParams = {},
    ) =>
      this.request<GameSession, HTTPValidationError>({
        path: `/sessions/levels/${levelId}/start`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game Sessions
     * @name GetSessionInfoSessionsSessionIdGet
     * @summary Get Session Info
     * @request GET:/sessions/{session_id}
     * @secure
     * @response `200` `GameSession` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    getSessionInfoSessionsSessionIdGet: (
      sessionId: string,
      params: RequestParams = {},
    ) =>
      this.request<GameSession, HTTPValidationError>({
        path: `/sessions/${sessionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game Sessions
     * @name SendUserMessageSessionsSessionIdMessagePost
     * @summary Send User Message
     * @request POST:/sessions/{session_id}/message
     * @secure
     * @response `200` `any` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    sendUserMessageSessionsSessionIdMessagePost: (
      sessionId: string,
      query: {
        /** Message */
        message: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/sessions/${sessionId}/message`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game Sessions
     * @name GetChatHistorySessionsSessionIdMessagesGet
     * @summary Get Chat History
     * @request GET:/sessions/{session_id}/messages
     * @secure
     * @response `200` `(Message)[]` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    getChatHistorySessionsSessionIdMessagesGet: (
      sessionId: string,
      params: RequestParams = {},
    ) =>
      this.request<Message[], HTTPValidationError>({
        path: `/sessions/${sessionId}/messages`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game Sessions
     * @name ReportHallucinationSessionsSessionIdReportHallucinationPost
     * @summary Report Hallucination
     * @request POST:/sessions/{session_id}/report-hallucination
     * @secure
     * @response `200` `any` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    reportHallucinationSessionsSessionIdReportHallucinationPost: (
      sessionId: string,
      data: HallucinationReport,
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/sessions/${sessionId}/report-hallucination`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить список собственных репортов пользователя по всем сессиям.
     *
     * @tags Game Sessions
     * @name GetMyReportsSessionsReportsMyGet
     * @summary Get My Reports
     * @request GET:/sessions/reports/my
     * @secure
     * @response `200` `any` Successful Response
     */
    getMyReportsSessionsReportsMyGet: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/sessions/reports/my`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Game Sessions
     * @name SendUserMessageStreamSessionsSessionIdMessageStreamPost
     * @summary Send User Message Stream
     * @request POST:/sessions/{session_id}/message/stream
     * @secure
     * @response `200` `any` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    sendUserMessageStreamSessionsSessionIdMessageStreamPost: (
      sessionId: string,
      query: {
        /** Message */
        message: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, HTTPValidationError>({
        path: `/sessions/${sessionId}/message/stream`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  leaderboard = {
    /**
     * No description
     *
     * @tags Leaderboard
     * @name GetGlobalLeaderboardLeaderboardGet
     * @summary Get Global Leaderboard
     * @request GET:/leaderboard/
     * @secure
     * @response `200` `(LeaderboardEntry)[]` Successful Response
     */
    getGlobalLeaderboardLeaderboardGet: (params: RequestParams = {}) =>
      this.request<LeaderboardEntry[], any>({
        path: `/leaderboard/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name GetUserStatsUsersMeStatsGet
     * @summary Get User Stats
     * @request GET:/users/me/stats
     * @secure
     * @response `200` `UserStats` Successful Response
     */
    getUserStatsUsersMeStatsGet: (params: RequestParams = {}) =>
      this.request<UserStats, any>({
        path: `/users/me/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name GetUserSessionsUsersMeSessionsGet
     * @summary Get User Sessions
     * @request GET:/users/me/sessions
     * @secure
     * @response `200` `(GameSession)[]` Successful Response
     */
    getUserSessionsUsersMeSessionsGet: (params: RequestParams = {}) =>
      this.request<GameSession[], any>({
        path: `/users/me/sessions`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
