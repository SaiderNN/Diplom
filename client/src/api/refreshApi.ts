import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenData {
  refresh_token: string;
}

export const refreshApi = createApi({
  reducerPath: 'refreshApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1/auth', 
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    refreshTokens: builder.mutation<RefreshResponse, RefreshTokenData>({
      query: ({ refresh_token }) => ({
        url: '/refresh-token',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refresh_token}`, 
        },
      }),
    }),
  }),
});

export const { useRefreshTokensMutation } = refreshApi;
