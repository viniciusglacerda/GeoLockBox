import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiService, User, Device } from "@/services/apiService";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"users" | "devices">("users");

  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: "",
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    name: "",
  });

  useEffect(() => {
    loadUsers();
    loadDevices();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    }
  };

  const loadDevices = async () => {
    try {
      const data = await apiService.getDevices();
      setDevices(data);
    } catch {
      toast.error("Erro ao carregar dispositivos");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error("Preencha usuário e senha");
      return;
    }
    try {
      await apiService.createUser(newUser);
      toast.success("Usuário criado!");
      setNewUser({ username: "", name: "", email: "", role: "user", password: "" });
      loadUsers();
    } catch {
      toast.error("Erro ao criar usuário");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await apiService.updateUser(editingUser.id!, editingUser);
      toast.success("Usuário atualizado!");
      setEditingUser(null);
      loadUsers();
    } catch {
      toast.error("Erro ao atualizar usuário");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await apiService.deleteUser(id);
      toast.success("Usuário removido!");
      loadUsers();
    } catch {
      toast.error("Erro ao remover usuário");
    }
  };

  const handleCreateDevice = async () => {
    if (!newDevice.name) {
      toast.error("Preencha o nome do dispositivo");
      return;
    }
    try {
      const deviceToCreate = {
        ...newDevice,
        status: "inactive",
        latitude: 0,
        longitude: 0,
        battery_level: 100,
        active: false,
        assigned_user_id: null,
        assigned_delivery_id: null,
        geofence: {
          center: [0, 0] as [number, number],
          radius_m: 0,
        },
      };

      await apiService.createDevice(deviceToCreate);
      toast.success("Dispositivo criado!");
      setNewDevice({ name: "" });
      loadDevices();
    } catch {
      toast.error("Erro ao criar dispositivo");
    }
  };

  const handleUpdateDevice = async () => {
    if (!editingDevice) return;
    try {
      await apiService.updateDevice(editingDevice.id!, editingDevice);
      toast.success("Dispositivo atualizado!");
      setEditingDevice(null);
      loadDevices();
    } catch {
      toast.error("Erro ao atualizar dispositivo");
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await apiService.deleteDevice(id);
      toast.success("Dispositivo removido!");
      loadDevices();
    } catch {
      toast.error("Erro ao remover dispositivo");
    }
  };

  return (
    <div className="flex bg-gray-100">
      <Sidebar />

      <main className="flex-1 ml-64 p-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento</h1>

        {/* Abas */}
        <div className="flex gap-4 mb-6">
          <Button
            className={`px-4 ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("users")}
          >
            Usuários
          </Button>
          <Button
            className={`px-4 ${activeTab === "devices" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("devices")}
          >
            Dispositivos
          </Button>
        </div>

        {activeTab === "users" && (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Gerenciar Usuários</h2>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <input
                className="border rounded p-2"
                placeholder="Usuário"
                value={newUser.username || ""}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input
                className="border rounded p-2"
                placeholder="Nome"
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                className="border rounded p-2"
                placeholder="Email"
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="password"
                className="border rounded p-2"
                placeholder="Senha"
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                className="border rounded p-2"
                value={newUser.role || "user"}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="driver">Motorista</option>
              </select>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCreateUser}>
                Criar
              </Button>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left text-sm">
                  <th className="p-2">Usuário</th>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Papel</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b text-sm">
                    <td className="p-2">{u.username}</td>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 capitalize">{u.role}</td>
                    <td className="p-2 flex gap-3">
                      <Button size="sm" onClick={() => setEditingUser(u)} className="bg-blue-500 text-white">
                        Editar
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteUser(u.id!)} className="bg-red-500 text-white">
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingUser && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4 animate-fadeIn">
                  <h3 className="text-xl font-semibold">Editar Usuário</h3>
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="Usuário"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  />
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="Nome"
                    value={editingUser.name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                  <input
                    className="border rounded p-2 w-full"
                    placeholder="Email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                  <input
                    type="password"
                    placeholder="Nova senha (opcional)"
                    className="border rounded p-2 w-full"
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  />
                  <select
                    className="border rounded p-2 w-full"
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="driver">Motorista</option>
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
        )}

        {activeTab === "devices" && (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Gerenciar Dispositivos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                className="border rounded p-2"
                placeholder="Nome do dispositivo"
                value={newDevice.name || ""}
                onChange={(e) => setNewDevice({ name: e.target.value })}
              />
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCreateDevice}>
                Criar
              </Button>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left text-sm">
                  <th className="p-2">ID</th>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Bateria</th>
                  <th className="p-2">Lat/Lng</th>
                  <th className="p-2">Usuário</th>
                  <th className="p-2">Geofence (m)</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id} className="border-b text-sm">
                    <td className="p-2">{d.id}</td>
                    <td className="p-2">{d.name}</td>
                    <td className="p-2 capitalize">{d.status}</td>
                    <td className="p-2">{d.battery_level}%</td>
                    <td className="p-2">{`${d.latitude}, ${d.longitude}`}</td>
                    <td className="p-2">{users.find((u) => u.id === d.assigned_user_id)?.username || "-"}</td>
                    <td className="p-2">{d.geofence?.radius_m || 0}</td>
                    <td className="p-2 flex gap-3">
                      <Button size="sm" onClick={() => setEditingDevice(d)} className="bg-blue-500 text-white">
                        Editar
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteDevice(d.id!)} className="bg-red-500 text-white">
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
