from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # raio da terra em metros

    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)

    a = sin(d_lat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon/2)**2
    c =  atan2(sqrt(a), sqrt(1 - a))

    return R * c

def is_in_geofence(device, delivery):
    if not device.latitude or not device.longitude:
        return False  # não é possível calcular

    if not delivery.dest_lat or not delivery.dest_lon:
        return False

    if not delivery.geofence_radius:
        return False

    distance = haversine_distance(
        device.latitude,
        device.longitude,
        delivery.dest_lat,
        delivery.dest_lon
    )

    return distance <= delivery.geofence_radius
