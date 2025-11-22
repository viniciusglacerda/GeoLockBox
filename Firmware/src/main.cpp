#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <ArduinoJson.h>

const char *WIFI_SSID = "";
const char *WIFI_PASS = "";

String BASE_URL = "";

String DEVICE_ID = "BOX001";

String API_URL_TELEMETRY = BASE_URL + "/telemetry";
String API_URL_DEVICE = BASE_URL + "/devices/" + DEVICE_ID;
String API_URL_LOCK = BASE_URL + "/devices/" + DEVICE_ID + "/lock";

#define PIN_RELAY 22
#define PIN_MAG_SENSOR 23
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17

TinyGPSPlus gps;
HardwareSerial SerialGPS(1);

const int FIXED_BATTERY = 88;

void connectWifi() {
    Serial.print("Connecting to WiFi ");
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }

    Serial.println("\nWiFi connected");
    Serial.println(WiFi.localIP());
}

String getTimestamp() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo))
        return "";

    char buf[25];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
    return String(buf);
}

void sendTelemetry(float lat, float lon, float speed) {
    if (WiFi.status() != WL_CONNECTED)
        connectWifi();

    HTTPClient http;
    http.begin(API_URL_TELEMETRY);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["latitude"] = lat;
    doc["longitude"] = lon;
    doc["speed"] = speed;
    doc["battery_level"] = FIXED_BATTERY;
    doc["timestamp"] = getTimestamp();

    String body;
    serializeJson(doc, body);

    Serial.println("Sending telemetry:");
    Serial.println(body);

    int code = http.POST(body);
    Serial.println("Telemetry HTTP code: " + String(code));

    if (code == 200)
        Serial.println("Response: " + http.getString());

    http.end();
}

void sendDevicePatch(float lat, float lon) {
    if (WiFi.status() != WL_CONNECTED)
        connectWifi();

    HTTPClient http;
    http.begin(API_URL_DEVICE);
    http.addHeader("Content-Type", "application/json");

    String body = "{";
    body += "\"latitude\": " + String(lat, 6) + ",";
    body += "\"longitude\": " + String(lon, 6) + ",";
    body += "\"battery_level\": " + String(FIXED_BATTERY);
    body += "}";

    Serial.println("Sending device update:");
    Serial.println(body);

    int code = http.sendRequest("PATCH", body);
    Serial.println("Device PATCH code: " + String(code));

    http.end();
}

void checkLockCommand() {
    if (WiFi.status() != WL_CONNECTED)
        connectWifi();

    HTTPClient http;
    http.begin(API_URL_LOCK);

    Serial.println("Checking lock command...");
    int code = http.GET();
    Serial.println("Lock HTTP code: " + String(code));

    if (code == 200) {
        String payload = http.getString();
        Serial.println("Payload: " + payload);

        if (payload.indexOf("open") >= 0) {
            Serial.println("Unlocking...");
            digitalWrite(PIN_RELAY, HIGH);
        } else if (payload.indexOf("close") >= 0) {
            Serial.println("Locking...");
            digitalWrite(PIN_RELAY, LOW);
        }
    }

    http.end();
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    pinMode(PIN_RELAY, OUTPUT);
    pinMode(PIN_MAG_SENSOR, INPUT_PULLUP);

    SerialGPS.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

    connectWifi();

    configTime(-3 * 3600, 0, "pool.ntp.org");
}

void loop() {
    while (SerialGPS.available()) {
        gps.encode(SerialGPS.read());
    }

    float lat = gps.location.isValid() ? gps.location.lat() : 0;
    float lon = gps.location.isValid() ? gps.location.lng() : 0;
    float speed = gps.speed.kmph();

    Serial.printf("GPS: LAT=%.6f LNG=%.6f SPEED=%.2f\n", lat, lon, speed);

    if (gps.location.isValid()) {
        sendTelemetry(lat, lon, speed);
        sendDevicePatch(lat, lon);
    } else {
        Serial.println("Waiting for GPS fix...");
    }

    checkLockCommand();
    delay(5000);
}
