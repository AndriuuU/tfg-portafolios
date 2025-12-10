import { useState, useEffect } from 'react';
import { getReports, getReportStats, updateReportStatus, processReportAction, getSuspendedUsers, reactivateUser } from '../api/api';
import { useToast } from '../context/ToastContext';
import API_URL from '../api/config';
import '../styles/AdminPanel.scss';

export default function AdminPanel() {
  const { showToast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser._id || currentUser.id;
  
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [actionData, setActionData] = useState({ action: '', reason: '' });
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProjects, setShowUserProjects] = useState(false);
  const [userProjects, setUserProjects] = useState([]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
      fetchStats();
    } else if (activeTab === 'users') {
      fetchSuspendedUsers();
    } else if (activeTab === 'manage-users') {
      fetchAllUsers();
    }
  }, [activeTab, filter, page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports({ status: filter !== 'all' ? filter : undefined, page, limit: 20 });
      setReports(res.data.reports);
    } catch (error) {
      showToast('Error al cargar reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getReportStats();
      setStats(res.data);
    } catch (error) {
      // Error silencioso para stats
    }
  };

  const fetchSuspendedUsers = async () => {
    try {
      setLoading(true);
      const res = await getSuspendedUsers(filter);
      setSuspendedUsers(res.data);
    } catch (error) {
      showToast('Error al cargar usuarios suspendidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId) => {
    if (!actionData.action) {
      showToast('Selecciona una acción', 'warning');
      return;
    }

    // Confirmación adicional para acciones destructivas
    const destructiveActions = ['content_removed', 'account_banned'];
    if (destructiveActions.includes(actionData.action)) {
      const confirmMsg = actionData.action === 'content_removed' 
        ? '¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.'
        : '¿Estás seguro de que quieres banear esta cuenta? Esta acción es permanente.';
      
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    try {
      const response = await processReportAction(reportId, actionData);
      showToast(`✅ ${response.data.message || 'Acción procesada correctamente'}`, 'success');
      setSelectedReport(null);
      setActionData({ action: '', reason: '' });
      fetchReports();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al procesar la acción';
      showToast(`❌ ${errorMsg}`, 'error');
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setAllUsers(data);
    } catch (error) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    // No permitir que te quites el admin a ti mismo
    if (userId === currentUserId && currentStatus) {
      showToast('❌ No puedes revocar tus propios permisos de admin', 'error');
      return;
    }

    const action = currentStatus ? 'revocar' : 'otorgar';
    if (window.confirm(`¿Estás seguro de que quieres ${action} permisos de administrador?`)) {
      try {
        const res = await fetch(`${API_URL}/api/admin/users/${userId}/admin`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isAdmin: !currentStatus })
        });
        
        if (!res.ok) throw new Error('Error al actualizar permisos');
        
        showToast(`✅ Permisos de admin ${currentStatus ? 'revocados' : 'otorgados'} correctamente`, 'success');
        fetchAllUsers();
      } catch (error) {
        showToast('Error al actualizar permisos', 'error');
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === suspendedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(suspendedUsers.map(u => u._id));
    }
  };

  const handleReactivateUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
      try {
        await reactivateUser({ userId });
        showToast('✅ Usuario reactivado correctamente', 'success');
        fetchSuspendedUsers();
        setSelectedUsers([]);
      } catch (error) {
        showToast('Error al reactivar usuario', 'error');
      }
    }
  };

  const handleReactivateMultiple = async () => {
    if (selectedUsers.length === 0) {
      showToast('Selecciona al menos un usuario', 'warning');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres reactivar ${selectedUsers.length} usuario(s)?`)) {
      try {
        const promises = selectedUsers.map(userId => 
          reactivateUser({ userId })
        );
        await Promise.all(promises);
        showToast(`✅ ${selectedUsers.length} usuario(s) reactivado(s) correctamente`, 'success');
        fetchSuspendedUsers();
        fetchAllUsers();
        setSelectedUsers([]);
      } catch (error) {
        showToast('Error al reactivar usuarios', 'error');
      }
    }
  };

  const handleSuspendUser = async (userId, reason, isAdmin) => {
    // No permitir suspenderte a ti mismo
    if (userId === currentUserId) {
      showToast('❌ No puedes suspenderte a ti mismo', 'error');
      return;
    }
    
    // No permitir suspender a otros admins
    if (isAdmin) {
      showToast('❌ No puedes suspender a otro administrador. Primero revoca sus permisos de admin', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      showToast('✅ Usuario suspendido correctamente', 'success');
      fetchAllUsers();
    } catch (error) {
      showToast('Error al suspender usuario', 'error');
    }
  };

  const handleBanUser = async (userId, reason, isAdmin) => {
    // No permitir banearte a ti mismo
    if (userId === currentUserId) {
      showToast('❌ No puedes banearte a ti mismo', 'error');
      return;
    }
    
    // No permitir banear a otros admins
    if (isAdmin) {
      showToast('❌ No puedes banear a otro administrador. Primero revoca sus permisos de admin', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      showToast('✅ Usuario baneado correctamente', 'success');
      fetchAllUsers();
    } catch (error) {
      showToast('Error al banear usuario', 'error');
    }
  };

  const handleDeleteUserAccount = async (userId, reason, isAdmin) => {
    // No permitir eliminarte a ti mismo
    if (userId === currentUserId) {
      showToast('❌ No puedes eliminar tu propia cuenta', 'error');
      return;
    }
    
    // No permitir eliminar a otros admins
    if (isAdmin) {
      showToast('❌ No puedes eliminar a otro administrador. Primero revoca sus permisos de admin', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/admin/users/${userId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      showToast('✅ Usuario eliminado correctamente', 'success');
      fetchAllUsers();
    } catch (error) {
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const fetchUserProjects = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserProjects(data);
    } catch (error) {
      showToast('Error al cargar proyectos', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    const reason = prompt('Razón de la eliminación del proyecto:');
    if (!reason) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        showToast('✅ Proyecto eliminado correctamente', 'success');
        fetchUserProjects(selectedUser._id);
      } catch (error) {
        showToast('Error al eliminar proyecto', 'error');
      }
    }
  };

  useEffect(() => {
    if (showUserProjects && selectedUser) {
      fetchUserProjects(selectedUser._id);
    }
  }, [showUserProjects, selectedUser]);

  const getReportTypeLabel = (type) => {
    const labels = { user: '👤 Usuario', project: '🎨 Proyecto', comment: '💬 Comentario' };
    return labels[type] || type;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: 'Spam',
      harassment: 'Acoso',
      hate_speech: 'Discurso de Odio',
      inappropriate_content: 'Contenido Inapropiado',
      copyright_violation: 'Violación de Derechos',
      fake_account: 'Cuenta Falsa',
      scam: 'Estafa',
      adult_content: 'Contenido para Adultos',
      other: 'Otro'
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', label: 'Pendiente' },
      reviewing: { class: 'badge-reviewing', label: 'Revisando' },
      resolved: { class: 'badge-resolved', label: 'Resuelto' },
      rejected: { class: 'badge-rejected', label: 'Rechazado' }
    };
    const badge = badges[status];
    return `<span class="badge ${badge.class}">${badge.label}</span>`;
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Panel de Administración</h1>
        <p>Gestión de reportes y usuarios</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 Reportes
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          🚫 Usuarios Suspendidos
        </button>
        <button 
          className={`tab ${activeTab === 'manage-users' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-users')}
        >
          👥 Gestionar Usuarios
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="admin-section">
          {/* Estadísticas */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Reportes</div>
              </div>
              <div className="stat-card pending">
                <div className="stat-number">{stats.pending}</div>
                <div className="stat-label">Pendientes</div>
              </div>
              <div className="stat-card reviewing">
                <div className="stat-number">{stats.reviewing}</div>
                <div className="stat-label">Revisando</div>
              </div>
              <div className="stat-card resolved">
                <div className="stat-number">{stats.resolved}</div>
                <div className="stat-label">Resueltos</div>
              </div>
              <div className="stat-card rejected">
                <div className="stat-number">{stats.rejected}</div>
                <div className="stat-label">Rechazados</div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="filters">
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="reviewing">Revisando</option>
              <option value="resolved">Resueltos</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>

          {/* Reportes */}
          {loading ? (
            <div className="loading">Cargando reportes...</div>
          ) : reports.length === 0 ? (
            <div className="no-data">No hay reportes disponibles</div>
          ) : (
            <div className="reports-list">
              {reports.map(report => (
                <div key={report._id} className="report-card">
                  <div className="report-header-card">
                    <div className="report-info">
                      <span className="report-type">{getReportTypeLabel(report.type)}</span>
                      <span className="report-reason">{getReasonLabel(report.reason)}</span>
                      <span className="report-status" dangerouslySetInnerHTML={{ __html: getStatusBadge(report.status) }} />
                    </div>
                    <div className="report-date">
                      {new Date(report.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <div className="report-details">
                    <p><strong>Reportado por:</strong> @{report.reportedBy?.username}</p>
                    <p><strong>Descripción:</strong> {report.description}</p>
                    {report.targetUser && (
                      <p><strong>Usuario afectado:</strong> @{report.targetUser?.username}</p>
                    )}
                    {report.targetProject && (
                      <p><strong>Proyecto:</strong> {report.targetProject?.title}</p>
                    )}
                  </div>

                  <button 
                    className="btn-details"
                    onClick={() => setSelectedReport(report)}
                  >
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modal de detalles del reporte */}
          {selectedReport && (
            <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Detalles del Reporte</h2>
                  <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="detail-group">
                    <label>Tipo de Reporte:</label>
                    <span>{getReportTypeLabel(selectedReport.type)}</span>
                  </div>

                  <div className="detail-group">
                    <label>Razón:</label>
                    <span>{getReasonLabel(selectedReport.reason)}</span>
                  </div>

                  <div className="detail-group">
                    <label>Estado:</label>
                    <span dangerouslySetInnerHTML={{ __html: getStatusBadge(selectedReport.status) }} />
                  </div>

                  <div className="detail-group">
                    <label>Descripción:</label>
                    <p className="description">{selectedReport.description}</p>
                  </div>

                  <div className="detail-group">
                    <label>Reportado por:</label>
                    <span>@{selectedReport.reportedBy?.username} ({selectedReport.reportedBy?.email})</span>
                  </div>

                  {selectedReport.adminNotes && (
                    <div className="detail-group">
                      <label>Notas del Admin:</label>
                      <p>{selectedReport.adminNotes}</p>
                    </div>
                  )}

                  {selectedReport.status === 'pending' && (
                    <div className="action-section">
                      <h3>⚠️ Tomar Acción</h3>
                      
                      <div className="action-info">
                        <p><strong>Selecciona una acción:</strong></p>
                        <ul>
                          <li><strong>Advertencia:</strong> Registra un aviso al usuario (sin sanciones)</li>
                          <li><strong>Eliminar Contenido:</strong> Elimina el proyecto, comentario o usuario</li>
                          <li><strong>Suspender Cuenta:</strong> Bloquea temporalmente la cuenta</li>
                          <li><strong>Banear Cuenta:</strong> Elimina permanentemente la cuenta del sistema</li>
                        </ul>
                      </div>
                      
                      <div className="form-group">
                        <label>Acción:</label>
                        <select 
                          value={actionData.action}
                          onChange={(e) => setActionData({...actionData, action: e.target.value})}
                          className="action-select"
                        >
                          <option value="">Selecciona una acción...</option>
                          <option value="warning">⚡ Advertencia</option>
                          <option value="content_removed">🗑️ Eliminar Contenido</option>
                          <option value="account_suspended">🔒 Suspender Cuenta</option>
                          <option value="account_banned">🚫 Banear Cuenta</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Notas / Razón {actionData.action && '(obligatorio para documentar)'}:</label>
                        <textarea 
                          value={actionData.reason}
                          onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                          placeholder="Escribe por qué tomas esta acción. Esto será guardado en el reporte..."
                          rows="4"
                          className="action-textarea"
                        />
                      </div>

                      <div className="modal-actions">
                        <button 
                          className="btn-action"
                          onClick={() => handleReportAction(selectedReport._id)}
                        >
                          Procesar Acción
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => setSelectedReport(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="filters-row">
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value); setSelectedUsers([]); }}
              className="filter-select"
            >
              <option value="suspended">🔒 Suspendidos</option>
              <option value="banned">🚫 Baneados</option>
              <option value="deleted">🗑️ Eliminados</option>
            </select>

            {suspendedUsers.length > 0 && (
              <div className="bulk-actions">
                <button 
                  onClick={handleSelectAll}
                  className="btn-select-all"
                >
                  {selectedUsers.length === suspendedUsers.length ? '☑️ Deseleccionar todos' : '☐ Seleccionar todos'}
                </button>
                {selectedUsers.length > 0 && (
                  <button 
                    onClick={handleReactivateMultiple}
                    className="btn-reactivate-multiple"
                  >
                    ✓ Reactivar {selectedUsers.length} usuario(s)
                  </button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : suspendedUsers.length === 0 ? (
            <div className="no-data">
              No hay usuarios {filter === 'suspended' ? 'suspendidos' : filter === 'banned' ? 'baneados' : 'eliminados'}
            </div>
          ) : (
            <div className="users-list">
              {suspendedUsers.map(user => (
                <div key={user._id} className={`user-card ${selectedUsers.includes(user._id) ? 'selected' : ''}`}>
                  <input 
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                    className="user-checkbox"
                  />
                  
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <div className="user-header">
                      <div className="user-name">{user.name}</div>
                      {user.isDeleted && <span className="badge badge-deleted">🗑️ Eliminado</span>}
                      {user.isBanned && <span className="badge badge-banned">🚫 Baneado</span>}
                      {user.isSuspended && <span className="badge badge-suspended">🔒 Suspendido</span>}
                    </div>
                    <div className="user-username">@{user.username}</div>
                    <div className="user-email">{user.email}</div>
                    {user.bio && <div className="user-bio">{user.bio}</div>}
                    <div className="user-stats">
                      <span>📅 Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                      <span>📁 Proyectos: {user.projectCount || 0}</span>
                    </div>
                    
                    {user.isSuspended && (
                      <div className="status-info suspension-info">
                        <div className="status-reason"><strong>Razón:</strong> {user.suspensionReason}</div>
                        <div className="status-date"><strong>Desde:</strong> {new Date(user.suspensionDate).toLocaleDateString('es-ES')}</div>
                      </div>
                    )}
                    
                    {user.isBanned && (
                      <div className="status-info ban-info">
                        <div className="status-reason"><strong>Razón:</strong> {user.banReason}</div>
                        <div className="status-date"><strong>Desde:</strong> {new Date(user.banDate).toLocaleDateString('es-ES')}</div>
                      </div>
                    )}
                    
                    {user.isDeleted && (
                      <div className="status-info deleted-info">
                        <div className="status-reason"><strong>Razón:</strong> {user.deletedReason}</div>
                        <div className="status-date"><strong>Desde:</strong> {new Date(user.deletedAt).toLocaleDateString('es-ES')}</div>
                      </div>
                    )}
                    
                    {user.warnings && user.warnings.length > 0 && (
                      <div className="warnings-section">
                        <strong>⚠️ Advertencias ({user.warnings.length}):</strong>
                        <ul className="warnings-list">
                          {user.warnings.slice(-3).reverse().map((warning, idx) => (
                            <li key={idx}>
                              <span className="warning-date">{new Date(warning.date).toLocaleDateString('es-ES')}</span>: {warning.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn-reactivate"
                    onClick={() => handleReactivateUser(user._id)}
                  >
                    ✓ Reactivar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage-users' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>👥 Gestión de Usuarios</h2>
            <input 
              type="text" 
              placeholder="🔍 Buscar por nombre, usuario o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : (
            <div className="users-list">
              {allUsers
                .filter(user => 
                  user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(user => (
                  <div key={user._id} className={`user-card ${user.isDeleted ? 'deleted' : user.isBanned ? 'banned' : user.isSuspended ? 'suspended' : ''}`}>
                    <div className="user-info-expanded">
                      {user.avatarUrl && (
                        <img src={user.avatarUrl} alt={user.username} className="user-avatar" />
                      )}
                      {!user.avatarUrl && (
                        <div className="avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-header">
                          <div className="user-name">{user.name}</div>
                          {user.isAdmin && <span className="badge badge-admin">👮 Admin</span>}
                          {user.isSuspended && <span className="badge badge-warning">⏸️ Suspendido</span>}
                          {user.isBanned && <span className="badge badge-danger">🚫 Baneado</span>}
                          {user.isDeleted && <span className="badge badge-danger">🗑️ Eliminado</span>}
                        </div>
                        <div className="user-username">@{user.username}</div>
                        <div className="user-email">{user.email}</div>
                        {user.bio && <div className="user-bio">{user.bio}</div>}
                        <div className="user-stats">
                          <span>📅 Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                          {user.projectCount !== undefined && (
                            <span>📁 {user.projectCount} proyecto{user.projectCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        {user.suspensionReason && (
                          <div className="user-reason">
                            <strong>Razón suspensión:</strong> {user.suspensionReason}
                          </div>
                        )}
                        {user.banReason && (
                          <div className="user-reason">
                            <strong>Razón baneo:</strong> {user.banReason}
                          </div>
                        )}
                        {user.deletedReason && (
                          <div className="user-reason">
                            <strong>Razón eliminación:</strong> {user.deletedReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="user-actions">
                      <button 
                        className={`btn-admin-toggle ${user.isAdmin ? 'revoke' : 'grant'}`}
                        onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                      >
                        {user.isAdmin ? '❌ Revocar Admin' : '✅ Hacer Admin'}
                      </button>
                      
                      {!user.isSuspended && !user.isBanned && !user.isDeleted && (
                        <>
                          <button 
                            className="btn-suspend"
                            onClick={() => {
                              const reason = prompt('Razón de la suspensión:');
                              if (reason) handleSuspendUser(user._id, reason, user.isAdmin);
                            }}
                            disabled={user._id === currentUserId || user.isAdmin}
                            title={user._id === currentUserId ? 'No puedes suspenderte a ti mismo' : user.isAdmin ? 'Revoca primero los permisos de admin' : ''}
                          >
                            ⏸️ Suspender
                          </button>
                          <button 
                            className="btn-ban"
                            onClick={() => {
                              const reason = prompt('Razón del baneo permanente:');
                              if (reason && confirm('¿Estás seguro de banear permanentemente a este usuario?')) {
                                handleBanUser(user._id, reason, user.isAdmin);
                              }
                            }}
                            disabled={user._id === currentUserId || user.isAdmin}
                            title={user._id === currentUserId ? 'No puedes banearte a ti mismo' : user.isAdmin ? 'Revoca primero los permisos de admin' : ''}
                          >
                            🚫 Banear
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              const reason = prompt('Razón de la eliminación:');
                              if (reason && confirm('¿Estás seguro de eliminar esta cuenta?')) {
                                handleDeleteUserAccount(user._id, reason, user.isAdmin);
                              }
                            }}
                            disabled={user._id === currentUserId || user.isAdmin}
                            title={user._id === currentUserId ? 'No puedes eliminar tu propia cuenta' : user.isAdmin ? 'Revoca primero los permisos de admin' : ''}
                          >
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                      
                      {(user.isSuspended || user.isBanned || user.isDeleted) && (
                        <button 
                          className="btn-reactivate"
                          onClick={() => handleReactivateUser(user._id)}
                        >
                          ✅ Reactivar
                        </button>
                      )}
                      
                      <button 
                        className="btn-view-projects"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserProjects(true);
                        }}
                      >
                        📁 Ver Proyectos ({user.projectCount || 0})
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {showUserProjects && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserProjects(false)}>
          <div className="modal-content projects-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📁 Proyectos de {selectedUser.username}</h2>
              <button className="btn-close" onClick={() => setShowUserProjects(false)}>✕</button>
            </div>
            <div className="modal-body">
              {userProjects.length === 0 ? (
                <p className="no-data">Este usuario no tiene proyectos</p>
              ) : (
                <div className="projects-grid">
                  {userProjects.map(project => (
                    <div key={project._id} className="project-card">
                      {project.images && project.images[0] && (
                        <img src={project.images[0]} alt={project.title} className="project-thumbnail" />
                      )}
                      <div className="project-info">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="project-stats">
                          <span>❤️ {project.likes?.length || 0} likes</span>
                          <span>💬 {project.comments?.length || 0} comentarios</span>
                          <span>📅 {new Date(project.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      <button 
                        className="btn-delete-project"
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
