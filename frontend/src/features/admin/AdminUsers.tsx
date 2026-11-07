import { useEffect, useState } from 'react';
import { 
  fetchUsersRequest, 
  updateUserRoleRequest, 
  deleteUserRequest,
  createUserRequest,
  type UserItem,
  type CreateUserPayload
} from './AdminUsers.api';
import { Shield, ShieldAlert, Trash2, UserCheck, UserPlus, X } from 'lucide-react';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserPayload>({
    username: '',
    password: '',
    role: 'student'
  });
  const [formError, setFormError] = useState<string | null>(null);


  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsersRequest();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: 'admin' | 'student') => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await updateUserRoleRequest(userId, newRole);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar rol');
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`¿Seguro que quieres eliminar al usuario ${username}?`)) return;
    try {
      await deleteUserRequest(userId);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newUser.password.length < 12) {
      setFormError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }

    try {
      await createUserRequest(newUser);
      setIsModalOpen(false);
      setNewUser({ username: '', password: '', role: 'student' });
      await loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear usuario');
    }
  };

  if (loading) return <div>Cargando lista de usuarios...</div>;

  return (
    <div className="admin-users-container">
      <section className="dashboard-intro">
        <div>
          <p className="dashboard-eyebrow">ADMINISTRACIÓN / USUARIOS</p>
          <h1>Gestión de Usuarios<span>.</span></h1>
          <p className="dashboard-subtitle">Administra cuentas de usario registradas en Open 3D Render.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
        >
          <UserPlus size={18} />
          <span>Crear Usuario</span>
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      <div className="jobs-table">
        <div className="jobs-table-header">
          <span>USUARIO</span>
          <span>ROL</span>
          <span>FECHA DE ALTA</span>
          <span>ACCIONES</span>
        </div>

        {users.map((u) => (
          <div className="job-row" key={u.id}>
            <span className="job-name">{u.username}</span>
            <span className={`job-status ${u.role}`}>
              {u.role === 'admin' ? <Shield size={14} /> : <UserCheck size={14} />}
              {u.role.toUpperCase()}
            </span>
            <span className="job-date">{new Date(u.created_at).toLocaleDateString()}</span>
            <span className="job-actions">
              <button
                type="button"
                className="btn-action"
                onClick={() => handleRoleToggle(u.id, u.role)}
                title="Cambiar Rol"
              >
                {u.role === 'admin' ? <ShieldAlert size={16} /> : <Shield size={16} />}
              </button>
              <button
                type="button"
                className="btn-action delete"
                onClick={() => handleDelete(u.id, u.username)}
                title="Eliminar usuario"
              >
                <Trash2 size={16} />
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* MODAL DE CREACIÓN */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo Usuario</h2>
              <button type="button" className="btn btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && <p className="error-message">{formError}</p>}

            <form onSubmit={handleCreateUser} className="modal-form">
              <label>
                Nombre de usuario
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="ej. juan_perez"
                />
              </label>

              <label>
                Contraseña (mínimo 12 caracteres)
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••••••"
                />
              </label>

              <label>
                Rol inicial
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'student' | 'admin' })}
                >
                  <option value="student">Estudiante</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );
}