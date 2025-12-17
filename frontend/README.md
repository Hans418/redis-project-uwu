# Redis Task Tracker

Moderní real-time aplikace pro správu úkolů postavená na Redis, Svelte a FastAPI.

## Technologie

- **Frontend**: Svelte + TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: Redis Stack
- **Real-time**: WebSockets
- **Container**: Docker + Docker Compose

## Požadavky

Před spuštěním aplikace se ujistěte, že máte nainstalováno:

- **Docker** (verze 20.10+)
- **Docker Compose** (verze 2.0+)
- **Git**

## Instalace a nasazení

### 1. Klonování repozitáře

```bash
git clone <your-repo-url>
cd redis-project-uwu
```

### 2. Spuštění aplikace

```bash
docker-compose up --build -d
```

Tento příkaz:
- Stáhne všechny potřebné Docker image
- Vytvoří a spustí kontejnery
- Spustí aplikaci na pozadí (`-d` flag)

### 3. Ověření běhu

Zkontrolujte, zda všechny služby běží:

```bash
docker-compose ps
```

## Přístup k aplikaci

Po úspěšném spuštění jsou k dispozici následující služby:

| Služba | URL | Popis |
|--------|-----|-------|
| **Frontend** | http://localhost:3000 | Hlavní aplikace |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **API Dokumentace** | http://localhost:8000/docs | Swagger UI |
| **RedisInsight** | http://localhost:8001 | Redis GUI pro ladění |

## Testování

### Seed data - 10 testovacích úkolů

Pro naplnění databáze testovacími daty spusťte:

```bash
docker-compose exec backend python seed.py
```

Nebo použijte curl:

```bash
curl -X POST http://localhost:8000/api/seed
```

### Test real-time aktualizací

1. Otevřete aplikaci ve **dvou různých prohlížečích** (např. Chrome + Firefox)
2. V jednom prohlížeči vytvořte nový úkol
3. Ověřte, že se úkol **okamžitě zobrazí** v druhém prohlížeči
4. Zkuste upravit nebo smazat úkol a sledujte real-time synchronizaci

### Manuální testování API

```bash
# Vytvoření úkolu
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test úkol","description":"Testovací popis","priority":"high"}'

# Získání všech úkolů
curl http://localhost:8000/api/tasks

# Aktualizace úkolu
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Smazání úkolu
curl -X DELETE http://localhost:8000/api/tasks/1
```

## Ladění s RedisInsight

RedisInsight poskytuje vizuální rozhraní pro práci s Redis:

1. Otevřete http://localhost:8001
2. Připojte se k databázi:
   - **Host**: `redis`
   - **Port**: `6379`
   - **Name**: `Local Redis`
3. Prozkoumejte klíče, data a sledujte změny v real-time

## Ukončení aplikace

### Zastavení bez smazání dat

```bash
docker-compose down
```

### Zastavení a smazání všech dat

```bash
docker-compose down -v
```

**Varování**: Příkaz `-v` smaže všechna data v Redis databázi!

## Struktura projektu