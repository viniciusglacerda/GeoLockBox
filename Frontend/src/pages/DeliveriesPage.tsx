import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Package, Plus, MapPin, User, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { mockService } from "@/services/mockService";
import { toast } from "sonner";

interface Delivery {
  id: string;
  receiver_name?: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  status?: string;
  device_id?: string;
  geofence_radius?: number;
}

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function loadData() {
    try {
      const data = await mockService.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      toast.error("Erro ao carregar entregas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete() {
    if (!confirmId) return;

    try {
      await mockService.deleteDelivery(confirmId);
      toast.success("Entrega excluída com sucesso!");

      setDeliveries((prev) => prev.filter((d) => d.id !== confirmId));
    } catch (err) {
      toast.error("Erro ao excluir entrega");
    } finally {
      setConfirmId(null);
    }
  }

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      in_transit: "Em Trânsito",
      delivered: "Entregue",
    };
    return labels[status || "pending"] || "Desconhecido";
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-200 text-yellow-700",
      in_transit: "bg-blue-200 text-blue-700",
      delivered: "bg-green-200 text-green-700",
    };
    return colors[status || "pending"] || "bg-gray-300 text-gray-700";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Entregas
              </h1>
              <p className="text-muted-foreground">
                Gerencie todas as entregas e configurações
              </p>
            </div>
            <Button onClick={() => navigate("/delivery/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrega
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Nenhuma entrega cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.id}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {d.receiver_name || "—"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {(d.address_street || "") +
                              " " +
                              (d.address_number || "") +
                              ", " +
                              (d.address_city || "")}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              d.status
                            )}`}
                          >
                            {getStatusLabel(d.status)}
                          </span>
                        </TableCell>

                        <TableCell>
                          {d.device_id || (
                            <span className="text-muted-foreground text-sm">
                              Não vinculado
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/delivery/${d.id}`)}
                          >
                            Detalhes
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmId(d.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Confirmação */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-[350px] text-center">
            <h2 className="text-xl font-semibold mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir a entrega <b>{confirmId}</b>?
            </p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setConfirmId(null)}>
                Cancelar
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;
