import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { updatePrivacySettings } from "../api/followApi";
import { deleteAccount } from "../api/api";
import FollowRequests from "../components/FollowRequests";
import BlockedUsers from "../components/BlockedUsers";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('account');
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

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
        isPrivate: userData.privacy.isPrivate || false,
        showFollowers: userData.privacy.showFollowers !== false,
        showFollowing: userData.privacy.showFollowing !== false,
        allowFollowRequests: userData.privacy.allowFollowRequests !== false,
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
      };

      const res = await API.put("/auth/profile", updateData);
      
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMsg({ text: "✅ Perfil actualizado correctamente", type: "success" });
      
      if (formData.username !== user.username) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al actualizar perfil",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMsg({ text: "❌ Las contraseñas no coinciden", type: "error" });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMsg({ text: "❌ La contraseña debe tener al menos 6 caracteres", type: "error" });
      setLoading(false);
      return;
    }

    try {
      await API.put("/auth/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMsg({ text: "✅ Contraseña actualizada correctamente", type: "success" });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al cambiar contraseña",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({ ...privacySettings, [name]: checked });
  };

  const handleUpdatePrivacy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await updatePrivacySettings(privacySettings);
      
      const updatedUser = { ...user, privacy: res.data.privacy };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMsg({ text: "✅ Configuración de privacidad actualizada", type: "success" });
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al actualizar privacidad",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMsg({ text: "❌ Solo se permiten imágenes", type: "error" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMsg({ text: "❌ La imagen no debe superar 5MB", type: "error" });
        return;
      }

      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      setMsg({ text: "❌ Selecciona una imagen primero", type: "error" });
      return;
    }

    setUploadingAvatar(true);
    setMsg({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await API.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMsg({ text: "✅ Foto de perfil actualizada", type: "success" });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al subir foto",
        type: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('¿Estás seguro de eliminar tu foto de perfil?')) return;

    setUploadingAvatar(true);
    setMsg({ text: "", type: "" });

    try {
      await API.delete('/auth/avatar');

      const updatedUser = { ...user, avatarUrl: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMsg({ text: "✅ Foto de perfil eliminada", type: "success" });
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al eliminar foto",
        type: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeletingAccount(true);
    setMsg({ text: "", type: "" });

    if (!deletePassword) {
      setMsg({ text: "❌ Por favor ingresa tu contraseña", type: "error" });
      setDeletingAccount(false);
      return;
    }

    try {
      await deleteAccount(deletePassword);

      // Limpiar localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setMsg({ text: "✅ Cuenta eliminada exitosamente. Adiós 👋", type: "success" });

      // Redirigir al home después de 2 segundos
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 2000);
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || "❌ Error al eliminar cuenta",
        type: "error",
      });
      setDeletingAccount(false);
    }
  };

  if (!user) return <p className="text-center mt-8">Cargando...</p>;

  const menuItems = [
    { id: 'account', icon: '👤', label: 'Administrar cuenta' },
    { id: 'privacy', icon: '🔒', label: 'Política de privacidad' },
    { id: 'notifications', icon: '🔔', label: 'Notificaciones push' },
    { id: 'follow-requests', icon: '👥', label: 'Solicitudes de seguimiento' },
    { id: 'blocked', icon: '🚫', label: 'Usuarios bloqueados' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR IZQUIERDO */}
      <aside className="w-96 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header con botón volver */}
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Menú de navegación */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  activeSection === item.id
                    ? 'bg-gray-100 text-red-500 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-base">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DERECHO */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de feedback */}
          {msg.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                msg.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* SECCIÓN: ADMINISTRAR CUENTA */}
          {activeSection === 'account' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Administrar cuenta</h1>

              {/* Control de la cuenta */}
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Control de la cuenta</h2>
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Eliminar cuenta</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm("¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.")) {
                          alert("Funcionalidad por implementar");
                        }
                      }}
                      className="text-red-500 font-semibold hover:text-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </section>

              {/* Datos de la cuenta */}
              <section className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Datos de la cuenta</h2>
                
                {/* Foto de perfil */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  <div className="p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Foto de perfil</h3>
                    <div className="flex items-center gap-6 mb-4">
                      {avatarPreview || user.avatarUrl ? (
                        <img 
                          src={avatarPreview || user.avatarUrl} 
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                          {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          disabled={uploadingAvatar}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {avatarFile && (
                        <button
                          onClick={handleUploadAvatar}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm"
                        >
                          {uploadingAvatar ? 'Subiendo...' : 'Guardar'}
                        </button>
                      )}
                      {user.avatarUrl && (
                        <button
                          onClick={handleDeleteAvatar}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 text-sm"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del perfil */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </form>
                </div>
              </section>

              {/* Cambiar contraseña */}
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Cambiar contraseña</h2>
                <div className="bg-white rounded-lg border border-gray-200">
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
                    >
                      {loading ? "Actualizando..." : "Cambiar contraseña"}
                    </button>
                  </form>
                </div>
              </section>

              {/* Eliminar cuenta */}
              <section>
                <h2 className="text-base font-semibold text-red-600 mb-4">Zona de peligro</h2>
                <div className="bg-white rounded-lg border-2 border-red-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar cuenta</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de que esto es lo que quieres.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                      >
                        🗑️ Eliminar mi cuenta
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-3">⚠️ Confirmación requerida</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Esta acción eliminará permanentemente:
                        </p>
                        <ul className="text-sm text-red-700 mb-4 space-y-1 list-disc list-inside">
                          <li>Tu perfil y toda tu información personal</li>
                          <li>Todos tus proyectos y sus imágenes</li>
                          <li>Tus conexiones con otros usuarios</li>
                          <li>Todos tus comentarios y likes</li>
                        </ul>
                        
                        <form onSubmit={handleDeleteAccount} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-red-800 mb-2">
                              Ingresa tu contraseña para confirmar:
                            </label>
                            <input
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder="Tu contraseña"
                              className="w-full px-3 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={deletingAccount}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 text-sm font-medium"
                            >
                              {deletingAccount ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletePassword("");
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SECCIÓN: PRIVACIDAD */}
          {activeSection === 'privacy' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Política de privacidad</h1>

              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Visibilidad</h2>
                <div className="bg-white rounded-lg border border-gray-200">
                  <form onSubmit={handleUpdatePrivacy} className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Cuenta privada</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Con una cuenta privada, solo los usuarios que apruebes podrán seguirte y ver tus proyectos.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={privacySettings.isPrivate}
                          onChange={handlePrivacyChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Mostrar seguidores</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Permite que otros vean tu lista de seguidores
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          name="showFollowers"
                          checked={privacySettings.showFollowers}
                          onChange={handlePrivacyChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Mostrar seguidos</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Permite que otros vean a quién sigues
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          name="showFollowing"
                          checked={privacySettings.showFollowing}
                          onChange={handlePrivacyChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Permitir solicitudes</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Permite que te envíen solicitudes de seguimiento
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          name="allowFollowRequests"
                          checked={privacySettings.allowFollowRequests}
                          onChange={handlePrivacyChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
                      >
                        {loading ? "Guardando..." : "Guardar configuración"}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          )}

          {/* SECCIÓN: NOTIFICACIONES */}
          {activeSection === 'notifications' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Notificaciones push</h1>
              
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Notificaciones de escritorio</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Permitir en el navegador</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Sigue al tanto de las notificaciones sobre me gusta, comentarios, los videos más recientes, etc. en el escritorio. Puedes desactivarlas en cualquier momento.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Tus preferencias</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Tus preferencias se sincronizarán automáticamente con la aplicación TikTok.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">Interacciones</span>
                        <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                          <option>Todos</option>
                          <option>Amigos</option>
                          <option>Desactivado</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500">Me gusta, comentarios, nuevos seguidores, menciones y etiquetas</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* SECCIÓN: SOLICITUDES DE SEGUIMIENTO */}
          {activeSection === 'follow-requests' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Solicitudes de seguimiento</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <FollowRequests />
              </div>
            </div>
          )}

          {/* SECCIÓN: USUARIOS BLOQUEADOS */}
          {activeSection === 'blocked' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Usuarios bloqueados</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <BlockedUsers />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
