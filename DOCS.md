# MANUAL TÉCNICO Y DE INSTALACIÓN - MARKETPLACE PRO

## 1. REQUISITOS DEL SISTEMA
- **Node.js**: v18 o superior.
- **MySQL / XAMPP**: Para el almacenamiento de datos.
- **Visual Studio Code**: Recomendado para el desarrollo.

## 2. CONFIGURACIÓN
1. Clonar el repositorio o descargar el ZIP.
2. Abrir XAMPP e iniciar **Apache** y **MySQL**.
3. Crear la base de datos `amazon` e importar el archivo `database.sql`.

## 3. EJECUCIÓN
```bash
npm install
npm run dev
```

## 4. ARQUITECTURA (3.3)
El sistema utiliza una **Arquitectura en Capas (Layered Architecture)** distribuida de la siguiente manera:
1. **Presentación (Frontend)**: Desarrollada en Vue 3 con Pinia.
2. **Capa del Controlador (Backend)**: Recibe las peticiones HTTP (Express).
3. **Capa del Servicio**: Contiene la lógica de negocio (validaciones, procesos).
4. **Capa del Repositorio**: Gestiona las consultas SQL a la base de datos.
5. **Base de Datos**: MySQL (XAMPP).

## 5. SEGURIDAD (3.7)
- **Autenticación**: JWT (JSON Web Tokens).
- **Contraseñas**: Hash con Bcrypt para evitar almacenamiento en texto plano.
- **Middleware**: Control de acceso en endpoints protegidos.

## 6. ENDPOINTS (3.3.3)
- `POST /api/login`: Inicio de sesión y obtención de token.
- `GET /api/productos`: Consulta de catálogo.
- `POST /api/transacciones`: Registro de compras.
- `GET /api/reportes`: Informe estadístico.
- `GET /api-docs`: Documentación interactiva (Swagger).
