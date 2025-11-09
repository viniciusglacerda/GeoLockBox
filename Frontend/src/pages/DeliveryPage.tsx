import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck, MapPin, Ruler, Unlock, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Delivery = {
    id: string;
    device_id: string;
    destination: string;
    dest_lat: number;
    dest_lon: number;
    geofence_radius: number;
    distance_to_dest: number;
    status: "in_transit" | "arrived" | "unlocked";
};

const mockDeliveries: Delivery[] = [
    {
        id: "DEL-001",
        device_id: "BOX-001",
        destination: "Av. Paulista, 1000 - São Paulo, SP",
        dest_lat: -23.5614,
        dest_lon: -46.6559,
        geofence_radius: 100,
        distance_to_dest: 240,
        status: "in_transit",
    },
    {
        id: "DEL-002",
        device_id: "BOX-002",
        destination: "Rua da Consolação, 800 - São Paulo, SP",
        dest_lat: -23.553,
        dest_lon: -46.657,
        geofence_radius: 80,
        distance_to_dest: 60,
        status: "arrived",
    },
    {
        id: "DEL-003",
        device_id: "BOX-003",
        destination: "Praça da Sé - São Paulo, SP",
        dest_lat: -23.5503,
        dest_lon: -46.6339,
        geofence_radius: 120,
        distance_to_dest: 10,
        status: "unlocked",
    },
];

const DeliveryPage: React.FC = () => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

    useEffect(() => {
        setDeliveries(mockDeliveries);
    }, []);

    const getStatusColor = (status: Delivery["status"]) => {
        switch (status) {
            case "in_transit":
                return "text-yellow-700 bg-yellow-100";
            case "arrived":
                return "text-blue-700 bg-blue-100";
            case "unlocked":
                return "text-green-700 bg-green-100";
            default:
                return "text-gray-700 bg-gray-100";
        }
    };

    const truckIcon = new L.DivIcon({
        html: `<div style="width:30px;height:30px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4px rgba(0,0,0,0.3);">
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M3 13V6a1 1 0 011-1h10v8H3zm11 0V5h4l3 3v5h-7zM6 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Truck className="text-blue-600" /> Painel do Entregador
            </h1>

            <div className="space-y-4">
                {deliveries.map((delivery) => (
                    <div
                        key={delivery.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex justify-between items-center hover:shadow-md transition cursor-pointer"
                        onClick={() => setSelectedDelivery(delivery)}
                    >
                        <div>
                            <h2 className="font-semibold text-gray-800">{delivery.device_id}</h2>
                            <div className="flex items-center text-gray-600 text-sm gap-1">
                                <MapPin size={16} />
                                {delivery.destination}
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    delivery.status
                                )}`}
                            >
                                {delivery.status === "unlocked"
                                    ? "Destravado"
                                    : delivery.status === "arrived"
                                        ? "Chegou"
                                        : "Em trânsito"}
                            </span>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Ruler size={14} />
                                {delivery.distance_to_dest.toFixed(0)}m
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal com mapa */}
            <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
                {selectedDelivery && (
                    <DialogContent
                        className="max-w-2xl bg-white text-gray-800 shadow-xl rounded-xl border border-gray-200 p-0 overflow-hidden"
                        style={{
                            backgroundColor: "white",
                            backdropFilter: "none",
                        }}
                    >
                        <DialogHeader className="flex justify-between items-center border-b px-4 py-3 bg-gray-50">
                            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Truck className="text-blue-600" />
                                {selectedDelivery.device_id}
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedDelivery(null)}
                                className="hover:bg-gray-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogHeader>

                        <div className="px-4 py-3 text-sm text-gray-700 space-y-1 border-b">
                            <p>
                                <MapPin className="inline w-4 h-4 mr-1" />{" "}
                                {selectedDelivery.destination}
                            </p>
                            <p>
                                <Ruler className="inline w-4 h-4 mr-1" /> Distância:{" "}
                                {selectedDelivery.distance_to_dest.toFixed(0)} m
                            </p>
                            <p>
                                <Unlock className="inline w-4 h-4 mr-1" /> Raio de destravamento:{" "}
                                {selectedDelivery.geofence_radius} m
                            </p>
                        </div>

                        <div className="h-80 rounded-b-xl overflow-hidden">
                            <MapContainer
                                center={[selectedDelivery.dest_lat, selectedDelivery.dest_lon]}
                                zoom={15}
                                className="w-full h-full z-50"
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                                />
                                <Marker
                                    position={[
                                        selectedDelivery.dest_lat,
                                        selectedDelivery.dest_lon,
                                    ]}
                                    icon={truckIcon}
                                >
                                    <Popup>{selectedDelivery.destination}</Popup>
                                </Marker>
                                <Circle
                                    center={[
                                        selectedDelivery.dest_lat,
                                        selectedDelivery.dest_lon,
                                    ]}
                                    radius={selectedDelivery.geofence_radius}
                                    pathOptions={{
                                        color:
                                            selectedDelivery.status === "unlocked"
                                                ? "#22c55e"
                                                : selectedDelivery.status === "arrived"
                                                    ? "#3b82f6"
                                                    : "#facc15",
                                        fillOpacity: 0.15,
                                    }}
                                />
                            </MapContainer>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
};

export default DeliveryPage;
