import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthData } from './authApi';



export interface UserIdResponse {
  id: number| null;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080/api/v1/user',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("access_token");
  
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
  
        return headers;
      }, 
    }), // Путь для работы с профилем пользователя
    endpoints: (builder) => ({
        getUserId: builder.query<UserIdResponse, void>({
          query: () => '/profile',
        }),
      }),
    });

export const { useGetUserIdQuery } = profileApi;
