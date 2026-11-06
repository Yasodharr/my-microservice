
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from uuid import uuid4

app = FastAPI(title="Payment Service")

payments = []

class PaymentRequest(BaseModel):
    order_id: int
    amount: float
    method: str

@app.get("/health")
def health():
    return {"status": "Payment Service is running"}

@app.post("/payments")
def create_payment(payment: PaymentRequest):
    if payment.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    new_payment = {
        "payment_id": str(uuid4()),
        "order_id": payment.order_id,
        "amount": payment.amount,
        "method": payment.method,
        "status": "SUCCESS"
    }

    payments.append(new_payment)
    return new_payment

@app.get("/payments")
def get_payments():
    return payments
