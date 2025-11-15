import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { mockService } from "@/services/mockService";

const SettingsPage = () => {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await mockService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    }
  };

  const handleSave = () => {
    toast.success("Configurações salvas!");
  };

  const handleReset = () => {
    setTheme("light");
    setNotifications(true);
    toast.success("Configurações restauradas!");
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error("Preencha usuário e senha");
      return;
    }

    try {
      await mockService.createUser(newUser);
      toast.success("Usuário criado!");
      setNewUser({ username: "", password: "", role: "user" });
      loadUsers();
    } catch {
      toast.error("Erro ao criar usuário");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await mockService.updateUser(editingUser.id, editingUser);
      toast.success("Usuário atualizado!");
      setEditingUser(null);
      loadUsers();
    } catch {
      toast.error("Erro ao atualizar usuário");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await mockService.deleteUser(id);
      toast.success("Usuário removido!");
      loadUsers();
    } catch {
      toast.error("Erro ao remover usuário");
    }
  };

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar fixo */}
      <Sidebar />

      {/* Conteúdo principal com compensação do sidebar */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Configurações</h1>

        {/* CONFIGURAÇÕES GERAIS */}
        <section className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">Preferências Gerais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium">Tema</label>
              <select
                className="border rounded p-2 w-full mt-1"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Notificações</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button className="bg-blue-600 text-white" onClick={handleSave}>
              Salvar
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Restaurar
            </Button>
          </div>
        </section>

        {/* GERENCIAMENTO DE USUÁRIOS */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Gerenciar Usuários</h2>

          {/* Novo usuário */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              className="border rounded p-2"
              placeholder="Usuário"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="password"
              className="border rounded p-2"
              placeholder="Senha"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              className="border rounded p-2"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="user">Usuário</option>
              <option value="viewer">Visualizador</option>
            </select>

            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCreateUser}>
              Criar usuário
            </Button>
          </div>

          {/* Lista */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left text-sm">
                <th className="p-2">Usuário</th>
                <th className="p-2">Papel</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b text-sm">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                  <td className="p-2 flex gap-3">
                    <Button size="sm" onClick={() => setEditingUser(u)} className="bg-blue-500 text-white">
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteUser(u.id)}
                      className="bg-red-500 text-white"
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4 animate-fadeIn">
                <h3 className="text-xl font-semibold">Editar Usuário</h3>

                <input
                  className="border rounded p-2 w-full"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Nova senha (opcional)"
                  className="border rounded p-2 w-full"
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                />

                <select
                  className="border rounded p-2 w-full"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="user">Usuário</option>
                  <option value="viewer">Visualizador</option>
                </select>

                <div className="flex justify-end gap-3">
                  <Button onClick={() => setEditingUser(null)}>Cancelar</Button>
                  <Button className="bg-blue-600 text-white" onClick={handleUpdateUser}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
