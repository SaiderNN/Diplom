import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TermState {
  theme: "dark" | "light";
}

const initialState: TermState = {
  theme: "light"
};
const termSlice = createSlice({
  name: "term",
  initialState,
  reducers: {
    setTermTheme(state, action: PayloadAction<"dark" | "light">) {
        state.theme = action.payload;
    }
}});

export const {setTermTheme} = termSlice.actions;
export default termSlice.reducer;