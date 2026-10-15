# 💖 TRENDY BEAUTY ERP — Sistema Integral de Inventarios Cosméticos

> **ERP de gestión y optimización de inventarios con políticas $(Q, R)$ y $(s, S)$, modelo EOQ, stock de seguridad y punto de reorden para una marca de cosméticos.**  
> Diseñado con estética premium *WOW* (paleta rosa chicle, magenta, lila y violeta con glassmorphism), microanimaciones, Recharts y responsive al 100%.

---

## 🚀 Despliegue en Producción & Credenciales Demo

- **Repositorio Oficial en GitHub:** [https://github.com/Camigg023/beauty-crm](https://github.com/Camigg023/beauty-crm)
- **URL Pública en Producción:** [https://github.com/Camigg023/beauty-crm](https://github.com/Camigg023/beauty-crm) *(Servidor de producción listo para Vercel / Render)*
- **Ambiente Local / Previsualización:** `http://localhost:3000`

### 🔑 Credenciales de Acceso Demo (Admin)
- **Usuario:** `admin@trendybeauty.co` (o `admin`)
- **Contraseña:** `TrendyAdmin2026!` (o `admin`)
*(La pantalla de login incluye botón de autorrelleno rápido con 1 solo clic).*

---

## 💄 1. Catálogo Oficial (Exactamente 3 Productos)
Los 3 productos fueron cotejados con referencias y precios reales del mercado de cosméticos en Colombia (**Trendy Shop Colombia**):

| # | Producto | Referencia Trendy | Precio Venta (COP) | Costo Unitario Est. (45%) | URL Tienda Oficial | Fecha Consulta |
|---|---|---|---|---|---|---|
| **1** | **Gloss Labial Retro Glow** | `BLT2222` | **$10.000 COP** | $4.500 COP | [Ver en Trendy](https://maquillajetrendyshop.com/producto/gloss-retro-glow/) | 15/10/2026 |
| **2** | **Rubor En Crema Star** | `RCS2205` | **$15.000 COP** | $6.750 COP | [Ver en Trendy](https://maquillajetrendyshop.com/producto/rubor-blush-stamp/) | 15/10/2026 |
| **3** | **Pestañina Super Look** | `PSL1374` | **$15.000 COP** | $6.750 COP | [Ver en Trendy](https://maquillajetrendyshop.com/producto/pestanina-super-look/) | 15/10/2026 |

---

## 📐 2. Modelos Matemáticos y Fórmulas Utilizadas

El sistema implementa de forma rigurosa la teoría clásica de control de inventarios estocástico:

### 2.1 Demanda Diaria y Semanal
Para una demanda anual proyectada $D$:
- **Demanda diaria:**  
  $$d_d = \frac{D}{365}$$
- **Demanda semanal:**  
  $$d_w = \frac{D}{52}$$

### 2.2 Stock de Seguridad ($SS$)
Protege al negocio contra la variabilidad de la demanda durante el tiempo de reposición del proveedor (Lead Time $W$ en semanas):
$$SS = Z \times \sigma_w \times \sqrt{W}$$
Donde:
- $W$ = Lead time o tiempo de entrega del proveedor en semanas.
- $\sigma_w$ = Desviación estándar de la demanda semanal.
- $Z$ = Factor de la distribución normal según el Nivel de Servicio configurable:
  - **90%:** $Z = 1.282$
  - **95% (Por defecto):** $Z = 1.645$
  - **98%:** $Z = 2.054$
  - **99%:** $Z = 2.326$

### 2.3 Punto de Reorden ($ROP$)
Nivel de inventario en el cual el sistema dispara automáticamente la alarma de compra:
$$ROP = (d_w \times W) + SS$$
*(Demanda esperada durante el lead time + el colchón de seguridad).*

### 2.4 Cantidad Económica de Pedido ($EOQ$)
Minimiza la suma de costos de emisión de pedido y costos de almacenamiento:
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
Donde:
- $S$ = Costo fijo por emitir una orden de compra (en COP).
- $H$ = Costo de mantener una unidad en bodega durante un año (en COP/unidad/año).

### 2.5 Cobertura en Días
$$\text{Cobertura} = \frac{\text{Stock Actual}}{d_d} = \frac{\text{Stock Actual}}{D / 365}$$

### 2.6 Políticas de Inventario Soportadas
1. **Política $(Q, R)$ [Por Defecto]:** Cuando el inventario disponible cae por debajo o igual al punto de reorden $R$ ($ROP$), se emite un pedido de tamaño fijo $Q$ (calculado con $EOQ$ o sobrescrito manualmente).
2. **Política $(s, S)$ [Alternativa]:** Revisión continua donde, cuando el stock baja del nivel mínimo $s$ ($ROP$), se emite un pedido por la cantidad necesaria para alcanzar el stock objetivo $S$ ($S - \text{Stock Actual}$).

---

## 🚦 3. Sistema de Alarmas y Notificaciones Inteligentes

El ERP evalúa en tiempo real cada movimiento de inventario (venta, ajuste, recepción):

- 🟢 **Nivel Óptimo (Verde):** $\text{Stock} > ROP$.
- 🟡 **Alerta de Reorden (Amarillo):** $SS < \text{Stock} \le ROP$.
- 🔴 **Stock Crítico (Rojo):** $0 < \text{Stock} \le SS$.
- ⚫ **Quiebre de Stock (Negro / Rojo Intermitente):** $\text{Stock} = 0$.

### Acciones Automatizadas:
- **Banner interactivo en el Dashboard** cuando hay productos en reorden o quiebre.
- **Centro de Notificaciones** con pestaña de historial de alertas y opción de marcar como resueltas.
- **Sugerencia Automática de Compra:** Al activarse una alarma, el botón *"Generar orden de compra"* pre-llena una nueva orden con la cantidad $Q$ calculada por EOQ y el proveedor oficial, lista para emitirse con 1 clic.

---

## 📦 4. Módulos del Sistema

1. **Dashboard:**
   - KPIs financieros y de stock físico en COP.
   - Semáforo individualizado de los 3 productos con barras de progreso y comparativa $ROP/SS$.
   - Gráficos interactivos en **Recharts** con degradados (Stock vs. ROP vs. SS, Demanda y Rotación).
2. **Inventario & Kardex:**
   - Libro de movimientos con trazabilidad completa (Entradas, Salidas, Ajustes positivos y negativos).
   - Filtros por producto y tipo de movimiento.
   - Modal para registrar *Ajustes Manuales de Inventario*.
3. **Compras:**
   - Creación y seguimiento de Órdenes de Compra (OC).
   - Botón *"Recibir Mercancía"*: al recibir el pedido del proveedor, el stock sube automáticamente, se registra la entrada en Kardex y se actualiza el semáforo.
4. **Ventas:**
   - Formulario de facturación rápida por canales (Tienda Online, Instagram, Punto Físico).
   - Descarga inmediata del stock físico.
   - Si la venta hace que el stock caiga por debajo de $ROP$ o $SS$, dispara una alerta instantánea y sugiere abrir una orden de compra.
5. **Parámetros:**
   - Edición interactiva de $D$, $W$, $S$, $H$, nivel de servicio ($Z$), variabilidad ($\sigma$) y política ($(Q, R)$ vs $(s, S)$).
   - Selector para sobrescribir manualmente la cantidad $Q$.
   - **Recálculo matemático en tiempo real** en panel lateral mientras se digitan los valores.
6. **Simulador a 12 Semanas:**
   - Proyección dinámica a 3 meses según la política seleccionada.
   - Modos: Determinístico o con variabilidad estocástica de mercado ($\pm 25\%$).
   - Gráfico de curva diente de sierra con umbrales de seguridad y tabla detallada semana a semana.

---

## 🛠️ 5. Justificación de la Arquitectura y Stack Tecnológico

| Capa | Tecnología | Justificación Senior |
|---|---|---|
| **Framework** | **Next.js 14 (App Router)** | Permite unificar API Serverless y frontend en un solo artefacto optimizado, con renderizado híbrido (SSR + Client Components) y cero configuración de despliegue. |
| **Lenguaje** | **TypeScript 5** | Tipado estricto para modelos de inventario, kardex y fórmulas de optimización matemática, eliminando errores en tiempo de ejecución. |
| **Estilos & UI** | **Tailwind CSS + Glassmorphism** | Sistema de diseño ad-hoc para la industria de belleza y cosméticos. Gradientes de rosa chicle a violeta, bordes brillantes (*glow*), soporte nativo para modo claro y oscuro. |
| **Gráficos** | **Recharts** | Biblioteca declarativa de alta fidelidad basada en SVG con soporte para degradados lineales de color y animaciones suaves. |
| **Base de Datos** | **Capa de Abstracción Híbrida** | Store en memoria singleton con persistencia entre peticiones y compatibilidad nativa con PostgreSQL (Supabase / Neon) mediante adaptador SQL. Semilla de datos demo instantánea sin requerir migraciones complejas externas. |

---

## 💻 6. Cómo Ejecutar el Proyecto en Local

### Prerrequisitos:
- Node.js versión 18 o superior (`node -v`)
- npm versión 9 o superior (`npm -v`)

### Pasos:
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Camigg023/beauty-crm.git
   cd beauty-crm
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

4. Compilar para producción:
   ```bash
   npm run build
   npm run start
   ```

---

## 🎨 7. Modo Claro y Modo Oscuro
La aplicación cuenta con selector de tema en la barra superior:
- **Modo Claro:** Fondos suaves lila pastel (`#faf5ff`), tarjetas translúcidas blancas y acentos rosa/morado vibrantes.
- **Modo Oscuro:** Fondos violeta profundo (`#0d0614` a `#170a24`), tarjetas de vidrio oscuras con rebordes neón magenta y fucsia.

---

*Desarrollado con ❤️ para el sector cosmético colombiano.*
