import { configureStore } from "@reduxjs/toolkit";
import { sshApi } from "../api/sshApi";

export const store = configureStore({
  reducer: {
    [sshApi.reducerPath]: sshApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sshApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
