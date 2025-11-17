import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MapContainer, Marker, TileLayer, Circle, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiService, User, Device, Delivery } from "@/services/apiService";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const mapPinIcon = new L.DivIcon({ });
const packageIcon = new L.DivIcon({ });

const DeliveryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [linkedDevice, setLinkedDevice] = useState<Device | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const [formData, setFormData] = useState<Partial<Delivery>>({
    order_number: "",
    receiver_name: "",
    address_street: "",
    address_number: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    status: "pending",
    geofence_radius: 150,
    dest_lat: -23.5505,
    dest_lon: -46.6333,
  });

  useEffect(() => {
    (async () => {
      try {
        const [userList, deviceList] = await Promise.all([
          apiService.getUsers(),
          apiService.getDevices(),
        ]);

        setUsers(userList.filter((u) => u.role === "driver"));
        setDevices(deviceList);

        if (isEdit) {
          const delivery = await apiService.getDelivery(id!);
          setFormData(delivery);

          if (delivery.device_id) {
            const device = deviceList.find((d) => d.id === delivery.device_id) || null;
            setLinkedDevice(device);

            if (device?.geofence?.center) {
              setFormData((prev) => ({
                ...prev,
                dest_lat: device.geofence?.center[0],
                dest_lon: device.geofence?.center[1],
                geofence_radius: device.geofence?.radius_m,
              }));
            }
          }
        }
      } catch {
        toast({ title: "Erro ao carregar dados", variant: "destructive" });
      }
    })();
  }, [id]);

  const geocodeAddress = async () => {
    const fullAddress = [
      formData.address_street,
      formData.address_number,
      formData.address_city,
      formData.address_state,
      formData.address_zip,
    ]
      .filter(Boolean)
      .map((v) => v?.trim())
      .join(", ");

    try {
      setIsLoadingAddress(true);
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`
      );
      const data = await resp.json();
      if (!data.length) {
        toast({
          title: "Endereço não encontrado",
          description: "Tente especificar número, bairro ou cidade.",
          variant: "destructive",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        dest_lat: Number(data[0].lat),
        dest_lon: Number(data[0].lon),
      }));

      toast({ title: "Endereço localizado!", description: "Coordenadas atualizadas." });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setFormData((prev) => ({ ...prev, device_id: deviceId }));
    const device = devices.find((d) => d.id === deviceId) || null;
    setLinkedDevice(device);

    if (device?.geofence?.center) {
      setFormData((prev) => ({
        ...prev,
        dest_lat: device.geofence?.center[0] || prev.dest_lat,
        dest_lon: device.geofence?.center[1] || prev.dest_lon,
        geofence_radius: device.geofence?.radius_m || prev.geofence_radius,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiService.updateDelivery(id!, formData);
      } else {
        await apiService.createDelivery(formData);
      }

      toast({ title: "Sucesso!", description: isEdit ? "Entrega atualizada!" : "Entrega cadastrada!" });
      navigate("/deliveries");
    } catch {
      toast({ title: "Erro ao salvar entrega", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/deliveries")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="bg-card rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Entrega" : "Nova Entrega"}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Número do Pedido *</Label>
                <Input
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                />
              </div>

              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={formData.receiver_name}
                  onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Logradouro *</Label>
                  <Input
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Input
                    value={formData.address_state}
                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.address_zip}
                    onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                  />
                </div>
              </div>

              <Button variant="secondary" onClick={geocodeAddress} disabled={isLoadingAddress}>
                {isLoadingAddress ? "Buscando..." : "Buscar no mapa"}
              </Button>

              <div>
                <Label>Entregador</Label>
                <Select value={formData.driver_id} onValueChange={(v) => setFormData({ ...formData, driver_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dispositivo</Label>
                <Select value={formData.device_id} onValueChange={handleDeviceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.id} — {device.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Raio da Geofence (metros)</Label>
                <Input
                  type="number"
                  value={formData.geofence_radius}
                  onChange={(e) => setFormData({ ...formData, geofence_radius: Number(e.target.value) })}
                  min={20}
                  step={10}
                />
              </div>

              {/* MAPA */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Mapa da Entrega
                </h2>
                <div className="h-96 rounded overflow-hidden border">
                  <MapContainer center={[formData.dest_lat || -23.5505, formData.dest_lon || -46.6333]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap & CARTO'
                    />
                    <Marker position={[formData.dest_lat || -23.5505, formData.dest_lon || -46.6333]} icon={mapPinIcon}>
                      <Popup>Endereço da entrega</Popup>
                    </Marker>
                    <Circle center={[formData.dest_lat || -23.5505, formData.dest_lon || -46.6333]} radius={formData.geofence_radius || 150} />
                    {linkedDevice?.latitude && linkedDevice?.longitude && (
                      <Marker position={[linkedDevice.latitude, linkedDevice.longitude]} icon={packageIcon}>
                        <Popup>Pacote ({linkedDevice.id})</Popup>
                      </Marker>
                    )}
                    {linkedDevice?.latitude && linkedDevice?.longitude && (
                      <Polyline positions={[[formData.dest_lat || 0, formData.dest_lon || 0], [linkedDevice.latitude, linkedDevice.longitude]]} />
                    )}
                  </MapContainer>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" /> {isEdit ? "Salvar Alterações" : "Cadastrar Entrega"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/deliveries")}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryForm;
