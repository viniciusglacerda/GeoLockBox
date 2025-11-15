// Updated DeliveriesSettingsPage with minimal delivery fields and linkage to geofence + package

import { useEffect, useState } from "react";
import { mockService, Delivery } from "@/services/mockService";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function DeliveriesSettingsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);

  const [form, setForm] = useState<Partial<Delivery>>({});

  const load = async () => {
    setLoading(true);
    const data = await mockService.getDeliveries();
    setDeliveries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      order_number: "",
      receiver_name: "",
      address_street: "",
      address_number: "",
      address_city: "",
      address_state: "",
      address_zip: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (d: Delivery) => {
    setEditing(d);
    setForm(d);
    setDialogOpen(true);
  };

  const save = async () => {
    if (editing) {
      await mockService.updateDelivery(editing.id, form);
    } else {
      await mockService.createDelivery(form);
    }

    setDialogOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrega?")) return;
    await mockService.deleteDelivery(id);
    await load();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 ml-64">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Gerenciamento de Entregas</h1>
          <Button onClick={openCreate}>+ Nova Entrega</Button>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {deliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.order_number}</TableCell>
                  <TableCell>{d.receiver_name}</TableCell>
                  <TableCell>{d.address_city}</TableCell>
                  <TableCell>{d.address_state}</TableCell>

                  <TableCell className="flex gap-2">
                    <Button variant="outline" onClick={() => openEdit(d)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => remove(d.id)}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Modal Criação/Edição */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Editar Entrega" : "Nova Entrega"}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Número do Pedido */}
              <div>
                <Label>Número do Pedido</Label>
                <Input
                  value={form.order_number || ""}
                  onChange={(e) =>
                    setForm({ ...form, order_number: e.target.value })
                  }
                />
              </div>

              {/* Destinatário */}
              <div>
                <Label>Nome do Destinatário</Label>
                <Input
                  value={form.receiver_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, receiver_name: e.target.value })
                  }
                />
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rua</Label>
                  <Input
                    value={form.address_street || ""}
                    onChange={(e) =>
                      setForm({ ...form, address_street: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    value={form.address_number || ""}
                    onChange={(e) =>
                      setForm({ ...form, address_number: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={form.address_city || ""}
                    onChange={(e) =>
                      setForm({ ...form, address_city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input
                    value={form.address_state || ""}
                    onChange={(e) =>
                      setForm({ ...form, address_state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={form.address_zip || ""}
                    onChange={(e) =>
                      setForm({ ...form, address_zip: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={save}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
