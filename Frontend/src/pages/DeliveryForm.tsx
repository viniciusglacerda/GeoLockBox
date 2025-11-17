// DeliveryForm.tsx — versão limpa sem dados hardcoded + API mockService

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

import {
    MapContainer,
    Marker,
    TileLayer,
    Circle,
    Popup,
    Polyline,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockService, User, Device } from "@/services/mockService";

// =====================================
// ÍCONES PERSONALIZADOS
// =====================================

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});

const mapPinIcon = new L.DivIcon({
    html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:30px;
      height:30px;
      background-color:${"grey"};
      border-radius:50%;
      box-shadow:0 0 6px rgba(0,0,0,0.4);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5
          c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5
          14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
      </svg>
    </div>
  `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const packageIcon = new L.DivIcon({
    html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:30px;
      height:30px;
      background-color:${"grey"};
      border-radius:50%;
      box-shadow:0 0 6px rgba(0,0,0,0.4);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="m7.5 4.27 4.5-2.25 4.5 2.25"></path>
        <path d="M3 8l9 4 9-4"></path>
        <path d="M3 8v8l9 4 9-4V8"></path>
        <path d="M12 12v8"></path>
      </svg>
    </div>
  `,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// ======================================================================

const DeliveryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = id && id !== "new";

    const { toast } = useToast();

    // =======================================
    // Estados
    // =======================================
    const [users, setUsers] = useState<User[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);

    const [linkedDevice, setLinkedDevice] = useState<any>(null);

    const [formData, setFormData] = useState<any>({
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

    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // =======================================
    // Carregar dados iniciais
    // =======================================
    useEffect(() => {
        (async () => {
            try {
                const [userList, deviceList] = await Promise.all([
                    mockService.getUsers(),
                    mockService.getDevices(),
                ]);

                setUsers(userList.filter((u) => u.role === "driver"));
                setDevices(deviceList);

                if (isEdit) {
                    const delivery = await mockService.getDelivery(id!);
                    setFormData(delivery);

                    if (delivery.device_id) {
                        const d = deviceList.find((x) => x.id === delivery.device_id);
                        if (d) setLinkedDevice(d);
                    }
                }
            } catch (err) {
                toast({ title: "Erro ao carregar dados", variant: "destructive" });
            }
        })();
    }, [id]);

    // =======================================
    // Geocodificação do endereço
    // =======================================
    const geocodeAddress = async () => {
        const fullAddress = [
            formData.address_street,
            formData.address_number,
            formData.address_city,
            formData.address_state,
            formData.address_zip
        ]
            .filter(Boolean)
            .map((v) => v.trim())
            .join(", ");

        try {
            setIsLoadingAddress(true);

            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                fullAddress
            )}`;

            const resp = await fetch(url);
            const data = await resp.json();

            if (!data.length) {
                toast({
                    title: "Endereço não encontrado",
                    description: "Tente especificar número, bairro ou cidade.",
                    variant: "destructive",
                });
                return;
            }

            setFormData((prev: any) => ({
                ...prev,
                dest_lat: Number(data[0].lat),
                dest_lon: Number(data[0].lon),
            }));

            toast({ title: "Endereço localizado!", description: "Coordenadas atualizadas." });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    // =======================================
    // Submit
    // =======================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEdit) {
                await mockService.updateDelivery(id!, formData);
                await mockService.updateDeliveryGeofence(
                    id!,
                    [formData.dest_lat, formData.dest_lon],
                    formData.geofence_radius
                );
            } else {
                await mockService.createDelivery(formData);
            }

            toast({
                title: "Sucesso!",
                description: isEdit ? "Entrega atualizada!" : "Entrega cadastrada!",
            });

            navigate("/deliveries");
        } catch (err) {
            toast({
                title: "Erro ao salvar entrega",
                variant: "destructive",
            });
        }
    };

    // =======================================
    // Renderização
    // =======================================
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">

                    <Button variant="ghost" onClick={() => navigate("/deliveries")} className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>

                    <div className="bg-card rounded-lg shadow-md p-8">
                        <h1 className="text-2xl font-bold mb-6">
                            {isEdit ? "Editar Entrega" : "Nova Entrega"}
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Cliente */}
                            <div>
                                <Label>Nome do Cliente *</Label>
                                <Input
                                    value={formData.receiver_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, receiver_name: e.target.value })
                                    }
                                />
                            </div>

                            {/* Endereço */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Logradouro *</Label>
                                    <Input
                                        value={formData.address_street}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_street: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Número *</Label>
                                    <Input
                                        value={formData.address_number}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_number: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Cidade *</Label>
                                    <Input
                                        value={formData.address_city}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_city: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Estado *</Label>
                                    <Input
                                        value={formData.address_state}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_state: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <Button variant="secondary" onClick={geocodeAddress} disabled={isLoadingAddress}>
                                {isLoadingAddress ? "Buscando..." : "Buscar no mapa"}
                            </Button>

                            {/* Entregador */}
                            <div>
                                <Label>Entregador</Label>
                                <Select
                                    value={formData.driver_id}
                                    onValueChange={(v) => setFormData({ ...formData, driver_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u: any) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dispositivo */}
                            <div>
                                <Label>Dispositivo</Label>
                                <Select
                                    value={formData.device_id}
                                    onValueChange={(v) => {
                                        setFormData({ ...formData, device_id: v });
                                        const dev = devices.find((d: any) => d.id === v);
                                        setLinkedDevice(dev || null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {devices.map((device: any) => (
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
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            geofence_radius: Number(e.target.value),
                                        })
                                    }
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
                                    <MapContainer
                                        center={[formData.dest_lat, formData.dest_lon]}
                                        zoom={15}
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; OpenStreetMap & CARTO'
                                        />

                                        {/* LOCAL DE ENTREGA */}
                                        <Marker
                                            position={[formData.dest_lat, formData.dest_lon]}
                                            icon={mapPinIcon}
                                        >
                                            <Popup>Endereço da entrega</Popup>
                                        </Marker>

                                        <Circle
                                            center={[formData.dest_lat, formData.dest_lon]}
                                            radius={formData.geofence_radius}
                                        />

                                        {/* DISPOSITIVO */}
                                        {linkedDevice && (
                                            <Marker
                                                position={[linkedDevice.latitude, linkedDevice.longitude]}
                                                icon={packageIcon}
                                            >
                                                <Popup>Pacote ({linkedDevice.id})</Popup>
                                            </Marker>
                                        )}

                                        {/* LINHA */}
                                        {linkedDevice && (
                                            <Polyline
                                                positions={[
                                                    [formData.dest_lat, formData.dest_lon],
                                                    [linkedDevice.latitude, linkedDevice.longitude],
                                                ]}
                                            />
                                        )}
                                    </MapContainer>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button type="submit" className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />{" "}
                                    {isEdit ? "Salvar Alterações" : "Cadastrar Entrega"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/deliveries")}
                                >
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
