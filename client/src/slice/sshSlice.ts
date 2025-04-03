// src/redux/sshSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SshState {
  isConnected: boolean;
  commandOutput: string;
  errorMessage: string;
}

const initialState: SshState = {
  isConnected: false,
  commandOutput: '',
  errorMessage: '',
};

const sshSlice = createSlice({
  name: 'ssh',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setCommandOutput(state, action: PayloadAction<string>) {
      state.commandOutput = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
    },
  },
});

export const { setConnectionStatus, setCommandOutput, setErrorMessage } = sshSlice.actions;

export default sshSlice.reducer;
