# Plasticine - Welcome to the World of Flexibility

## Index
- [Releases](https://repo.networktechnologies.online/nasc/streamline-v2/plasticine/-/releases)
- [Documentation](https://repo.networktechnologies.online/nasc/streamline-v2/plasticine/-/wikis/Documentation)
- [Infrastructure](https://repo.networktechnologies.online/nasc/streamline-v2)
  - [Services](https://repo.networktechnologies.online/nasc/streamline-v2/services)
  - [Extensions](https://repo.networktechnologies.online/nasc/streamline-v2/extensions)
  - [Configuration](https://repo.networktechnologies.online/nasc/streamline-v2/configuration)
- [Setup](#setup)
- [Common issues](https://repo.networktechnologies.online/nasc/streamline-v2/plasticine/-/wikis/Common-Issues)
- [Git workflow](#gitworkflow)
- [Code style](#codestyle)
- [Third party software and license](#license)

## <a name="setup">Setup</a>

### Project: Docker Workflow

1. Install docker >20 version & docker-compose >1.29.2 verison
2. Clone the project
3. Clone into the **plasticine/services** folder:
    - https://repo.networktechnologies.online/nasc/streamline-v2/services/libreoffice as **libreoffice**
    - https://repo.networktechnologies.online/nasc/mobile/co2-mobile_client-proxy as **mc-proxy**
4. Run the file: plasticine/scripts/run.sh
5. Select **default** project
6. Select **Docker compose** workflow
7. Run **Build** to install node modules and build service images
8. Run **Up** and select active services. The default is:
    - backend
    - frontend
    - minio
    - nginx
    - postgres
    - redis-core
    - redis-custom
9. Wait until all services being started up then enter **localhost** in the browser's url bar. Credentials:
    - Login: admin@free.man
    - Password: password

### Project: Minikube Workflow

#### Requirements:
  - Docker Desktop
  - Minikube
  - Helm

1. Start Docker Desktop
2. Start Minikube:
  - minikube start --mount --mount-string="$PLASTICINE_PATH:/src/plasticine"
3. Enable Ingress addon
  - minikube addons enable ingress
4. Build images into Minikube VM:
  - minikube ssh
    - cd /src/plasticine && docker build -f ./frontend/Dockerfile -t plasticine/frontend .
    - cd /src/plasticine/backend && docker build -t plasticine/backend .
    - cd /src/plasticine/services/mc-proxy && docker build -t plasticine/mc-proxy .
    - cd /src/plasticine/services/libreoffice && docker build -t plasticine/libreoffice .
    - cd /src/plasticine/backend && docker build -f Dockerfile.dev -t plasticine/backend:dev .
    - cd /src/plasticine/frontend && docker build -f Dockerfile.dev -t plasticine/frontend:dev .
    - cd /src/plasticine/services/mc-proxy && docker build -f Dockerfile.dev -t plasticine/mc-proxy:dev .
    - cd /src/plasticine/services/libreoffice && docker build -f Dockerfile.dev -t plasticine/libreoffice:dev .
  - exit
5. Run storage services:
  - cd $PLASTICINE_PATH/services/postgres && docker compose up
  - cd $PLASTICINE_PATH/services/minio && docker compose up
6. Run Plasticine Scripts:
  - cd $PLASTICINE_PATH
  - sh ./scripts/run.sh
    - select **default-minikube** project
    - select **Minikube** workflow
    - select **Install**
7. Open Dashboard:
  - minikube dashboard
    - select 'plasticine' namespace
    - select 'Pods' and wait until all of them being started up
8. Open Tunnel to be able to access system on http://localhost
  - minikube tunnel

#### Import database from backup

1. Open two tabs in console
2. On the first tab setup the postgres container:
    - `docker-compose up postgres`
3. Other tab:
    - `cat /path/to/backup.sql | docker exec -i $(docker ps -aqf "name=postgres") psql -U postgres`

## <a name="gitworkflow">Git workflow</a>

1. Create a new branch from `develop`. Name it like `task-11111` where `11111` is id of ticket from Redmine
2. When you make a new commit please add a ticket number:
    - `Add #34234: some cool feature`
    - `Fix #34235: some weird bug`
3. Create a new merge request with name by the same template
4. Add label to the merge request according to [the rules](https://docs.google.com/document/d/1-Wh8wk89FSXQhdCPvtN6F778F6SoyIzsAgqFpghmNns/edit#heading=h.461jlsllp3ov) 
5. Make a assignee `Dima Myrgorodsciy` for code review
6. Move the ticket to `Review` status, reassign to `Dima Myrgorodsciy (DM)` and fill `Branch` fields

## <a name="codestyle">Code style (draft)</a>

- node modules imports and project modules separated with 1 new line
- named imports below default imports
- import lodash without destructure (use less named imports)
- declarations/operations/conditions blocks separated with 1 new line
- no extra/missed new lines
- no extra/missed white spaces
- no extra async/await
- spaced { }/[ ]
- single quotes
- 2 space indent

## <a name="#license">Third party software and license</a>

| Software | Use | Version | License |
| -- | -- | -- | -- |
| Docker | Infrastructure | 20.10.20 | Apache License |
| Minio | Object storage | RELEASE.2022-01-27T03-53-02Z | Apache-2.0 |
| PostgreSQL DB | Backend + Background | 13-3.2-alpine | GPL |
| MySQL (as alternative DB) DB | Backend + Background | 5.7 | GPL |
| Redis DB | Backend + Background | 6.2.6-alpine | BSD |
| Node.js | Client + Backend + Background | 18.12.1 | MIT |
| Express.js (REST API library for  Node.js) | Backend | 4.17.3 | MIT |
| WS (WebSocket library for  Node.js) | Backend | 6.2.2 | MIT |
| Bull (Redis-based queue for  Node.js) | Background | 3.5.2 | MIT |
| React.js | Client | 16.12.0 | MIT |
| amCharts 4 | Client | 4.4.7 | Free amCharts License |
| Lodash | Client + Backend | 4.17.21 | MIT |
| Moment.js | Client + Backend | 2.29.2 | MIT |
| Mapbox-GL | Client | 1.13.1 | BSD |
