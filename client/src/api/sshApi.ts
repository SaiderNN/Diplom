import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ConnectRequest {
  host: string;
  port: number;
  username: string;
  password?: string;
  key?: string;
}

export interface ConnectResponse {
  welcome_text: string;
  status: number;
  session_id: number;
}

// Интерфейс для сессии (можно дополнить по необходимости)
export interface SshSession {
  sessionId: number;
  host: string;
  username: string;
}

export const sshApi = createApi({
  reducerPath: "sshApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1/ssh",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    connect: builder.mutation<ConnectResponse, ConnectRequest>({
      query: (credentials) => ({
        url: "/connect",
        method: "POST",
        body: credentials,
      }),
    }),
    initshell: builder.mutation<void, number>({
      query: (sessionId) => ({
        url: "/initshell",
        method: "POST",
        params: { sessionId },
      }),
    }),
    getSessions: builder.query<SshSession[], number>({
      query: (userId) => ({
        url: "/list",
        method: "GET",
        params: { id: userId },
      }),
    }),
  }),
});

export const {useConnectMutation, useInitshellMutation, useGetSessionsQuery,} = sshApi;
