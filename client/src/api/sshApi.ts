import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ConnectRequest {
  host: string;
  username: string;
  password: string;
  port?: number;
}

export const sshApi = createApi({
  reducerPath: "sshApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080/api/v1/ssh" }),
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
