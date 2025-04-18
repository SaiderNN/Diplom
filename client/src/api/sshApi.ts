import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ConnectRequest {
  host: string;
  port: number;
  username: string;
  password?: string; // Необязательное поле
  key?: string; // Необязательное поле для подключения по SSH ключу
}

export interface ConnectResponse {
  welcome_text: string;
  status: number;
  session_id: number

}

export const sshApi = createApi({
  reducerPath: "sshApi",
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/ssh',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); 
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
  }),
});

export const { useConnectMutation, useInitshellMutation } = sshApi;
