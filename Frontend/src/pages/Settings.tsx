import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SettingsPage = () => {
  // Estados das configurações
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [geofenceRadius, setGeofenceRadius] = useState(50);
  const [userRole, setUserRole] = useState("admin");

  const handleSave = () => {
    // Aqui você poderia chamar API para salvar configs
    toast.success("Configurações salvas com sucesso!");
  };

  const handleReset = () => {
    setTheme("light");
    setNotifications(true);
    setGeofenceRadius(50);
    setUserRole("admin");
    toast.success("Configurações restauradas para padrão!");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Geral</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Tema</label>
                <select
                  className="border rounded p-2"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span>Notificações</span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Configurações de Dispositivo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dispositivos</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium">Raio de Geofencing (m)</label>
                <input
                  type="number"
                  className="border rounded p-2"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 font-medium">Permissão do Usuário Padrão</label>
                <select
                  className="border rounded p-2"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="user">Usuário</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-4 mt-6">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">
            Salvar
          </Button>
          <Button onClick={handleReset} className="bg-gray-200 hover:bg-gray-300">
            Resetar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
