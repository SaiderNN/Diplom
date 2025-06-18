import { configureStore } from "@reduxjs/toolkit";
import { sshApi } from "../api/sshApi";
import { authApi } from "../api/authApi"; // Импорт API авторизации
import { refreshApi } from "../api/refreshApi";
import { profileApi } from "../api/profileApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from '../slice/authSlice'
import sshReducer from '../slice/sshConnectionSlice'
import profileReducer from '../slice/profileSlice'
import termReducer from '../slice/termSlice'

export const store = configureStore({
  reducer: {
    [sshApi.reducerPath]: sshApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [refreshApi.reducerPath]: refreshApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
     // Добавляем authApi в редюсеры

    auth: authReducer,
    ssh: sshReducer,
    profile: profileReducer,
    term: termReducer

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sshApi.middleware, authApi.middleware, refreshApi.middleware, profileApi.middleware), // Добавляем middleware для обоих API
});

// Настройка listeners для автоматического рефетчинга
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
