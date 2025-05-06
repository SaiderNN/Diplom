import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import "./RefugePage.css";
import XTermConsole from "../../components/Terminal/Terminal";
import { setConnections, setCurrentConnection } from "../../slice/sshConnectionSlice";
import { useGetSessionsQuery } from "../../api/sshApi";
import { useGetUserIdQuery } from "../../api/profileApi";
import { setUserId } from "../../slice/profileSlice";

const RefugePage = () => {
  const connections = useSelector((state: RootState) => state.ssh.connections);
  const currentConnection = useSelector((state: RootState) => state.ssh.currentConnection);
  const profileId = useSelector((state: RootState) => state.profile.userId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [session, setSession] = useState<number | null>(null);

  const { data: userData } = useGetUserIdQuery();
  const { data: sessionsData, isLoading } = useGetSessionsQuery(profileId!, {
    skip: profileId === null,
  });

  useEffect(() => {
    if (userData?.id !== undefined && userData?.id !== null) {
      dispatch(setUserId(userData.id));
    }else{
      navigate("/login");
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (sessionsData) {
      dispatch(setConnections(sessionsData));
    }
  }, [sessionsData, dispatch]);

  const handleOpenTerminal = (connectionId: number, connectionHost: string, connectionUsername: string) => {
    dispatch(setCurrentConnection({
      sessionId: connectionId,
      host: connectionHost,
      username: connectionUsername
    }));
    setSession(connectionId);
  };

  const handleCreateNewConnection = () => {
    navigate("/connect/new");
  };

  if (currentConnection !== null) {
    return (
      <div className="refuge-page">
        <XTermConsole sessionId={currentConnection.sessionId} />
      </div>
    );
  }

  function handleEditConnection(sessionId: number): void {
    throw new Error("Function not implemented.");
  }
  function handleDeleteConnection(sessionId: number): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="refuge-page">
      <h2>Ваши SSH-сессии</h2>
      <button className="create-connection-button" onClick={handleCreateNewConnection}>
        ➕ Новое подключение
      </button>
      <div className="connection-list">
  {connections.map((conn) => (
    <div key={conn.sessionId} className="connection-card">
      <div
        className="connection-info"
        onClick={() => handleOpenTerminal(conn.sessionId, conn.host, conn.username)}
      >
        <p><strong>{conn.username}</strong>@{conn.host}:22</p>
      </div>
      <div className="card-actions">
        <button onClick={() => handleEditConnection(conn.sessionId)}>✏️</button>
        <button onClick={() => handleDeleteConnection(conn.sessionId)}>🗑️</button>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default RefugePage;
