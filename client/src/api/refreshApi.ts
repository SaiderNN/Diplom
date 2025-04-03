import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RefreshResponse {
  access_token: string;              
  refresh_token: string;            
}

export interface RefreshTokenData {
  refreshToken: string;  
}

export const refreshApi = createApi({
  reducerPath: 'refreshApi',  
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pilipenkoaleksey.ru/api/v1/auth' }),
  endpoints: (builder) => ({
    refreshTokens: builder.mutation<RefreshResponse, RefreshTokenData>({
      query: ({ refreshToken }) => ({
        url: '/refresh-token',  
        method: 'POST',
        body: { refreshToken },  // Токен передается в теле запроса
      }),
    }),
  }),
});

export const { useRefreshTokensMutation } = refreshApi;
