import os

import httpx
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="Order Service", version="1.0.0")

# Override these environment variables when services run on different hosts.
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://127.0.0.1:8001")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://127.0.0.1:8002")

# Sample in-memory data. Data resets whenever this service restarts.
orders = {
    1: {
        "id": 1,
        "user_id": 1,
        "product_id": 1,
        "quantity": 1,
        "total_price": 1200.00,
    }
}


class OrderCreate(BaseModel):
    user_id: int = Field(gt=0)
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


@app.get("/health")
def health():
    return {"status": "healthy", "service": "order-service"}


@app.get("/orders")
def get_orders():
    return list(orders.values())


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    order = orders.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    # Validate the user and product by calling their REST APIs.
    timeout = httpx.Timeout(5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            user_response = await client.get(
                f"{USER_SERVICE_URL}/users/{order.user_id}"
            )
            product_response = await client.get(
                f"{PRODUCT_SERVICE_URL}/products/{order.product_id}"
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail="Could not contact User Service or Product Service",
        ) from exc

    if user_response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if user_response.is_error:
        raise HTTPException(status_code=502, detail="User Service returned an error")

    if product_response.status_code == 404:
        raise HTTPException(status_code=404, detail="Product not found")
    if product_response.is_error:
        raise HTTPException(status_code=502, detail="Product Service returned an error")

    user = user_response.json()
    product = product_response.json()

    if order.quantity > product["stock"]:
        raise HTTPException(status_code=400, detail="Insufficient product stock")

    total_price = round(float(product["price"]) * order.quantity, 2)
    new_id = max(orders.keys(), default=0) + 1

    new_order = {
        "id": new_id,
        "user_id": user["id"],
        "product_id": product["id"],
        "quantity": order.quantity,
        "total_price": total_price,
    }
    orders[new_id] = new_order
    return new_order

@app.put("/orders/{order_id}")
async def update_order(order_id: int, order: OrderCreate):
    if order_id not in orders:
        raise HTTPException(status_code=404, detail="Order not found")

    timeout = httpx.Timeout(5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            user_response = await client.get(
                f"{USER_SERVICE_URL}/users/{order.user_id}"
            )
            product_response = await client.get(
                f"{PRODUCT_SERVICE_URL}/products/{order.product_id}"
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail="Could not contact User Service or Product Service",
        ) from exc

    if user_response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if user_response.is_error:
        raise HTTPException(status_code=502, detail="User Service returned an error")

    if product_response.status_code == 404:
        raise HTTPException(status_code=404, detail="Product not found")
    if product_response.is_error:
        raise HTTPException(status_code=502, detail="Product Service returned an error")

    user = user_response.json()
    product = product_response.json()

    if order.quantity > product["stock"]:
        raise HTTPException(status_code=400, detail="Insufficient product stock")

    updated_order = {
        "id": order_id,
        "user_id": user["id"],
        "product_id": product["id"],
        "quantity": order.quantity,
        "total_price": round(float(product["price"]) * order.quantity, 2),
    }

    orders[order_id] = updated_order
    return updated_order



@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    if order_id not in orders:
        raise HTTPException(status_code=404, detail="Order not found")

    deleted_order = orders.pop(order_id)

    return {
        "message": "Order deleted successfully",
        "order": deleted_order
    }
