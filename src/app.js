import express from "express";
import { productManager } from "./ProductManager.js";

const app = express();
const products = await productManager.getProducts();

app.get("/products", (req, res) => {
  // Obtener el valor del parámetro "limit" de la consulta
  const limit = req.query.limit;

  if (limit) {
    // Si se proporciona un límite, obtenemos todos los productos y limitamos la cantidad a mostrar
    const limitedProducts = products.slice(0, limit);
    res.json(limitedProducts);
  } else {
    // Si no se proporciona un límite, obtenemos todos los productos
    res.json(products);
  }
});

app.get("/products/:pid", async (req, res) => {
  // Obtenemos el ID del producto de req.params
  const productId = parseInt(req.params.pid);

  // Obtenemos el producto por ID
  const product = await productManager.getProductsById(productId);

  // Enviamos un mensaje de error si no se encuentra el producto
  if (!product)
    return res
      .status(404)
      .send({
        error: `El producto con el id ${productId} no se ha encontrado`,
      });
  // Enviamos el producto como respuesta si se encuentra
  res.send(product);
});

app.listen(8080, () => console.log("Server Up"));

// EJEMPLOS
/* 
  TRAEMOS LOS PRIMEROS 3 PRODUCTOS
  http://localhost:8080/products/?limit=3

  TRAEMOS LOS PRIMEROS 5 PRODUCTOS
  http://localhost:8080/products/?limit=5
*/

/* 
  TRAEMOS EL PRODUCTO CON EL ID 5
  http://localhost:8080/products/5

  TRAEMOS EL PRODUCTO CON EL ID 7
  http://localhost:8080/products/7
*/