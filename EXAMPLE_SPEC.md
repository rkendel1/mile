# Example OpenAPI Spec for Testing

This is a simple OpenAPI 3.0 spec you can use to test Mile.

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Sample E-Commerce API",
    "version": "1.0.0",
    "description": "A sample e-commerce API for testing Mile"
  },
  "servers": [
    {
      "url": "https://api.example.com/v1"
    }
  ],
  "paths": {
    "/products": {
      "get": {
        "summary": "List all products",
        "description": "Returns a list of all products",
        "tags": ["Products"],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Product"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create a new product",
        "description": "Creates a new product in the catalog",
        "tags": ["Products"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Product"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Product created successfully"
          }
        }
      }
    },
    "/products/{id}": {
      "get": {
        "summary": "Get product by ID",
        "description": "Returns a single product",
        "tags": ["Products"],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Product"
                }
              }
            }
          }
        }
      }
    },
    "/orders": {
      "get": {
        "summary": "List all orders",
        "description": "Returns a list of all orders",
        "tags": ["Orders"],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Order"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/users": {
      "get": {
        "summary": "List all users",
        "description": "Returns a list of all users",
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/metrics": {
      "get": {
        "summary": "Get sales metrics",
        "description": "Returns aggregated sales metrics",
        "tags": ["Metrics"],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Metrics"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Product": {
        "type": "object",
        "required": ["id", "name", "price"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Product ID"
          },
          "name": {
            "type": "string",
            "description": "Product name"
          },
          "description": {
            "type": "string",
            "description": "Product description"
          },
          "price": {
            "type": "number",
            "format": "float",
            "description": "Product price"
          },
          "category": {
            "type": "string",
            "description": "Product category"
          },
          "stock": {
            "type": "integer",
            "description": "Available stock"
          }
        }
      },
      "Order": {
        "type": "object",
        "required": ["id", "userId", "items", "total"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Order ID"
          },
          "userId": {
            "type": "string",
            "description": "User ID"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "productId": {
                  "type": "string"
                },
                "quantity": {
                  "type": "integer"
                },
                "price": {
                  "type": "number"
                }
              }
            }
          },
          "total": {
            "type": "number",
            "format": "float",
            "description": "Order total"
          },
          "status": {
            "type": "string",
            "enum": ["pending", "processing", "shipped", "delivered"],
            "description": "Order status"
          }
        }
      },
      "User": {
        "type": "object",
        "required": ["id", "email", "name"],
        "properties": {
          "id": {
            "type": "string",
            "description": "User ID"
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "User email"
          },
          "name": {
            "type": "string",
            "description": "User full name"
          },
          "phone": {
            "type": "string",
            "description": "User phone number"
          }
        }
      },
      "Metrics": {
        "type": "object",
        "properties": {
          "totalRevenue": {
            "type": "number",
            "description": "Total revenue"
          },
          "totalOrders": {
            "type": "integer",
            "description": "Total number of orders"
          },
          "averageOrderValue": {
            "type": "number",
            "description": "Average order value"
          },
          "topProducts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "productId": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "revenue": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}
```

## How to Use

1. Copy this JSON
2. Save it as `sample-api.json`
3. Upload it in the Mile Spec tab
4. Try these goals:
   - "Create a dashboard showing sales metrics"
   - "Build a product catalog with search"
   - "Show an orders table with status filters"
