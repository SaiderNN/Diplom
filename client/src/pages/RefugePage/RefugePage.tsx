// src/pages/RefugePage.tsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useLocation, useNavigate } from "react-router-dom";
import "./RefugePage.css";
import { setConnections, setCurrentConnection } from "../../slice/sshConnectionSlice";
import { useGetSessionsQuery, useDeleteSessionMutation } from "../../api/sshApi";
import { useGetUserIdQuery } from "../../api/profileApi";
import { setUserId } from "../../slice/profileSlice";

const RefugePage = () => {
  const connections = useSelector((state: RootState) => state.ssh.connections);
  const sortedConnections = [...connections].sort((a, b) => a.sessionId - b.sessionId); // или по другим полям
  const currentConnection = useSelector((state: RootState) => state.ssh.currentConnection);
  const profileId = useSelector((state: RootState) => state.profile.userId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [session, setSession] = useState<number | null>(null);
  const location = useLocation();

  const { data: userData } = useGetUserIdQuery();
  const { data: sessionsData, isLoading, refetch, 
  } = useGetSessionsQuery(profileId!, {
    skip: profileId === null,
  });
  const [deleteSession] = useDeleteSessionMutation();

  useEffect(() => {
    if (userData?.id !== undefined && userData?.id !== null) {
      dispatch(setUserId(userData.id));
    } else {
      navigate("/login");
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (profileId) {
      refetch();
    }
  }, [profileId]);

  useEffect(() => {
    if (sessionsData) {
      dispatch(setConnections(sessionsData));
    }
  }, [sessionsData, dispatch]);

  const handleOpenTerminal = (connectionId: number, connectionHost: string, connectionUsername: string) => {
    dispatch(setCurrentConnection({
      sessionId: connectionId,
      host: connectionHost,
      username: connectionUsername,
    }));
    setSession(connectionId); 
    navigate("/terminal"); 
  };

  const handleCreateNewConnection = () => {
    navigate("/connect/new");
  };

  const handleEditConnection = (event: React.MouseEvent, sessionId: number) => {
    event.stopPropagation(); 
    const connection = connections.find(c => c.sessionId === sessionId);
    if (connection) {
      navigate("/connect/new", {
        state: {
          edit: true,
          data: connection,
        },
      });
    }
  };

  const handleDeleteConnection = async (event: React.MouseEvent, sessionId: number) => {
    event.stopPropagation(); 
    try {
      await deleteSession(sessionId.toString()).unwrap();
    } catch (error) {
      console.error("Ошибка при удалении сессии:", error);
    }
  };

  return (
    <div className="refuge-page">
      <h2>Ваши SSH-сессии</h2>
      <div className="connection-list">
  
        {sortedConnections.map((conn) => (
          <div key={conn.sessionId} className="connection-card"  onClick={() => handleOpenTerminal(conn.sessionId, conn.host, conn.username)}>
            <div
              className="connection-info"
            >
              <p><strong>{conn.username}</strong>@{conn.host}:22</p>
            </div>
            <div className="card-actions">
              <button onClick={(e) => handleEditConnection(e, conn.sessionId)}>✏️</button>
              <button onClick={(e) => handleDeleteConnection(e, conn.sessionId)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <button className="create-connection-button" onClick={handleCreateNewConnection}>
        Добавить подключение
      </button>
    </div>
  );
};

export default RefugePage;
