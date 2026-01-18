# Cifra Club Cancionero API

Servidor en Go que convierte listas de canciones de Cifra Club en un PDF.

## Endpoints

### 1. Generar Cancionero
`GET /generate?url=<CIFRACLUB_LIST_URL>`

Ejemplo:
`/generate?url=https://www.cifraclub.com.br/juan-gabriel/`

Retorna un JSON con el nombre del archivo generado:
```json
{
  "message": "PDF generated successfully",
  "filename": "7a2b3c4d.pdf",
  "download": "/files/7a2b3c4d.pdf"
}
```

### 2. Acceder al Archivo
`GET /files/:filename`

Ejemplo:
`/files/7a2b3c4d.pdf`

## Cómo ejecutar localmente

1. Instalar dependencias:
   ```bash
   go mod download
   ```

2. Instalar Playwright y navegadores:
   ```bash
   go run github.com/playwright-community/playwright-go/cmd/playwright@latest install --with-deps
   ```

3. Ejecutar el servidor:
   ```bash
   go run .
   ```

El servidor iniciará en el puerto 8080 por defecto.
