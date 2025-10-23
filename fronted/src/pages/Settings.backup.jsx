import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { updatePrivacySettings } from "../api/followApi";
import FollowRequests from "../components/FollowRequests";
import BlockedUsers from "../components/BlockedUsers";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
    
    // Cargar configuración de privacidad
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
      
      // Si viene un nuevo token, actualizarlo
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      // Actualizar localStorage y estado
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMsg({ text: "✅ Perfil actualizado correctamente", type: "success" });
      
      // Recargar después de 1.5s si cambió el username para actualizar las rutas
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
      
      // Actualizar usuario en localStorage
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
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMsg({ text: "❌ Solo se permiten imágenes", type: "error" });
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ text: "❌ La imagen no debe superar 5MB", type: "error" });
        return;
      }

      setAvatarFile(file);
      
      // Crear preview
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

      // Actualizar localStorage y estado
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

      // Actualizar localStorage y estado
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

  if (!user) return <p className="text-center mt-8">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cuenta y preferencias</p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4">
                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-800">{user.name || user.username}</h2>
                <p className="text-gray-600">@{user.username}</p>
                <Link
                  to={`/u/${user.username}`}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition w-full text-center"
                >
                  👁️ Ver mi portfolio
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Foto de perfil */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📸 Foto de perfil</h3>
              
              <div className="flex items-center gap-4 mb-4">
                {avatarPreview || user.avatarUrl ? (
                  <img 
                    src={avatarPreview || user.avatarUrl} 
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadingAvatar}
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF. Máximo 5MB.</p>
                </div>
              </div>

              <div className="flex gap-2">
                {avatarFile && (
                  <button
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                  >
                    {uploadingAvatar ? 'Subiendo...' : '💾 Guardar foto'}
                  </button>
                )}
                {user.avatarUrl && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition"
                  >
                    🗑️ Eliminar foto
                  </button>
                )}
              </div>
            </div>

            {/* Información del perfil */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Información del perfil</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Guardando..." : "💾 Guardar cambios"}
                </button>
              </form>
            </div>

            {/* Cambiar contraseña */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Cambiar contraseña</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Actualizando..." : "🔑 Cambiar contraseña"}
                </button>
              </form>
            </div>

            {/* Configuración de privacidad */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔐 Privacidad</h3>
              <form onSubmit={handleUpdatePrivacy} className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <label className="font-medium text-gray-700">Cuenta privada</label>
                    <p className="text-sm text-gray-500">
                      Requiere aprobación para seguirte
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={privacySettings.isPrivate}
                    onChange={handlePrivacyChange}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <label className="font-medium text-gray-700">Mostrar seguidores</label>
                    <p className="text-sm text-gray-500">
                      Permite que otros vean tu lista de seguidores
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="showFollowers"
                    checked={privacySettings.showFollowers}
                    onChange={handlePrivacyChange}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <label className="font-medium text-gray-700">Mostrar seguidos</label>
                    <p className="text-sm text-gray-500">
                      Permite que otros vean a quién sigues
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="showFollowing"
                    checked={privacySettings.showFollowing}
                    onChange={handlePrivacyChange}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <label className="font-medium text-gray-700">Permitir solicitudes</label>
                    <p className="text-sm text-gray-500">
                      Permite que te envíen solicitudes de seguimiento
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="allowFollowRequests"
                    checked={privacySettings.allowFollowRequests}
                    onChange={handlePrivacyChange}
                    className="w-5 h-5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Guardando..." : "💾 Guardar privacidad"}
                </button>
              </form>
            </div>

            {/* Solicitudes de seguimiento */}
            <div className="bg-white rounded-lg shadow p-6">
              <FollowRequests />
            </div>

            {/* Usuarios bloqueados */}
            <div className="bg-white rounded-lg shadow p-6">
              <BlockedUsers />
            </div>

            {/* Zona de peligro */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-800 mb-2">⚠️ Zona de peligro</h3>
              <p className="text-sm text-red-700 mb-4">
                Las siguientes acciones son irreversibles. Procede con precaución.
              </p>
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
                    // TODO: Implementar eliminación de cuenta
                    alert("Funcionalidad de eliminación de cuenta por implementar");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                🗑️ Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
