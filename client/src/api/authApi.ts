import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RefreshResponse } from './refreshApi';


export interface AuthData {
    email: string; 
    password: string; 
  }

export interface RegData {
    firstname: string;
    lastname: string;
    email: string; 
    password: string; 
  }  
  
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1/auth' }),
  endpoints: (builder) => ({
    login: builder.mutation<RefreshResponse, AuthData >({
      query: (credentials) => ({
        url: '/authorize',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RefreshResponse, RegData>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
