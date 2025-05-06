import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Тип для состояния профиля
interface ProfileState {
  userId: number | null;
}

// Начальное состояние
const initialState: ProfileState = {
  userId: null,
};

// Создание слайса профиля
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUserId(state, action: PayloadAction<number|null>) {
      state.userId = action.payload;
    },
    resetUserId(state) {
      state.userId = null;
    },
  },
});

// Экспортируем действия для работы с состоянием
export const { setUserId, resetUserId } = profileSlice.actions;

// Экспортируем редьюсер для добавления в store
export default profileSlice.reducer;
