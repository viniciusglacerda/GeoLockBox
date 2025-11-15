import { apiRequest } from "./api";

// ================================
// Tipos
// ================================

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; username: string; role: string };
}

export interface Device {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  battery_level: number;
  assigned_user_id?: string | null;
  assigned_delivery_id?: string | null;
  geofence?: { center: [number, number]; radius_m: number };
  delivery_id:string;
}

export interface DeviceLog {
  event: string;
  date: string;
  result: string;
}

export interface DeliveryLog {
  event: string;
  date: string;
  result: string;
}

export interface Delivery {
  id: string;

  // Vínculo com o pedido
  order_number: string;

  // Dados do destinatário
  receiver_name: string;

  // Endereço
  address_street: string;
  address_number: string;
  address_city: string;
  address_state: string;
  address_zip: string;

  // Status da entrega
  status: string;

  // Dispositivo GeoLockBox (opcional)
  device_id?: string;
  driver_id?: string;
  tracking_number?: String;

  // Geofencing
  dest_lat?: number;
  dest_lon?: number;
  geofence_radius?: number;
}

export interface TelemetryIn {
  latitude: number;
  longitude: number;
  speed?: number;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

// ================================
// MockService
// ================================
export const mockService = {
  // ================================
  // 🔐 AUTENTICAÇÃO
  // ================================
  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>("/mock/auth/login", {
      method: "POST",
      body: payload,
    }),

  // ================================
  // 📦 DEVICES
  // ================================
  getDevices: () => apiRequest<Device[]>("/mock/devices"),

  getDevice: (id: string) => apiRequest<Device>(`/mock/device/${id}`),

  updateGeofence: (device_id: string, center: [number, number], radius_m: number) =>
    apiRequest(`/mock/device/${device_id}/geofence`, {
      method: "POST",
      body: { center, radius_m },
    }),

  sendTelemetry: (id: string, data: TelemetryIn) =>
    apiRequest(`/mock/device/${id}/telemetry`, {
      method: "POST",
      body: data,
    }),
  
  sendLockCommand: (device_id: string) =>
    apiRequest(`/mock/device/${device_id}/lock`, {
      method: "POST"
    }),

  sendUnlockCommand: (device_id: string) =>
    apiRequest(`/mock/device/${device_id}/unlock`, {
      method: "POST"
    }),
  
  registerDeviceLog: (device_id: string, log: { event: string; result: string }) =>
    apiRequest(`/mock/device/${device_id}/logs`, {
      method: "POST",
      body: log
    }),

  getDeviceLogs: (device_id: string) =>
    apiRequest<DeviceLog[]>(`/mock/device/${device_id}/logs`),

  registerDeliveryLog: (
    delivery_id: string,
    log: { event: string; result: string }
  ) =>
    apiRequest(`/mock/delivery/${delivery_id}/logs`, {
      method: "POST",
      body: log,
    }),

  updateDeviceLocation: (
    device_id: string,
    data: { latitude: number; longitude: number }
  ) =>
    apiRequest(`/mock/device/${device_id}/location`, {
      method: "POST",
      body: data,
    }),

  // ================================
  // 📬 DELIVERIES
  // ================================
  getDeliveries: () => apiRequest<Delivery[]>("/mock/deliveries"),

  getDelivery: (delivery_id: string) =>
    apiRequest<Delivery>(`/mock/delivery/${delivery_id}`),

  trackDelivery: (tracking: string) =>
    apiRequest<Delivery>(`/mock/track/${tracking}`),

  /**
   * Novo: Geofence no DESTINO da entrega 📌
   */
  updateDeliveryGeofence: (
    delivery_id: string,
    center: [number, number],
    radius_m: number
  ) =>
    apiRequest(`/mock/delivery/${delivery_id}/geofence`, {
      method: "POST",
      body: {
        dest_lat: center[0],
        dest_lon: center[1],
        geofence_radius: radius_m,
      },
    }),
  
  getDeliveryByDevice: (device_id: string) =>
    apiRequest(`/mock/delivery/by-device/${device_id}`),

  // ================================
  // 🔗 ASSOCIAÇÕES (Device ⇄ Delivery ⇄ Driver)
  // ================================

  /**
   * Novo: retorna todos os vínculos ativos para edição
   */
  getAssignments: () =>
    apiRequest("/mock/assignments"),

  /**
   * Novo: pega vínculo por delivery
   */
  getAssignmentByDelivery: (delivery_id: string) =>
    apiRequest(`/mock/assign/delivery/${delivery_id}`),

  /**
   * Cria ou atualiza vínculo de dispositivo e motorista na entrega
   */
  assign: (device_id: string, delivery_id?: string, driver_id?: string) =>
    apiRequest("/mock/assign", {
      method: "POST",
      body: { device_id, delivery_id, driver_id },
    }),

  // ================================
  // 👤 USERS
  // ================================
  getUsers: () => apiRequest<User[]>("/mock/users"),

  createUser: (data: { username: string; password: string; role: string }) =>
    apiRequest("/mock/users", {
      method: "POST",
      body: data,
    }),

  updateUser: (id: string, data: Partial<User> & { password?: string }) =>
    apiRequest(`/mock/users/${id}`, {
      method: "PUT",
      body: data,
    }),

  deleteUser: (id: string) =>
    apiRequest(`/mock/users/${id}`, {
      method: "DELETE",
    }),

  // ================================
  // 📬 CRUD de Deliveries
  // ================================
  createDelivery: (data: Partial<Delivery>) =>
    apiRequest("/mock/delivery", {
      method: "POST",
      body: data,
    }),

  updateDelivery: (id: string, data: Partial<Delivery>) =>
    apiRequest(`/mock/delivery/${id}`, {
      method: "PUT",
      body: data,
    }),

  deleteDelivery: (id: string) =>
    apiRequest(`/mock/delivery/${id}`, {
      method: "DELETE",
    }),
};
