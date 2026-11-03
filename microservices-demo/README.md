# Microservices Demo

A beginner-friendly application containing three independent Python FastAPI services:

| Service | Default port | Main responsibility |
|---|---:|---|
| User Service | 8001 | Create and retrieve users |
| Product Service | 8002 | Create and retrieve products |
| Order Service | 8003 | Create and retrieve orders |

The Order Service communicates with the User Service and Product Service over HTTP before creating an order.

## Project structure

```text
microservices-demo/
├── user-service/
│   ├── main.py
│   └── requirements.txt
├── product-service/
│   ├── main.py
│   └── requirements.txt
├── order-service/
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Requirements

- Python 3.10 or newer
- pip

Each service has its own `requirements.txt`. Install dependencies separately in each service directory.

## Run the services

Open three separate terminal windows. Start each service from its own directory.

### 1. User Service

```bash
cd user-service
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### 2. Product Service

In a second terminal:

```bash
cd product-service
python -m venv .venv
```

Activate the environment using the command for your operating system shown above, then run:

```bash
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8002 --reload
```

### 3. Order Service

In a third terminal:

```bash
cd order-service
python -m venv .venv
```

Activate the environment using the command for your operating system shown above, then run:

```bash
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8003 --reload
```

The User and Product services must be running before creating an order.

## Configure service URLs

The Order Service defaults to:

- `USER_SERVICE_URL=http://127.0.0.1:8001`
- `PRODUCT_SERVICE_URL=http://127.0.0.1:8002`

Set these environment variables before starting the Order Service if the other services use different URLs.

Windows PowerShell:

```powershell
$env:USER_SERVICE_URL="http://127.0.0.1:8001"
$env:PRODUCT_SERVICE_URL="http://127.0.0.1:8002"
```

macOS / Linux:

```bash
export USER_SERVICE_URL="http://127.0.0.1:8001"
export PRODUCT_SERVICE_URL="http://127.0.0.1:8002"
```

## API endpoints

### User Service — port 8001

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/users` | List users |
| GET | `/users/{id}` | Get one user |
| POST | `/users` | Create a user |

Example:

```bash
curl http://127.0.0.1:8001/health
curl http://127.0.0.1:8001/users
curl http://127.0.0.1:8001/users/1
curl -X POST http://127.0.0.1:8001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com"}'
```

Example user response:

```json
{
  "id": 3,
  "name": "Charlie",
  "email": "charlie@example.com"
}
```

### Product Service — port 8002

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get one product |
| POST | `/products` | Create a product |

Example:

```bash
curl http://127.0.0.1:8002/health
curl http://127.0.0.1:8002/products
curl http://127.0.0.1:8002/products/1
curl -X POST http://127.0.0.1:8002/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Monitor","price":8500,"stock":5}'
```

Example product response:

```json
{
  "id": 3,
  "name": "Monitor",
  "price": 8500.0,
  "stock": 5
}
```

### Order Service — port 8003

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get one order |
| POST | `/orders` | Validate and create an order |

Example:

```bash
curl http://127.0.0.1:8003/health
curl http://127.0.0.1:8003/orders
curl http://127.0.0.1:8003/orders/1
curl -X POST http://127.0.0.1:8003/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

Example order response:

```json
{
  "id": 2,
  "user_id": 1,
  "product_id": 1,
  "quantity": 2,
  "total_price": 2400.0
}
```

## Order creation flow

1. A client sends `POST /orders` to the Order Service.
2. The Order Service calls `GET /users/{user_id}` on the User Service.
3. The Order Service calls `GET /products/{product_id}` on the Product Service.
4. If either record does not exist, the Order Service returns HTTP 404.
5. If the requested quantity exceeds the product's available stock, it returns HTTP 400.
6. If both records are valid, the Order Service calculates the total and creates the order.

## Useful response codes

- `200 OK` — successful GET request.
- `201 Created` — successful POST request.
- `400 Bad Request` — requested quantity exceeds available stock.
- `404 Not Found` — requested user, product, or order does not exist.
- `422 Unprocessable Entity` — request body fails validation.
- `502 Bad Gateway` — a dependent service returns an unexpected error.
- `503 Service Unavailable` — a dependent service cannot be reached.

## Interactive API documentation

When a service is running, open its Swagger UI:

- User Service: http://127.0.0.1:8001/docs
- Product Service: http://127.0.0.1:8002/docs
- Order Service: http://127.0.0.1:8003/docs

## Notes and current scope

- Data is stored in Python dictionaries in memory. It is lost when a service restarts.
- Each service is an independent application and runs in its own terminal process.
- The Order Service validates product stock but does not reserve or decrement it.
- This is a learning/demo application, not a production order-processing system.
- No database, Docker, CI/CD, Kubernetes, cloud, monitoring, or infrastructure configuration is included.
