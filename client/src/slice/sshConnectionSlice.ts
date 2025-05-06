import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SshSession } from "../api/sshApi";


interface SshConnectionsState {
  connections: SshSession[];
  currentConnection: SshSession | null
}

const initialState: SshConnectionsState = {
  connections: [],
  currentConnection: null
};

const sshConnectionsSlice = createSlice({
  name: "sshConnections",
  initialState,
  reducers: {
    setConnections(state, action: PayloadAction<SshSession[]>) {
      state.connections = action.payload;
    },
    addConnection(state, action: PayloadAction<SshSession>) {
      state.connections.push(action.payload);
    },
    removeConnection(state, action: PayloadAction<number>) {
      state.connections = state.connections.filter(c => c.sessionId !== action.payload);
    },
    setCurrentConnection(state, action: PayloadAction<SshSession | null>) {
      state.currentConnection = action.payload;
  },
}});

export const { setConnections, addConnection, removeConnection, setCurrentConnection } = sshConnectionsSlice.actions;
export default sshConnectionsSlice.reducer;
