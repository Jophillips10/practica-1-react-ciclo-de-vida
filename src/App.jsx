import React, { useState, useEffect } from 'react';
import './App.css';

// Componente Hijo para demostrar Montaje, Actualización y Desmontaje
function UserList({ users, filterQuery }) {
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // 1. Ciclo de Vida: Montaje y Desmontaje
  useEffect(() => {
    addLog('🟢 COMPONENTE MONTADO (useEffect [] enviado)');
    
    return () => {
      // Función de limpieza -> Desmontaje
      console.log('🔴 COMPONENTE DESMONTADO');
    };
  }, []);

  // 2. Ciclo de Vida: Actualización
  useEffect(() => {
    if (logs.length > 0) {
      addLog(`🟡 COMPONENTE ACTUALIZADO (Filtro cambió a: "${filterQuery}")`);
    }
  }, [filterQuery]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    return <div className="card">⚠️ Sin resultados para la búsqueda.</div>;
  }

  return (
    <div>
      <div className="user-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card">
            <h3>{user.name}</h3>
            <p>📧 {user.email}</p>
            <p>🏢 {user.company?.name}</p>
          </div>
        ))}
      </div>

      <div className="logs-container">
        <strong>Registro de Ciclo de Vida:</strong>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Estados de carga requeridos
  const [status, setStatus] = useState('INITIAL'); // INITIAL, LOADING, SUCCESS, EMPTY, ERROR
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showComponent, setShowComponent] = useState(true);

  // Consumo de la API Pública
  const fetchData = async (simulateError = false, simulateEmpty = false) => {
    setStatus('LOADING');
    setErrorMsg('');
    setUsers([]);

    try {
      // Simulación de retraso de red de 1.5 segundos
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (simulateError) {
        throw new Error('Error 500: Fallo al conectar con el servidor.');
      }

      if (simulateEmpty) {
        setUsers([]);
        setStatus('EMPTY');
        return;
      }

      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) throw new Error('Error al obtener los datos');
      
      const data = await response.json();
      setUsers(data);
      setStatus('SUCCESS');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('ERROR');
    }
  };

  return (
    <div className="container">
      <h1>Demostración: Ciclo de Vida y Estados de Carga</h1>

      {/* Controles para probar los distintos estados */}
      <div className="controls">
        <button onClick={() => fetchData(false, false)}>🔄 Cargar Datos (Éxito)</button>
        <button onClick={() => fetchData(true, false)} className="btn-danger">⚠️ Simular Error</button>
        <button onClick={() => fetchData(false, true)} className="btn-secondary">📭 Simular Sin Resultados</button>
        <button onClick={() => setShowComponent(!showComponent)}>
          {showComponent ? '❌ Desmontar Componente' : '🟢 Montar Componente'}
        </button>
      </div>

      {/* Control de actualización */}
      {status === 'SUCCESS' && (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre (provoca actualización)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
          />
        </div>
      )}

      {/* Renderizado Condicional según Estado de Carga */}

      {status === 'INITIAL' && (
        <div className="card">
          ℹ️ <strong>Estado Inicial:</strong> Presiona "Cargar Datos" para iniciar.
        </div>
      )}

      {status === 'LOADING' && (
        <div>
          <div className="spinner"></div>
          <p style={{ textAlign: 'center' }}>Cargando usuarios desde la API...</p>
          {/* Skeleton Loader */}
          <div className="skeleton-card">
            <div className="skeleton-line" style={{ width: '60%' }}></div>
            <div className="skeleton-line" style={{ width: '40%' }}></div>
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="card" style={{ borderColor: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>
          <h3>❌ Ocurrió un error</h3>
          <p>{errorMsg}</p>
          <button onClick={() => fetchData(false, false)}>🔄 Volver a Intentar</button>
        </div>
      )}

      {status === 'EMPTY' && (
        <div className="card">
          📭 <strong>Sin resultados:</strong> No se encontraron registros en el servidor.
          <br /><br />
          <button onClick={() => fetchData(false, false)}>Reintentar</button>
        </div>
      )}

      {status === 'SUCCESS' && showComponent && (
        <UserList users={users} filterQuery={search} />
      )}
    </div>
  );
}