# Beauty ERP 💄

Sistema de gestión de inventarios para un negocio de cosméticos. Permite controlar las existencias, registrar ventas y compras, consultar los movimientos del inventario y calcular cuándo es necesario realizar un nuevo pedido.

El proyecto aplica modelos de investigación de operaciones para apoyar las decisiones de compra, incluyendo el modelo EOQ, el stock de seguridad y el punto de reorden.

## Tecnologías utilizadas

- **Next.js 14:** desarrollo de la aplicación.
- **TypeScript:** tipado de datos y lógica del sistema.
- **Tailwind CSS:** estilos y diseño adaptable.
- **Recharts:** visualización de datos mediante gráficos.
- **Node.js y npm:** entorno de ejecución y gestión de dependencias.

## Funcionalidades

### Dashboard
Resumen del inventario, indicadores de stock y gráficos para consultar el estado de los productos.

### Inventario y Kardex
Registro de entradas, salidas y ajustes de existencias. Permite consultar los movimientos realizados y mantener un seguimiento de los cambios en el inventario.

### Compras
Creación y seguimiento de órdenes de compra. Al registrar la recepción de un pedido, se actualizan las existencias y se registra el movimiento correspondiente.

### Ventas
Registro de ventas por diferentes canales, como tienda online, Instagram y punto físico. Las unidades vendidas se descuentan del inventario y se actualizan las alertas cuando corresponde.

### Parámetros de inventario
Configuración de la demanda estimada, el tiempo de entrega del proveedor, los costos asociados al inventario y el nivel de servicio. Los resultados se recalculan al modificar los parámetros.

### Simulador de inventario
Proyección del comportamiento del stock durante 12 semanas, según la política de inventario seleccionada. Incluye escenarios determinísticos y escenarios con variabilidad en la demanda.

### Notificaciones
Alertas para identificar productos que necesitan reposición, tienen existencias críticas o se encuentran agotados.

## Modelos matemáticos

El sistema utiliza los siguientes modelos para calcular los niveles de inventario:

- **EOQ (Economic Order Quantity):** calcula una cantidad de pedido que busca equilibrar los costos de ordenar y mantener inventario.
- **Stock de seguridad:** establece una reserva para responder a variaciones de la demanda durante el tiempo de entrega.
- **Punto de reorden (ROP):** indica cuándo se debe solicitar una reposición.
- **Cobertura de inventario:** estima cuántos días puede mantenerse el inventario actual al ritmo de demanda proyectado.
- **Políticas de inventario (Q, R) y (s, S):** permiten trabajar con una cantidad de pedido fija o reponer hasta alcanzar un nivel objetivo.

Estos cálculos pueden modificarse mediante los parámetros de cada producto, lo que permite comparar diferentes escenarios de abastecimiento.

## Productos de ejemplo

El sistema incluye un catálogo de tres productos cosméticos:

| Producto | Referencia | Precio de venta |
|---|---|---:|
| Gloss Labial Retro Glow | BLT2222 | $10.000 COP |
| Rubor en Crema Star | RCS2205 | $15.000 COP |
| Pestañina Super Look | PSL1374 | $15.000 COP |

Los productos y sus valores forman parte de los datos utilizados para la demostración del sistema.

## Instalación y ejecución

### Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Git.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Camigg023/beauty-crm.git
cd beauty-crm
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Antes de ejecutar el proyecto, crea tu archivo `.env.local` a partir de la plantilla `.env.local.example`.

En Windows, ejecuta:

```bash
copy .env.local.example .env.local
```

En macOS o Linux, ejecuta:

```bash
cp .env.local.example .env.local
```

Abre el archivo `.env.local` y completa las variables con tus propias credenciales y configuraciones, siguiendo las indicaciones de `.env.local.example`.

### Autenticación con email y Google

El login permite crear cuentas con correo y contraseña, además de iniciar sesión con Google. Configura `BETTER_AUTH_SECRET` con un secreto aleatorio de al menos 32 caracteres y `BETTER_AUTH_URL` con el origen de la aplicación. Completa `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` desde Google Cloud Console. Registra estas URI de redirección en el cliente OAuth:

- Local: `http://localhost:3000/api/auth/callback/google`
- Producción: `https://tu-dominio.com/api/auth/callback/google`

Antes del primer registro, crea una rama de desarrollo en Neon y apunta `DATABASE_URL` a su conexión directa (sin `-pooler`). Después ejecuta `npx auth@latest migrate`; el comando crea las tablas de autenticación (`user`, `session`, `account` y `verification`). No ejecutes esta migración contra producción sin revisar y aprobar explícitamente la conexión configurada.

**Importante:**
- No compartas contraseñas ni claves privadas.
- No subas `.env.local` a GitHub; debe permanecer privado.
- Si agregas nuevas variables de entorno, actualiza también `.env.example` sin incluir credenciales reales.
- No coloques contraseñas ni secretos en variables que comiencen con `NEXT_PUBLIC_`, ya que pueden quedar expuestos al navegador.

### 4. Iniciar el entorno de desarrollo

```bash
npm run dev
```

Abre en el navegador la dirección que indique la terminal. Si el proyecto está configurado para utilizar el puerto 3000, puedes acceder desde `http://localhost:3000`.

### 5. Generar la compilación de producción

```bash
npm run build
npm run start
```

## Interfaz

La aplicación utiliza una paleta de tonos rosa, magenta, lila y violeta, con componentes translúcidos y animaciones sutiles. También incluye modo claro y modo oscuro, además de una interfaz adaptable a diferentes tamaños de pantalla.

## Repositorio

Código fuente: [github.com/Camigg023/beauty-crm](https://github.com/Camigg023/beauty-crm)
Despliegue: beauty-mkm45r5o0-camigg023s-projects.vercel.app
---

Proyecto desarrollado como aplicación de gestión de inventarios para el sector cosmético, integrando desarrollo web y modelos matemáticos de control de inventarios.
