#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "";
const char* WIFI_PASS = "";

String DEVICE_ID = "DEVICE123";

String API_BASE = "http://localhost:8000/telemetry";
String CMD_URL = "http://localhost:8000/device/" + DEVICE_ID + "/command";

// --- HARDWARE ---
#define RELE_PIN 22
#define MAG_SENSOR_PIN 23
#define BATTERY_ADC_PIN 34

TinyGPSPlus gps;
HardwareSerial SerialGPS(1);

void connectWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println(" Conectado!");
}

float readBatteryLevel() {
  int adcValue = analogRead(BATTERY_ADC_PIN);
  float voltage = (adcValue / 4095.0) * 3.3 * 2;
  float percent = map(voltage * 100, 330, 420, 0, 100);
  return constrain(percent, 0, 100);
}

void sendTelemetry(float lat, float lon, float speed) {
  HTTPClient http;

  String url = API_BASE;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["id"] = "TEL-" + DEVICE_ID;
  doc["device_id"] = DEVICE_ID;
  doc["latitude"] = lat;
  doc["longitude"] = lon;
  doc["speed"] = speed;
  doc["battery_level"] = readBatteryLevel();

  String body;
  serializeJson(doc, body);

  Serial.println("Enviando: " + body);

  int resp = http.POST(body);
  Serial.println("Resposta: " + String(resp));

  http.end();
}

void checkCommand() {
  HTTPClient http;
  http.begin(CMD_URL);

  int resp = http.GET();
  Serial.println("GET command → " + String(resp));

  if (resp == 200) {
    String json = http.getString();
    StaticJsonDocument<200> doc;
    deserializeJson(doc, json);

    String cmd = doc["command"];

    Serial.println("Comando recebido: " + cmd);

    if (cmd == "open") {
      digitalWrite(RELE_PIN, HIGH);
    } else if (cmd == "close") {
      digitalWrite(RELE_PIN, LOW);
    }
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(RELE_PIN, OUTPUT);
  pinMode(MAG_SENSOR_PIN, INPUT_PULLUP);

  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  connectWifi();
}

void loop() {
  while (SerialGPS.available()) {
    gps.encode(SerialGPS.read());
  }

  float lat = gps.location.isValid() ? gps.location.lat() : 0;
  float lon = gps.location.isValid() ? gps.location.lng() : 0;
  float speed = gps.speed.kmph();

  sendTelemetry(lat, lon, speed);

  checkCommand();

  delay(5000);
}
