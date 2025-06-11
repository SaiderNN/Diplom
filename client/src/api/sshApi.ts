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

export interface SshSession {
  sessionId: number;
  host: string;
  username: string;
}

export const sshApi = createApi({
  reducerPath: "sshApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/ssh",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Sessions"],
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
      providesTags: (result) =>
        result
          ? [
              ...result.map((session) => ({
                type: "Sessions" as const,
                id: session.sessionId,
              })),
              { type: "Sessions", id: "LIST" },
            ]
          : [{ type: "Sessions", id: "LIST" }],
    }),
    updateSession: builder.mutation<{ message: string }, { sessionId: string; data: any }>({
      query: ({ sessionId, data }) => ({
        url: `/${sessionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Sessions", id: "LIST" }],
    }),
    deleteSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Sessions", id: "LIST" }],
    }),
    disconnectSession: builder.mutation<void, number>({
      query: (sessionId) => ({
        url: "/disconnect",
        method: "POST",
        params: { sessionId },
      }),
    }),
  }),
});

export const {
  useConnectMutation,
  useInitshellMutation,
  useGetSessionsQuery,
  useDeleteSessionMutation,
  useUpdateSessionMutation,
  useDisconnectSessionMutation, 
} = sshApi;
