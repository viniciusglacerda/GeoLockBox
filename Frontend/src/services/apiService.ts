import { apiRequest } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Token {
  token: string;
  user: User;
  token_type: "bearer";
}

export interface RegisterPayload {
  username: string;
  password: string;
  name?: string;
  role?: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string; username: string; role: string };
}

export interface User {
  id: string;
  username: string;
  name?: string;
  role?: string;
  email?: string;
  password?: string;
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
}

export interface Delivery {
  id: string;
  order_number: string;
  receiver_name: string;
  address_street: string;
  address_number: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  status: string;
  device_id?: string;
  driver_id?: string;
  dest_lat?: number;
  dest_lon?: number;
  geofence_radius?: number;
}

export interface Telemetry {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  battery_level?: number | null;
  timestamp: string;
}

export interface Log {
  id: string;
  event: string;
  result: string;
  created_at?: string;
}


export const apiService = {
  // AUTH
  register: (data: RegisterPayload) => apiRequest(`/auth/register`, { method: "POST", body: data } ),

  login: (data: LoginPayload) => apiRequest<Token>(`/auth/login`, { method: "POST", body: data }),

  // USERS
  getUsers: () => apiRequest<User[]>("/users"),
  getUser: (id: string) => apiRequest<User>(`/users/${id}`),
  createUser: (data: Partial<User>) =>
    apiRequest<User>("/users", { method: "POST", body: data }),
  updateUser: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, { method: "PUT", body: data }),
  patchUser: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, { method: "PATCH", body: data }),
  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, { method: "DELETE" }),


  // DEVICES
  getDevices: () => apiRequest<Device[]>("/devices"),
  getDevice: (id: string) => apiRequest<Device>(`/devices/${id}`),
  createDevice: (data: Partial<Device>) =>
    apiRequest<Device>("/devices", { method: "POST", body: data }),
  updateDevice: (id: string, data: Partial<Device>) =>
    apiRequest<Device>(`/devices/${id}`, { method: "PUT", body: data }),
  patchDevice: (id: string, data: Partial<Device>) =>
    apiRequest<Device>(`/devices/${id}`, { method: "PATCH", body: data }),
  deleteDevice: (id: string) =>
    apiRequest(`/devices/${id}`, { method: "DELETE" }),


  // DELIVERIES
  getDeliveries: () => apiRequest<Delivery[]>("/deliveries"),
  getDelivery: (id: string) => apiRequest<Delivery>(`/deliveries/${id}`),
  createDelivery: (data: Partial<Delivery>) =>
    apiRequest<Delivery>("/deliveries", { method: "POST", body: data }),
  updateDelivery: (id: string, data: Partial<Delivery>) =>
    apiRequest<Delivery>(`/deliveries/${id}`, { method: "PUT", body: data }),
  patchDelivery: (id: string, data: Partial<Delivery>) =>
    apiRequest<Delivery>(`/deliveries/${id}`, { method: "PATCH", body: data }),
  deleteDelivery: (id: string) =>
    apiRequest(`/deliveries/${id}`, { method: "DELETE" }),


  // TELEMETRY
  getTelemetry: (device_id?: string) =>
    apiRequest<Telemetry[]>(`/telemetry${device_id ? `?device_id=${device_id}` : ""}`),
  getTelemetryById: (id: string) => apiRequest<Telemetry>(`/telemetry/${id}`),
  createTelemetry: (data: Partial<Telemetry>) =>
    apiRequest<Telemetry>("/telemetry", { method: "POST", body: data }),
  updateTelemetry: (id: string, data: Partial<Telemetry>) =>
    apiRequest<Telemetry>(`/telemetry/${id}`, { method: "PUT", body: data }),
  patchTelemetry: (id: string, data: Partial<Telemetry>) =>
    apiRequest<Telemetry>(`/telemetry/${id}`, { method: "PATCH", body: data }),
  deleteTelemetry: (id: string) =>
    apiRequest(`/telemetry/${id}`, { method: "DELETE" }),


  // LOGS
  getLogs: () => apiRequest<Log[]>("/logs"),
  getLog: (id: string) => apiRequest<Log>(`/logs/${id}`),
  createLog: (data: Partial<Log>) =>
    apiRequest<Log>("/logs", { method: "POST", body: data }),
  updateLog: (id: string, data: Partial<Log>) =>
    apiRequest<Log>(`/logs/${id}`, { method: "PUT", body: data }),
  patchLog: (id: string, data: Partial<Log>) =>
    apiRequest<Log>(`/logs/${id}`, { method: "PATCH", body: data }),
  deleteLog: (id: string) =>
    apiRequest(`/logs/${id}`, { method: "DELETE" }),
};
