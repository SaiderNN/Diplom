import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RefreshResponse } from './refreshApi';


export interface AuthData {
    email: string; 
    password: string; 
  }
  
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: "https://pilipenkoaleksey.ru/api/v1/auth" }),
  endpoints: (builder) => ({
    login: builder.mutation<RefreshResponse, AuthData >({
      query: (credentials) => ({
        url: '/authorize',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
