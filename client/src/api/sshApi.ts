import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ConnectRequest {
  host: string;
  port: number;
  username: string;
  password?: string; // Необязательное поле
  key?: string; // Необязательное поле для подключения по SSH ключу
}

export const sshApi = createApi({
  reducerPath: "sshApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1/ssh" }),
  endpoints: (builder) => ({
    connect: builder.mutation<any, ConnectRequest>({
      query: (credentials) => ({
        url: "/connect",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useConnectMutation } = sshApi;
