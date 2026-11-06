provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "user" {
  name = "user-service"
}

resource "aws_ecr_repository" "product" {
  name = "product-service"
}

resource "aws_ecr_repository" "order" {
  name = "order-service"
}

output "user_ecr_url" {
  value = aws_ecr_repository.user.repository_url
}

output "product_ecr_url" {
  value = aws_ecr_repository.product.repository_url
}

output "order_ecr_url" {
  value = aws_ecr_repository.order.repository_url
}
