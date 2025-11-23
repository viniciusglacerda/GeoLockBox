# GeoLockBox

## Visão Geral

O **GeoLockBox** é um sistema integrado que combina hardware, firmware e aplicações web para gerenciamento de dispositivos de bloqueio geográfico. Ele permite o acompanhamento de entregas, controle remoto do dispositivo, registro de telemetria e visualização em tempo real das rotas percorridas.

Este repositório reúne todos os componentes do projeto: Backend (API), Frontend (painel web), Firmware (ESP32) e documentos técnicos.

---

## Estrutura do Repositório

```
.
├── Backend
│   ├── app
│   │   ├── core
│   │   ├── models
│   │   ├── routes
│   │   ├── schemas
│   │   ├── services
│   │   ├── utils
│   │   ├── geolockbox.db
│   │   └── main.py
│   ├── requirements.txt
│   └── tools
├── Documents
│   ├── Eletrical Diagrams
│   ├── GPS History
│   └── System Screenshots
├── Firmware
│   ├── include
│   ├── lib
│   ├── src
│   ├── test
│   └── platformio.ini
├── Frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Descrição dos Módulos

### Backend (API)

Implementado em Python (FastAPI), o backend fornece os serviços essenciais do sistema:

* Autenticação e gerenciamento de usuários.
* Cadastro e controle de dispositivos.
* Registro e consulta de entregas.
* Coleta de telemetria e logs.
* Operações de bloqueio e desbloqueio do dispositivo.
* Comunicação com o firmware por endpoints específicos.

A API utiliza SQLite para armazenamento local, podendo ser adaptada para outros bancos SQL.

### Frontend (Aplicação Web)

Construído em React + TypeScript, com TailwindCSS e componentes customizados. Fornece:

* Dashboard com métricas do sistema.
* Acompanhamento de entregas em andamento.
* Painel detalhado do dispositivo, com localização, rota e telemetria.
* Ferramentas administrativas para usuários e configurações.

### Firmware (ESP32)

Desenvolvido com PlatformIO.

* Comunicação com o backend (HTTP/REST).
* Captura de dados GPS.
* Envio periódico de telemetria.
* Execução da lógica de bloqueio físico conforme validação do servidor.
* Estrutura modular para expansão de sensores.

### Documents

Inclui diagramas elétricos, capturas de tela do sistema e histórico de rotas.

---

## Como Executar o Projeto

### 1. Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000 --host 0.0.0.0
```

A API ficará disponível em: `http://0.0.0.0:5000`

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Aplicação disponível em: `http://localhost:5173`

### 3. Firmware

Abra a pasta `Firmware` no PlatformIO (VSCode) e faça o upload para o ESP32.

---

## Funcionalidades Principais

* Gerenciamento de usuários e autenticação JWT.
* Monitoramento completo do dispositivo.
* Histórico de rotas e telemetria.
* Controle remoto de bloqueio.
* Interface amigável com visualização em mapa.
* Arquitetura modular entre hardware, firmware e software.

---

## Objetivo do Projeto

O GeoLockBox foi desenvolvido com o propósito de demonstrar uma solução integrada voltada ao monitoramento e segurança logística, explorando conceitos de IoT, comunicação em tempo real e rastreamento geográfico.

---

## Capturas de Tela

As imagens estão disponíveis em: `Documents/System Screenshots`.

---

## Licença

Este projeto é disponibilizado para fins acadêmicos e de demonstração.
