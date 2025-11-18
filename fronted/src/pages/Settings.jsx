import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../api/api";
import { updatePrivacySettings } from "../api/followApi";
import { deleteAccount, getNotificationPreferences, updateNotificationPreferences } from "../api/api";
import FollowRequests from "../components/FollowRequests";
import BlockedUsers from "../components/BlockedUsers";
import "../styles/Settings.scss";

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState(() => {
    const section = searchParams.get('section');
    return section || 'account';
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    showFollowers: true,
    showFollowing: true,
    allowFollowRequests: true,
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    likesEnabled: true,
    commentsEnabled: true,
    followsEnabled: true,
    followRequestsEnabled: true,
    messagesEnabled: true,
    desktopNotificationsEnabled: true,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const menuItems = [
    { id: 'account', icon: '👤', label: 'Administrar cuenta' },
    { id: 'privacy', icon: '🔒', label: 'Privacidad' },
    { id: 'notifications', icon: '🔔', label: 'Notificaciones push' },
    { id: 'follow-requests', icon: '👥', label: 'Solicitudes de seguimiento' },
    { id: 'blocked', icon: '🚫', label: 'Usuarios bloqueados' },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData({
      username: userData.username || "",
      email: userData.email || "",
      name: userData.name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    if (userData.privacy) {
      setPrivacySettings({
        isPrivate: userData.privacy.isPrivate === true,
        showFollowers: userData.privacy.showFollowers !== false,
        showFollowing: userData.privacy.showFollowing !== false,
        allowFollowRequests: userData.privacy.allowFollowRequests !== false,
      });
    }

    loadNotificationPreferences();
  }, [navigate]);

  const loadNotificationPreferences = async () => {
    try {
      const res = await getNotificationPreferences();
      setNotificationPreferences(res.data.notificationPreferences);
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      // Validar que las contraseñas coincidan si se intenta cambiar
      if (formData.newPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          setMsg({ text: "Debes ingresar tu contraseña actual", type: "error" });
          setLoading(false);
          return;
        }
        if (!formData.newPassword) {
          setMsg({ text: "Debes ingresar una nueva contraseña", type: "error" });
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setMsg({ text: "Las contraseñas nuevas no coinciden", type: "error" });
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setMsg({ text: "La nueva contraseña debe tener al menos 6 caracteres", type: "error" });
          setLoading(false);
          return;
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
      };

      // Solo incluir contraseñas si se están cambiando
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const res = await API.put("/auth/profile", updateData);

      // Actualizar token si fue generado uno nuevo
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Actualizar usuario en localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      // Notificar a App.jsx que el usuario se actualizó
      window.dispatchEvent(new Event('user-updated'));

      // Limpiar campos de contraseña después de actualizar
      setFormData({
        ...formData,
        username: res.data.user.username,
        email: res.data.user.email,
        name: res.data.user.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMsg({ text: "Perfil actualizado exitosamente", type: "success" });

      // Scroll al mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error updating profile:", err);
      setMsg({
        text: err.response?.data?.error || "Error al actualizar perfil",
        type: "error",
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivacy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await updatePrivacySettings(privacySettings);
      
      // Actualizar localStorage con la privacidad actualizada
      const updatedUser = { ...user, privacy: privacySettings };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Notificar a App.jsx que el usuario se actualizó
      window.dispatchEvent(new Event('user-updated'));
      
      setMsg({ text: "Configuración de privacidad actualizada", type: "success" });
    } catch (err) {
      console.error("Error updating privacy:", err);
      setMsg({
        text: err.response?.data?.error || "Error al actualizar privacidad",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await updateNotificationPreferences(notificationPreferences);
      setMsg({ text: "Preferencias de notificación actualizadas", type: "success" });
    } catch (err) {
      console.error("Error updating notifications:", err);
      setMsg({
        text: err.response?.data?.error || "Error al actualizar notificaciones",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setMsg({ text: "", type: "" });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", avatarFile);

      const res = await API.post("/users/avatar", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      
      // Notificar a App.jsx que el usuario se actualizó
      window.dispatchEvent(new Event('user-updated'));
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setMsg({ text: "Avatar actualizado exitosamente", type: "success" });
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setMsg({
        text: err.response?.data?.error || "Error al subir avatar",
        type: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMsg({ text: "Por favor ingresa tu contraseña", type: "error" });
      return;
    }

    setDeletingAccount(true);
    setMsg({ text: "", type: "" });

    try {
      await deleteAccount(deletePassword);
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
      setMsg({
        text: err.response?.data?.error || "Error al eliminar cuenta",
        type: "error",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <Link to="/" className="back-btn">
            ←
          </Link>
          <h1>Configuración</h1>
        </div>

        <div className="settings-wrapper">
          {/* SIDEBAR IZQUIERDO */}
          <aside className="settings-sidebar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </aside>

          {/* CONTENIDO PRINCIPAL DERECHO */}
          <main className="settings-content">
            {/* Mensaje de feedback */}
            {msg.text && (
              <div className={`message ${msg.type}`}>
                {msg.text}
              </div>
            )}

            {/* SECCIÓN: ADMINISTRAR CUENTA */}
            {activeSection === 'account' && (
              <div>
                <h2>Administrar cuenta</h2>

                {user && (
                  <>
                    {/* Avatar */}
                    <div className="avatar-section">
                      <div className="avatar-preview">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" />
                        ) : user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="avatar-upload">
                        <label>Cambiar avatar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <button
                          type="button"
                          onClick={handleUploadAvatar}
                          disabled={!avatarFile || uploadingAvatar}
                        >
                          {uploadingAvatar ? "Subiendo..." : "Subir avatar"}
                        </button>
                      </div>
                    </div>

                    {/* Formulario de información */}
                    <form onSubmit={handleUpdateProfile}>
                      <div className="form-group">
                        <label>Nombre de usuario</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Nombre completo</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Contraseña actual</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="Deixa en blanco si no quieres cambiarla"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Nueva contraseña</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Deixa en blanco si no quieres cambiarla"
                          />
                        </div>

                        <div className="form-group">
                          <label>Confirmar contraseña</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirma tu contraseña"
                          />
                        </div>
                      </div>

                      <div className="button-group">
                        <button type="submit" disabled={loading}>
                          {loading ? "Guardando..." : "Actualizar perfil"}
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        >
                          Eliminar cuenta
                        </button>
                      </div>

                      {showDeleteConfirm && (
                        <div className="message error" style={{ marginTop: "20px" }}>
                          <p>⚠️ Esta acción es irreversible. Escribe tu contraseña para confirmar:</p>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Contraseña"
                            style={{ marginTop: "10px", marginBottom: "10px" }}
                          />
                          <div className="button-group">
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={handleDeleteAccount}
                              disabled={deletingAccount}
                            >
                              {deletingAccount ? "Eliminando..." : "Confirmar eliminación"}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletePassword("");
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            )}

            {/* SECCIÓN: PRIVACIDAD */}
            {activeSection === 'privacy' && (
              <div>
                <h2>Configuración de privacidad</h2>
                <form onSubmit={handleUpdatePrivacy}>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={privacySettings.isPrivate}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, isPrivate: e.target.checked })}
                      />
                      <label htmlFor="isPrivate">Cuenta privada</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="showFollowers"
                        checked={privacySettings.showFollowers}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showFollowers: e.target.checked })}
                      />
                      <label htmlFor="showFollowers">Mostrar lista de seguidores</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="showFollowing"
                        checked={privacySettings.showFollowing}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showFollowing: e.target.checked })}
                      />
                      <label htmlFor="showFollowing">Mostrar lista de seguidos</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="allowFollowRequests"
                        checked={privacySettings.allowFollowRequests}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowFollowRequests: e.target.checked })}
                      />
                      <label htmlFor="allowFollowRequests">Permitir solicitudes de seguimiento</label>
                    </div>
                  </div>

                  <div className="button-group">
                    <button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECCIÓN: NOTIFICACIONES */}
            {activeSection === 'notifications' && (
              <div>
                <h2>Preferencias de notificaciones</h2>
                <form onSubmit={handleUpdateNotifications}>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="likesEnabled"
                        checked={notificationPreferences.likesEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, likesEnabled: e.target.checked })}
                      />
                      <label htmlFor="likesEnabled">Notificar de likes</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="commentsEnabled"
                        checked={notificationPreferences.commentsEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, commentsEnabled: e.target.checked })}
                      />
                      <label htmlFor="commentsEnabled">Notificar de comentarios</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="followsEnabled"
                        checked={notificationPreferences.followsEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, followsEnabled: e.target.checked })}
                      />
                      <label htmlFor="followsEnabled">Notificar de nuevos seguidores</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="followRequestsEnabled"
                        checked={notificationPreferences.followRequestsEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, followRequestsEnabled: e.target.checked })}
                      />
                      <label htmlFor="followRequestsEnabled">Notificar de solicitudes de seguimiento</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="messagesEnabled"
                        checked={notificationPreferences.messagesEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, messagesEnabled: e.target.checked })}
                      />
                      <label htmlFor="messagesEnabled">Notificar de mensajes</label>
                    </div>

                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        id="desktopNotificationsEnabled"
                        checked={notificationPreferences.desktopNotificationsEnabled}
                        onChange={(e) => setNotificationPreferences({ ...notificationPreferences, desktopNotificationsEnabled: e.target.checked })}
                      />
                      <label htmlFor="desktopNotificationsEnabled">Notificaciones de escritorio</label>
                    </div>
                  </div>

                  <div className="button-group">
                    <button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar preferencias"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECCIÓN: SOLICITUDES DE SEGUIMIENTO */}
            {activeSection === 'follow-requests' && (
              <div>
                <h2>Solicitudes de seguimiento</h2>
                <FollowRequests />
              </div>
            )}

            {/* SECCIÓN: USUARIOS BLOQUEADOS */}
            {activeSection === 'blocked' && (
              <div>
                <h2>Usuarios bloqueados</h2>
                <BlockedUsers />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
