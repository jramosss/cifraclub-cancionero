# CifraClub Cancionero API Documentation

Esta es la documentación de los endpoints disponibles en el servidor de generación de cancioneros.

## Base URL
Por defecto, el servidor corre en: `http://localhost:8080`

---

## 1. Generar Cancionero
Genera un archivo PDF con las canciones extraídas de una URL de CifraClub.

- **Endpoint:** `/generate`
- **Método:** `GET`

### Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `url` | string | **Sí** | La URL de CifraClub que contiene la lista de canciones (ej: página de artista o repertorio). |
| `color` | string | No | Color primario para el diseño del PDF (ej: `#ff1234` o `blue`). |
| `fontSize` | string | No | Tamaño de fuente para el contenido (ej: `14px`, `1.2rem`). |

### Ejemplo de Solicitud
```bash
GET http://localhost:8080/generate?url=https://www.cifraclub.com/nana-pancha/&color=%23e74c3c&fontSize=16px
```

### Respuestas Posibles

#### ✅ 200 OK
El PDF se generó correctamente.
```json
{
  "message": "PDF generated successfully",
  "filename": "a1b2c3d4.pdf",
  "download": "/files/a1b2c3d4.pdf"
}
```

#### ❌ 400 Bad Request
Falta el parámetro obligatorio `url`.
```json
{
  "error": "url parameter is required"
}
```

#### ❌ 404 Not Found
No se encontraron canciones en la URL proporcionada.
```json
{
  "error": "no songs found in the provided URL"
}
```

#### ❌ 500 Internal Server Error
Hubo un error al scrapear las canciones o al generar el archivo PDF.
```json
{
  "error": "failed to generate PDF: error details..."
}
```

---

## 2. Descargar Archivos
Acceso estático a los archivos PDF generados.

- **Endpoint:** `/files/:filename`
- **Método:** `GET`

### Ejemplo de Uso
Para descargar un archivo después de generarlo, usa la ruta proporcionada en el campo `download` de la respuesta exitosa del endpoint `/generate`.

```bash
GET http://localhost:8080/files/a1b2c3d4.pdf
```

### Respuestas Posibles

#### ✅ 200 OK
El archivo PDF se sirve directamente.

#### ❌ 404 Not Found
El archivo solicitado no existe en la carpeta `output`.
