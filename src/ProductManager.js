import fs from "fs";

class ProductManager {
  #path;
  #format;
  constructor(path) {
    this.#path = path;
    this.#format = "utf-8";
    this.products = [];
  }

  #validateProduct = async (product) => {
    // Validamos que todos los campos sean obligatorios
    for (const key in product) {
      if (!product[key]) {
        console.log("Todos los campos son obligatorios");
        return false;
      }
    }

    // Leer el contenido del archivo
    const products = await this.getProducts();

    // Validamos que no se repita el campo "code"
    const existingProduct = await products.find(
      (prod) => prod.code === product.code
    );
    if (existingProduct !== undefined) {
      console.log("Ya existe un producto con el mismo código");
      return false;
    }

    return true;
  };

  // Devolvemos el arreglo con todos los productos creados hasta ese momento. En caso de error lo mostramos por consola
  getProducts = async () => {
    try {
      return JSON.parse(
        await fs.promises.readFile(this.#path, this.#format)
      );
    } catch (error) {
      console.log("error: archivo no encontrado");
      return [];
    }
  };

  // Asignar un id autoincrementable al nuevo producto
  #generateId = async () => {
    // Leer el contenido del archivo
    const products = await this.getProducts();
    return products.length === 0 ? 1 : products[products.length - 1].id + 1;
  };

  // Agregamos un producto al arreglo de productos inicial
  addProduct = async (title, description, price, thumbnail, code, stock) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();

    const newProduct = {
      id: await this.#generateId(),
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    // Validar producto
    if (await this.#validateProduct(newProduct)) {
      // Agregar el nuevo producto al array de productos
      products.push(newProduct);

      // Escribir el array actualizado de productos en el archivo
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t")
      );

      // Actualizar el array de productos en la instancia de ProductManager
      this.products = products;

      // Devolver el nuevo producto
      return newProduct;
    }
  };

  // Buscamos en el arreglo el producto que coincida con el id
  getProductsById = async (id) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();
    // Buscar el producto con el id especificado
    const product = products.find((prod) => prod.id === id);
    // Devolver el producto o un mensaje en el case de que no se encontró
    return product /* || "El producto con ese id no existe" */;
  };

  // Actualizamos un producto en especifico buscando con su id y los parametros a actualizar
  updateProduct = async (id, update) => {
    // Leer el contenido del archivo
    const products = await this.getProducts();

    // Buscar el índice del producto con el id especificado
    const index = products.findIndex((prod) => prod.id === id);

    // Si el producto existe, actualizarlo
    if (index !== -1) {

      // Validar el objeto de actualización
      const isValid = await this.#validateProduct(update);
      if (!isValid) {
        return console.log(
          "Error al actualizar: actualización inválida"
        );
      }

      // Crear un nuevo objeto producto actualizado
      products[index] = { ...products[index], ...update };

      // Escribir el array de productos actualizado al archivo
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t"),
        this.#format
      );

      // Actualizar el array de productos en la instancia de ProductManager
      this.products = products;

      // Devolver el producto actualizado
      return console.log("Producto Actualizado", products[index]);
    }

    // Si el producto no existe, devolvemos un mensaje
    return console.log("Error al actualizar: Producto no encontrado");
  };

  // Eliminamos un producto en especifico buscando con su id
  deleteProduct = async (id) => {
    try {
      // Leer el contenido del archivo
      const products = await this.getProducts();
      // Filtrar el array de productos, excluyendo el producto con el id especificado
      const filterProducts = products.filter((prod) => prod.id !== id);
      // Si se eliminó algún producto, escribir el array de productos actualizado al archivo
      if (products.length !== filterProducts.length) {
        await fs.promises.writeFile(
          this.#path,
          JSON.stringify(filterProducts, null, "\t"),
          this.#format
        );
        // Actualizar el array de productos en la instancia de ProductManager
        this.products = filterProducts;
        // Devolvemos un mensaje que el producto se ha eliminado con exito
        return "Producto eliminado con exito";
      }
      // Si no se eliminó ningún producto, devolvemos un mensaje que no se encontro ese ID
      return "No existe el producto con ese ID";
    } catch (err) {
      console.log(err);
    }
  };
}

// Ejemplos:
export const productManager = new ProductManager("./products.json");

// Agregamos los productos al arreglo
/* 
 await productManager.addProduct(
  "Leche",
  "Leche entera de vaca, 1 litro",
  2.5,
  "ruta-imagen-1.jpg",
  "001",
  10
);

await productManager.addProduct(
  "Arroz",
  "Arroz blanco de grano largo, 1 kg",
  1.99,
  "ruta-imagen-2.jpg",
  "002",
  15
);
await productManager.addProduct(
  "Pan",
  "Pan integral fresco, 500g",
  2.25,
  "ruta-imagen-3.jpg",
  "003",
  8
);
await productManager.addProduct(
  "Aceite",
  "Aceite de oliva extra virgen, 750ml",
  6.99,
  "ruta-imagen-4.jpg",
  "004",
  12
);
await productManager.addProduct(
  "Huevos",
  "Huevos orgánicos, paquete de 12",
  4.75,
  "ruta-imagen-5.jpg",
  "005",
  20
);
await productManager.addProduct(
  "Yogur",
  "Yogur griego natural, 500g",
  1.49,
  "ruta-imagen-6.jpg",
  "006",
  6
);
await productManager.addProduct(
  "Pasta",
  "Pasta de trigo integral, 500g",
  2.1,
  "ruta-imagen-7.jpg",
  "007",
  10
);
await productManager.addProduct(
  "Manzanas",
  "Manzanas frescas, 1 kg",
  3.99,
  "ruta-imagen-8.jpg",
  "008",
  18
);
await productManager.addProduct(
  "Jugo",
  "Jugo de naranja natural, 1 litro",
  2.75,
  "ruta-imagen-9.jpg",
  "009",
  5
);
await productManager.addProduct(
  "Pollo",
  "Pechugas de pollo sin hueso, 500g",
  5.49,
  "ruta-imagen-10.jpg",
  "010",
  14
);
 */

/* await productManager.addProduct( // Intentamos agregar un producto con el mismo "code"
  "Aceite",
  "Aceite de oliva extra virgen, 750ml",
  6.99,
  "ruta-imagen-4.jpg",
  "004",
  12
); */

/* await productManager.addProduct(
  // Intentamos agregar un producto con campos insuficientes
  "Pan",
  "Pan integral fresco, 500g",
  "003",
  8
); */

// Llamamos a todo el arreglo con sus productos
/* console.log(await productManager.getProducts()); */

// Llamamos a un producto en especifico por su Id
/* console.log(await productManager.getProductsById(4)); */

// Actualizamos un producto especifico con su id, y las propiedades que se requieran
/* await productManager.updateProduct(4, {
  title: "Producto 4",
  description: "Descripción del Producto 4",
  price: 40,
  thumbnail: "ruta-imagen-4.jpg",
  code: "004",
  stock: 15,
}); */

// Eliminamos un producto por su Id
/* console.log(await productManager.deleteProduct(1)); */
