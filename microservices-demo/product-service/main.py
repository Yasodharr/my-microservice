from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, field_validator

app = FastAPI(title="Product Service", version="1.0.0")

# Sample in-memory data. Data resets whenever this service restarts.
products = {
    1: {"id": 1, "name": "Keyboard", "price": 1200.00, "stock": 10},
    2: {"id": 2, "name": "Mouse", "price": 600.00, "stock": 25},
}


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    stock: int = Field(ge=0)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Product name cannot be blank")
        return value.strip()


@app.get("/health")
def health():
    return {"status": "healthy", "service": "product-service"}


@app.get("/products")
def get_products():
    return list(products.values())


@app.get("/products/{product_id}")
def get_product(product_id: int):
    product = products.get(product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    new_id = max(products.keys(), default=0) + 1
    new_product = {"id": new_id, **product.model_dump()}
    products[new_id] = new_product
    return new_product

@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductCreate):
    if product_id not in products:
        raise HTTPException(status_code=404, detail="Product not found")

    updated_product = {"id": product_id, **product.model_dump()}
    products[product_id] = updated_product
    return updated_product


@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    if product_id not in products:
        raise HTTPException(status_code=404, detail="Product not found")

    deleted_product = products.pop(product_id)
    return {
        "message": "Product deleted successfully",
        "product": deleted_product
    }
