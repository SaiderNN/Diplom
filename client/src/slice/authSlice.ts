import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('refresh_token'),
  isRefreshing: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { accessToken,  refreshToken, } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    },

    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

    },
    setIsRefreshing: (state, action: PayloadAction<boolean>) => {
        state.isRefreshing = action.payload; // Устанавливаем флаг загрузки
      }


  },
});

export const { setTokens, clearTokens, setIsRefreshing } = authSlice.actions;
export default authSlice.reducer;
