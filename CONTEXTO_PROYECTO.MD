# Contexto del proyecto — La Tienda de los Niños

> Documento de referencia técnica del proyecto. Describe la arquitectura, el modelo
> de dominio, los flujos principales y las decisiones no evidentes desde el código.
> Última revisión del código: rama `main`, commit `827f2d4`.

---

## 1. Resumen

**La Tienda de los Niños** es una tienda online (e‑commerce) de indumentaria infantil
para el mercado argentino. Vende tres tipos de producto:

1. **Prendas** sueltas (remeras, pantalones, bodies, etc.).
2. **Combos** tradicionales: un pack a precio fijo donde el cliente elige un talle y,
   dentro de cada categoría del combo, qué prenda concreta quiere.
3. **Combos Emprendedor**: packs mayoristas para revendedores. El cliente arma su
   propio pack eligiendo hasta *N* prendas de un set curado, cada una con su talle,
   respetando límites por categoría. Precio mínimo alto ($100.000).

**No hay pago online.** El checkout no cobra: junta los datos del cliente, crea la
orden en estado `pending` y arma un mensaje de WhatsApp con el detalle del pedido.
La tienda coordina envío y pago por WhatsApp. Todo el sitio empuja al contacto por
WhatsApp (botón flotante, CTA en checkout, links en footer).

El proyecto incluye un **panel de administración** (`/admin/*`) para gestionar
catálogo, combos, pedidos y métricas.

- Idioma de la UI y del código de negocio: **español (Argentina)**.
- Contribuidores principales (git): `Matias` / `mArchilli` (archillimatias@gmail.com),
  `leoncomolli`. Primer commit: 2026‑05‑09.
- Desarrollado por "PAMPA LABS" (crédito en el footer).

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | **Laravel 12**, PHP **8.2+** |
| Puente front/back | **Inertia.js 2** (`inertiajs/inertia-laravel`, `@inertiajs/react`) |
| Frontend | **React 18** con JSX (sin TypeScript) |
| Build | **Vite 7** + `@vitejs/plugin-react` + `laravel-vite-plugin` |
| Estilos | **Tailwind CSS 3** + `@tailwindcss/forms` |
| Auth scaffolding | **Laravel Breeze** (variante React) + **Sanctum** |
| Rutas en JS | **Ziggy** (`tightenco/ziggy`, helper global `route()`) |
| Imágenes | **Intervention Image 3** (resize en subida) + **League Glide 3** (transformaciones on‑the‑fly) |
| Lightbox de imágenes | `yet-another-react-lightbox` |
| Base de datos | **SQLite** por defecto (`DB_CONNECTION=sqlite`); configurable a MySQL |
| Sesión / cache / colas | driver `database` por defecto |
| Testing | **PHPUnit 11** (solo los tests de auth/perfil que trae Breeze) |
| Lint PHP | **Laravel Pint** |

### Scripts

```jsonc
// package.json
"scripts": {
  "build": "vite build",
  "dev": "vite"
}
```

```jsonc
// composer.json
"scripts": {
  "setup": [ "composer install", "copy .env.example → .env", "key:generate",
             "migrate --force", "npm install", "npm run build" ],
  "dev":   "concurrently: php artisan serve | queue:listen | pail | npm run dev",
  "test":  [ "config:clear", "php artisan test" ]
}
```

Para desarrollo: `composer dev` levanta servidor + worker de colas + logs (Pail) +
Vite en paralelo.

---

## 3. Estructura de carpetas relevante

```
app/
  Console/Commands/OptimizeProductImages.php   # comando images:optimize
  Http/
    Controllers/
      Admin/           # panel admin: Product, Combo, ComboEmprendedor, Category,
                       # Color, Size, Order, Metrics
      Auth/            # Breeze
      CartController.php        # carrito + checkout + confirmación (núcleo del negocio)
      CatalogController.php     # /catalogo
      ProductController.php     # ficha pública de prenda
      ComboController.php       # ficha pública de combo
      ComboEmprendedorController.php  # ficha pública de combo emprendedor
      DashboardController.php   # /dashboard (admin)
      ImageController.php       # sirve/transforma imágenes de productos
    Middleware/HandleInertiaRequests.php   # props compartidas
  Models/            # Product, Category, Size, Color, Gender, Combo, ComboItem,
                     # ComboEmprendedor, ComboEmprendedorItem,
                     # ComboEmprendedorCategoryLimit, Cart, CartItem, ComboCartItem,
                     # Order, OrderItem, User
  Services/
    StockService.php   # ajuste de stock por ítem de orden (+/-)
    ImageProcessor.php  # wrapper de Intervention (GD > Imagick > none)
routes/
  web.php            # todo el ruteo del sitio + prefijo admin
  auth.php           # Breeze
resources/
  js/
    Pages/           # componentes de página Inertia (uno por vista)
    Layouts/         # StorefrontLayout (público) + AuthenticatedLayout (admin)
    Components/Storefront/   # Header, Footer, TopBar, Hero, FAQ, WhatsAppButton, ...
  css/app.css        # tokens de tema (variables CSS) + utilidades Tailwind
  views/app.blade.php # plantilla raíz de Inertia
database/migrations/ # ~38 migraciones (ver §6)
public/images/       # logo.png, hero, etc. Subcarpetas products/ combos/ ... ignoradas por git
```

---

## 4. Modelo de dominio

### 4.1 Diagrama conceptual

```
Gender ─┐ (n:m gender_product)
Category ┼─── Product ───┬─ (n:m category_product)
Color ──┘               ├─ (n:m color_product)
                        └─ (n:m product_size CON pivote stock)   ← el stock vive acá

Combo ──┬─ belongsTo Gender
        ├─ (n:m combo_size)
        └─ hasMany ComboItem (combo_id, category_id, product_id, quantity)

ComboEmprendedor ──┬─ (n:m combo_emprendedor_gender)
                   ├─ hasMany ComboEmprendedorItem (product_id)   ← set curado
                   └─ hasMany ComboEmprendedorCategoryLimit (category_id, max_items)

Order ──< OrderItem (product_id NULLABLE, quantity, price, size, combo_data JSON)
```

### 4.2 Product ([app/Models/Product.php](app/Models/Product.php))

```php
protected $fillable = ['name', 'description', 'price', 'images', 'is_featured'];
protected $casts = ['is_featured' => 'boolean'];

// relaciones
categories()  belongsToMany
sizes()       belongsToMany ->withPivot('stock')   // stock por talle
colors()      belongsToMany
genders()     belongsToMany
```

- **`images` es un accessor/mutator custom.** En la base se guarda un JSON de rutas
  de *storage*; al leer se transforma a rutas de *URL*. El mapeo usa variables de
  entorno para poder separar dónde se guarda el archivo de bajo qué URL se sirve:

```php
protected function images(): Attribute
{
    $storagePath = rtrim(env('PUBLIC_IMAGES_PATH', 'images'), '/');
    $urlPath     = rtrim(env('PUBLIC_IMAGES_URL_PATH', 'images'), '/');

    return Attribute::make(
        get: fn ($value) => array_map(
            fn ($path) => '/' . $urlPath . '/' . ltrim(substr($path, strlen($storagePath) + 1), '/'),
            json_decode($value, true) ?? []
        ),
        set: fn ($value) => json_encode(array_map(
            fn ($url) => $storagePath . '/' . ltrim(substr(ltrim($url, '/'), strlen($urlPath) + 1), '/'),
            (array) $value
        )),
    );
}
```

- Originalmente `Product` tenía `gender_id` directo; una migración
  (`2026_03_06_000000_create_gender_product_table`) lo movió a relación n:m y borró
  el género "Unisex".

### 4.3 Size ([app/Models/Size.php](app/Models/Size.php))

Los talles se ordenan por "familia" y luego por número. Lógica reutilizable:

```php
// Bebé (0) < Niño/a (1) < Otros (2); dentro de cada familia, asc por primer número.
public static function sortKey(string $name): array { /* [$cat, $num] */ }
public static function compareNames(string $a, string $b): int;
```

El frontend (catálogo) replica esta idea con `isBabySize()` (talles numéricos 0–6 o
que contienen "bebe/beba/rn" se consideran de bebé).

### 4.4 Combo ([app/Models/Combo.php](app/Models/Combo.php))

Combo **tradicional**: precio fijo, un único género, un set de talles vendibles y
una lista de `ComboItem`. Cada `ComboItem` = (categoría, producto, cantidad). En la
ficha pública se agrupan por categoría: el cliente ve, por cada categoría, cuántas
prendas debe elegir (`quantity`) y entre qué productos.

Regla de negocio en el admin ([Admin/ComboController::assertSizeCoverage](app/Http/Controllers/Admin/ComboController.php)):
no se puede guardar un combo en un talle si alguna de sus categorías no tiene al
menos una prenda con stock en ese talle ("cobertura de talles").

### 4.5 ComboEmprendedor ([app/Models/ComboEmprendedor.php](app/Models/ComboEmprendedor.php))

```php
protected $fillable = ['name','description','price','max_items','is_active','is_featured','image'];
```

- `max_items`: tope de prendas que el cliente puede meter en el pack.
- `items`: **set curado** de productos elegibles (tabla `combo_emprendedor_items`,
  única por `(combo_emprendedor_id, product_id)`).
- `categoryLimits`: por cada categoría, un `max_items`. **La suma de los límites por
  categoría debe ser igual a `max_items` del combo** (validado en
  `Admin/ComboEmprendedorController::validatePayload`).
- `genders`: n:m.
- Validación de precio: `price >= 100000` ("El precio mínimo de un combo emprendedor
  es de $100.000").
- En la ficha pública, los productos se agrupan **por talle** (solo talles con
  stock > 0); un mismo producto puede aparecer en varios grupos.

### 4.6 Carrito — **basado en sesión, no en base de datos**

> ⚠️ Existen los modelos `Cart`, `CartItem`, `ComboCartItem` y sus migraciones, pero
> **la implementación activa del carrito NO los usa**. El carrito vive en
> `session('cart')`. Los modelos/tablas son código muerto de una implementación
> anterior.

Estructura en sesión ([CartController](app/Http/Controllers/CartController.php)):

```php
session('cart') = [
  'products' => [
     'p-<productId>-<sizeId|none>' => [
        'key','product_id','name','image','size_id','size_name','price','quantity'
     ],
  ],
  'combos' => [
     // combo tradicional
     'c-<comboId>-<sizeId>-<genderKey>-<md5(picks)>' => [
        'key','combo_id','name','image','size_id','size_name','gender_id','gender_name',
        'picks' => [ <categoryId> => [<productId>, ...] ],   // qué eligió por categoría
        'price','quantity'
     ],
     // combo emprendedor  (variant = 'emprendedor')
     'ce-<comboId>-<md5(picks)>' => [
        'key','variant'=>'emprendedor','combo_id','name','image',
        'size_id'=>null,'gender_name',
        'picks' => [ ['product_id','size_id','size_name'], ... ],  // cada prenda su talle
        'price','quantity'
     ],
  ],
]
```

Endpoints del carrito ([routes/web.php](routes/web.php)):

```
GET    /carrito                       cart.index
POST   /carrito/producto              cart.add-product
POST   /carrito/combo                 cart.add-combo
POST   /carrito/combo-emprendedor     cart.add-combo-emprendedor
PATCH  /carrito/{key}                 cart.update       (cambiar cantidad)
DELETE /carrito/{key}                 cart.remove
DELETE /carrito                       cart.clear
GET    /checkout                      checkout.index
POST   /checkout                      checkout.store    (crea la orden)
GET    /checkout/confirmacion         checkout.confirmation
```

### 4.7 Order / OrderItem ([app/Models/Order.php](app/Models/Order.php))

```php
// Order — constantes de estado
const STATUS_PENDING = 'pending';         // pedido "facturable"
const STATUS_CONFIRMED = 'confirmed';
const STATUS_CANCELLED = 'cancelled';     // NO cuenta en métricas ni consume stock

const SHIPPING_STATUS_PENDING    = 'pending';
const SHIPPING_STATUS_DISPATCHED = 'dispatched';
const SHIPPING_STATUS_DELIVERED  = 'delivered';
const SHIPPING_STATUS_CANCELLED  = 'cancelled';

// Datos del cliente / envío guardados en la orden (no hay cuenta de usuario obligatoria)
first_name, last_name, email, dni, phone,
shipping_method ('home' | 'branch'), courier_company,
province, city, postal_code, address, observations
user_id  // nullable — la mayoría de las compras son de invitados
```

`OrderItem`:

```php
protected $fillable = ['order_id','product_id','quantity','price','size','combo_data'];
protected $casts = ['combo_data' => 'array'];
```

- `product_id` es **nullable**: los ítems de combo lo dejan en `null`.
- `combo_data` (JSON) para ítems de combo guarda:
  `{ variant, combo_id, name, gender_id, gender_name, picks }`.
  Es la "foto" del combo al momento de la compra (así el pedido se puede reconstruir
  aunque después cambien el combo o borren prendas).

---

## 5. Flujos principales

### 5.1 Home (`/`)

[routes/web.php](routes/web.php) arma la home inline (sin controller): combos activos
(destacados primero) + productos `is_featured`, y renderiza `Pages/Welcome`
(Hero, FeaturedCombos, PriceRangeSection, CategoryShortcuts, About, FAQ).

### 5.2 Catálogo (`/catalogo`)

[CatalogController::index](app/Http/Controllers/CatalogController.php) envía **todo**
el catálogo con stock > 0 (combos, combos emprendedor, prendas) + listas de talles y
categorías disponibles. **Todo el filtrado/orden es client‑side** en
[Pages/Catalog.jsx](resources/js/Pages/Catalog.jsx):

- Filtros: audiencia (niño/niña/bebé/beba = género + si el talle es de bebé),
  talles, categorías (solo aplican a prendas), rangos de precio, "solo destacados",
  búsqueda por nombre (con debounce 250 ms), tipo (combos / prendas), orden.
- Los filtros se leen/escriben también en la query string (`?audiencia=`, `?talles=`,
  `?categorias=`, `?destacados=1`, `?precio_min`, `?precio_max`, `?tipo=`), por lo que
  el footer y otras secciones linkean a `/catalogo?audiencia=nino`, etc.
- **Snapshot de estado**: al navegar a una ficha (`/producto/...`, `/combo/...`,
  `/combo-emprendedor/...`) guarda filtros + scroll en `sessionStorage`
  (`catalog:snapshot`) y los restaura al volver. Cualquier otra navegación descarta
  el snapshot.
- Paginación progresiva ("Cargar más prendas", 20 por tanda) e hints de prioridad de
  carga de imágenes (`fetchpriority`) para mejorar el LCP.

### 5.3 Fichas de producto / combo

- [ProductController::show](app/Http/Controllers/ProductController.php): prenda +
  talles con stock + colores + géneros + hasta 5 relacionadas por categoría.
- [ComboController::show](app/Http/Controllers/ComboController.php): combo con sus
  categorías agrupadas, cada una con `quantity` y productos elegibles (con talles y
  stock). `abort(404)` si `!is_active`.
- [ComboEmprendedorController::show](app/Http/Controllers/ComboEmprendedorController.php):
  productos agrupados por talle + `category_limits` + `max_items`.

### 5.4 Checkout (`POST /checkout` → [CartController::placeOrder](app/Http/Controllers/CartController.php))

1. Valida los datos de envío (reglas dependen de `shipping_method`: si es `home`
   exige `address` y permite `observations`).
2. Reconstruye la vista del carrito y verifica que no esté vacío.
3. **Control de stock agregado** (ver §5.5) — pre‑chequeo fuera de transacción.
4. `DB::transaction`:
   - Re‑chequeo de stock **con `lockForUpdate`** sobre `product_size` (verdad
     autoritativa frente a pedidos concurrentes; si falla lanza `RuntimeException`).
   - Crea la `Order` (`status = pending`, `shipping_status = pending`).
   - Crea un `OrderItem` por cada ítem (combo → `product_id = null` + `combo_data`).
   - `StockService::adjustForOrderItem($orderItem, -1)` descuenta stock.
5. Vacía el carrito, guarda `confirmation_order_id` en sesión, redirige a
   `/checkout/confirmacion`.

### 5.5 Control de stock (clave y no trivial)

El stock real vive **solo** en el pivote `product_size.stock`. Como una misma
prenda/talle puede aparecer en varios ítems del carrito (una prenda suelta + dentro
de un combo + dentro de otro combo), el chequeo por ítem no alcanza. `CartController`
tiene helpers estáticos:

```php
// Demanda total del carrito agrupada por "productId:sizeId"
protected static function cartDemand(array $cart): array;

// Devuelve un mensaje de error legible si la demanda supera el stock, o null.
// $lock=true agrega lockForUpdate (se usa dentro de la transacción de checkout).
protected static function stockErrorMessage(array $cart, bool $lock = false): ?string;

// Cantidad máxima comprable de un ítem concreto del carrito (mira el stock actual;
// para combos toma el mínimo entre las prendas elegidas / veces que aparecen).
public static function maxQuantityFor(array $raw): int;   // tope duro 99
```

[StockService::adjustForOrderItem($item, $sign)](app/Services/StockService.php)
suma/resta `$sign * quantity` al stock de cada prenda del ítem:

- Combo emprendedor (`variant = 'emprendedor'`): cada `pick` trae su propio
  `size_id`.
- Combo tradicional / prenda suelta: usan el `size` (nombre) del ítem, resuelto a
  `Size` por nombre.
- Nunca deja el stock negativo (`max(0, ...)`); si el pivote no existe y `$delta > 0`
  lo crea.

### 5.6 Confirmación + mensaje de WhatsApp

[CartController::confirmation](app/Http/Controllers/CartController.php) valida contra
`session('confirmation_order_id')`, reconstruye el detalle y arma el mensaje:

```php
$message = $this->buildWhatsappMessage($order);
$number  = preg_replace('/\D+/', '', config('services.whatsapp.business_number'));
$whatsappUrl = 'https://wa.me/' . $number . '?text=' . rawurlencode($message);
```

`buildWhatsappMessage()` produce un texto con encabezado, datos del cliente, datos de
envío, lista de productos/combos (con las prendas incluidas y talles) y total en ARS.
La página `Pages/Checkout/Confirmation` ofrece el botón para abrir WhatsApp
(en móvil se hace redirección directa para evitar el bloqueo de popups — commit
`df5debe`).

Número de negocio: `config/services.php` → `whatsapp.business_number`
(env `WHATSAPP_BUSINESS_NUMBER`, default `5491172397202`).

---

## 6. Base de datos y migraciones

`DB_CONNECTION=sqlite` por defecto (`database/database.sqlite`). Se puede pasar a
MySQL, pero ojo: algunas migraciones de *data* usan SQL específico de motor
(`2026_03_06_000000_create_gender_product_table` tiene rama sqlite/mysql en el `up()`,
pero el `down()` usa `UPDATE ... INNER JOIN` que es solo MySQL).

### Tablas principales

| Tabla | Notas |
|-------|-------|
| `products` | `name, description, price(8,2), images(json), is_featured` |
| `categories`, `sizes`, `colors`, `genders` | solo `name` + timestamps |
| `category_product`, `color_product`, `gender_product` | pivotes n:m de producto |
| `product_size` | pivote **con `stock` (int)** — fuente de verdad del stock |
| `combos` | `gender_id?, name, description, price(10,2), is_active, is_featured, image?` |
| `combo_items` | `combo_id, category_id, product_id, quantity(tinyint, def 1)` |
| `combo_size` | pivote combo↔talle (único) |
| `combo_cart_items` | *(no usado por el carrito actual)* |
| `combo_emprendedors` | `name, description, price(10,2), max_items(smallint, def 50), is_active, is_featured, image?` |
| `combo_emprendedor_items` | set curado, único `(combo_emprendedor_id, product_id)` |
| `combo_emprendedor_gender` | pivote |
| `combo_emprendedor_category_limits` | `category_id, max_items(smallint)`, único por combo+categoría |
| `carts`, `cart_items` | *(no usados por el carrito actual)* |
| `orders` | datos de cliente + envío + `status` + `shipping_status`; `user_id` nullable |
| `order_items` | `product_id` nullable, `combo_data` json |
| `offers` | `product_id, name, discount_price, discount_percentage?, start_date?, end_date?, is_active` — **feature incompleta** (ver §9) |
| `users`, `cache`, `jobs`, `sessions` | estándar Laravel/Breeze |

### Historia de esquema (resumen por fecha de migración)

- **2025‑02 / 03**: catálogo base (products, categorías, talles, colores), pivotes,
  `product_size` con stock, géneros, carrito en DB (luego abandonado).
- **2025‑04**: `orders` + `order_items`.
- **2026‑01**: `is_featured` en products, tabla `offers`, `price` en `cart_items`,
  datos de cliente (`first_name/last_name/email`) y `observations/courier_company`
  en `orders`.
- **2026‑02**: normalización de `shipping_status` español→inglés.
- **2026‑03**: `gender_id` de products → pivote `gender_product`; se elimina "Unisex".
- **2026‑05 (combos)**: `combos`, `combo_items`, `combo_size`, `combo_data` en
  `order_items`, `image`/`is_featured`/`gender_id` en combos, `quantity` en
  `combo_items`, `user_id` nullable en `orders`.
- **2026‑05/06 (combos emprendedor)**: `combo_emprendedors` + pivotes + items +
  `combo_emprendedor_category_limits`.

### Seeders

`DatabaseSeeder` → `UserSeeder` únicamente. `UserSeeder` crea **un usuario admin
hardcodeado** (`Franco Arias`, con contraseña en texto plano en el repo). No hay
seeders de catálogo.

---

## 7. Panel de administración

Prefijo `/admin`, middleware `['auth', 'verified']`, nombre `admin.*`
([routes/web.php](routes/web.php)).

> ⚠️ **No hay roles ni policies.** Cualquier usuario autenticado y con email
> verificado tiene acceso total al panel. El único usuario se crea vía seeder.

Layout: [AuthenticatedLayout.jsx](resources/js/Layouts/AuthenticatedLayout.jsx)
(sidebar colapsable, persiste estado en `localStorage`, menú fullscreen en mobile).

Secciones:

| Ruta | Controller | Qué hace |
|------|-----------|----------|
| `/dashboard` | `DashboardController` | Ingresos del mes vs. mes anterior, pendientes, pedidos de hoy, totales de catálogo, últimos 7 días, últimos 6 pedidos, top 5 productos del mes. Excluye órdenes `cancelled`. |
| `/admin/orders` | `Admin\OrderController` | Pedidos por mes, agrupados en pendientes / despachados+entregados / cancelados. Métricas por método de envío. `updateStatus` cambia `shipping_status`. |
| `/admin/orders/{order}` | idem | Detalle completo del pedido con reconstrucción de combos y sus prendas. |
| `/admin/metrics` | `Admin\MetricsController` | Vista `month` o `day`. Ingresos, tickets, ítems, top productos/combos, histórico (12 meses / 30 días), all‑time. |
| `PATCH /admin/metrics/orders` | `updateOrders` | Marca pedidos como facturables/cancelados en lote; **ajusta stock** vía `StockService` (cancelar devuelve stock, reactivar lo descuenta). |
| `/admin/products` | `Admin\ProductController` | CRUD de prendas. Filtros (búsqueda, categoría, color, talle, género, destacados, stock 0), orden, paginado 12, `bulkDestroy`. Subida de imágenes con resize a **800×1066**. |
| `/admin/combos` | `Admin\ComboController` | CRUD de combos. Endpoint auxiliar `categories-for-sizes` (AJAX). Valida "cobertura de talles". Imágenes resize a **800×800**. |
| `/admin/combos-emprendedor` | `Admin\ComboEmprendedorController` | CRUD combos emprendedor. Endpoint `products-for-genders` (AJAX). Valida: precio ≥ $100.000, prendas con categoría, suma de límites = `max_items`, sin categorías repetidas. |
| `/admin/categories`, `/colors`, `/sizes` | respectivos | CRUD simple con guardas de "en uso" (no se puede borrar si hay prendas/combos asociados). `bulkDestroy`. |
| `/profile` | `ProfileController` (Breeze) | Editar perfil / cambiar contraseña / borrar cuenta. |

---

## 8. Imágenes

Tres piezas:

1. **Subida** (`Admin\ProductController::uploadImages`, `Admin\ComboController::uploadImage`):
   guarda en `public/images/products` (o `.../combos`, `.../combos-emprendedor`) con
   nombre `uniqid().ext` y llama a `ImageProcessor::resizeDownInPlace()` para que no
   exceda el máximo. Las carpetas de subida están **en `.gitignore`**.

2. **`ImageProcessor`** ([app/Services/ImageProcessor.php](app/Services/ImageProcessor.php)):
   wrapper de Intervention Image. Elige driver `gd` → `imagick` → `none`
   (si no hay ninguno, no redimensiona y loguea un warning).

3. **Servido / transformación on‑the‑fly** ([ImageController::show](app/Http/Controllers/ImageController.php)):
   ruta `GET /images/products/{filename}` (regex `.*`). Usa **League Glide** con
   caché en `storage/app/glide-cache`; acepta params `w, h, fit, q, fm`. Si no hay
   driver de imágenes, sirve el archivo crudo. `Cache-Control: public, max-age=31536000`.

4. **Comando** `php artisan images:optimize [--dry-run]`
   ([OptimizeProductImages](app/Console/Commands/OptimizeProductImages.php)):
   redimensiona en lote `public/images/products/*` a máx **800×1066**, calidad 85.

Variables de entorno relacionadas: `PUBLIC_IMAGES_PATH`, `PUBLIC_IMAGES_URL_PATH`,
`COMBO_IMAGES_PATH` (todas default `images`).

---

## 9. Frontend

### 9.1 Bootstrap Inertia

[resources/js/app.jsx](resources/js/app.jsx): resuelve páginas desde
`./Pages/**/*.jsx`. Plantilla raíz [resources/views/app.blade.php](resources/views/app.blade.php)
carga fuente **Figtree** (fonts.bunny.net), `@routes` (Ziggy), `@viteReactRefresh`,
`@vite` y `@inertiaHead`.

### 9.2 Props compartidas ([HandleInertiaRequests](app/Http/Middleware/HandleInertiaRequests.php))

```php
'auth'         => ['user' => $request->user()],
'cartCount'    => fn () => CartController::totalItems(),
'floatingCart' => fn () => CartController::currentCart(),   // items + subtotal
'flash'        => fn () => $request->session()->get('flash'),
```

### 9.3 Layouts

- [StorefrontLayout](resources/js/Layouts/StorefrontLayout.jsx): `TopBar`
  (marquee de "envíos a todo el país" + "todos los métodos de pago") + `Header`
  (nav Inicio / Catálogo / Contacto + carrito, menú fullscreen en mobile) + contenido
  + `Footer` + `CartButton` flotante + `WhatsAppButton` flotante.
- `AuthenticatedLayout`: panel admin (ver §7).

### 9.4 Páginas (`resources/js/Pages`)

```
Welcome.jsx            Catalog.jsx           Contact.jsx           Error.jsx
Product/Show.jsx       Combo/Show.jsx        ComboEmprendedor/Show.jsx
Cart/Index.jsx         Checkout/Index.jsx    Checkout/Confirmation.jsx
Dashboard.jsx          Profile/Edit.jsx
Auth/*                 (Breeze: Login, ForgotPassword, ResetPassword, ...)
Admin/Products/Index.jsx      Admin/Combos/Index.jsx
Admin/CombosEmprendedor/Index.jsx   Admin/Categories/Index.jsx
Admin/Colors/Index.jsx       Admin/Sizes/Index.jsx
Admin/Orders/Index.jsx       Admin/Orders/Show.jsx
Admin/Metrics/Index.jsx      Admin/Metrics/Orders.jsx
```

Los formularios del admin (crear/editar prenda, combo, etc.) están implementados como
**modales dentro de la página `Index`** correspondiente, no como páginas aparte.

### 9.5 Tema y estilos

[resources/css/app.css](resources/css/app.css) define tokens como variables CSS en
`:root` y `.storefront-theme` (triplas RGB para poder usar `<alpha-value>` de
Tailwind). [tailwind.config.js](tailwind.config.js) expone la paleta `brand.*`:

| Token | Storefront | Admin |
|-------|-----------|-------|
| `brand-primary` | coral `#FF5A4E` | azul petróleo `rgb(30 38 53)` |
| `brand-cta` | coral `#FF5A4E` | coral `#FF5A4E` |
| `brand-bg` | `#F8F6F3` | `#F8F6F3` |

Es decir: el sitio público es coral; el panel admin es azul oscuro. La clase
`.storefront-theme` (aplicada en `StorefrontLayout`) redefine los tokens.
Utilidades propias: `.store-shell`, `.store-section`, `.store-panel`, `.store-card`,
`.home-section-title`, `.home-angular` (bordes menos redondeados en la home).

### 9.6 Manejo de errores

[bootstrap/app.php](bootstrap/app.php) intercepta respuestas 403 / 404 / 503 (y 500
en producción) y renderiza `Pages/Error` de Inertia con el status.

---

## 10. Autenticación

- Breeze (variante React). Registro **deshabilitado** (no hay ruta `register` en
  `routes/auth.php`).
- Rutas: `login`, `logout`, `forgot-password`, `reset-password`, verificación de
  email, confirmación de contraseña.
- `/dashboard` y `/admin/*` requieren `auth` + `verified`.
- `/profile` requiere solo `auth`.
- El usuario admin se crea con `UserSeeder`. No hay flujo de alta de usuarios.

---

## 11. Configuración / entorno

`.env.example` (valores por defecto):

```ini
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
DB_CONNECTION=sqlite
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
MAIL_MAILER=log
```

Variables adicionales que usa este proyecto (no están en `.env.example`, conviene
setearlas):

| Variable | Uso | Default en código |
|----------|-----|-------------------|
| `APP_TIMEZONE` | zona horaria (config/app.php ahora es `env('APP_TIMEZONE','UTC')`). **Setear `America/Argentina/Buenos_Aires`** para que el agrupado por día en Dashboard/Métricas sea correcto (commit `827f2d4`). | `UTC` |
| `WHATSAPP_BUSINESS_NUMBER` | número destino del pedido | `5491172397202` |
| `PUBLIC_IMAGES_PATH` | carpeta de storage de imágenes de producto | `images` |
| `PUBLIC_IMAGES_URL_PATH` | prefijo de URL de imágenes de producto | `images` |
| `COMBO_IMAGES_PATH` | carpeta de storage de imágenes de combo | `images` |

`.gitignore` ignora: `.env*`, `/vendor`, `/node_modules`, `/public/build`,
`/public/storage`, y **`/public/images/products`, `/public/images/combos`,
`/public/images/combos-emprendedor`** (las imágenes subidas no se versionan).

Redes sociales referenciadas en el front (hardcodeadas en `Footer.jsx`):
TikTok `@latiendadelosninios`, Instagram `@latiendadelosninos`, WhatsApp.

---

## 12. Testing

Solo los tests que trae Breeze:

```
tests/Feature/Auth/*      (autenticación, verificación de email, reset de contraseña)
tests/Feature/ProfileTest.php
tests/Feature/ExampleTest.php, tests/Unit/ExampleTest.php
```

**No hay tests** para carrito, checkout, stock, combos, métricas ni panel admin —
que es donde está toda la lógica de negocio. Es la mayor deuda de cobertura.

---

## 13. Puntos de atención / deuda técnica

1. **Sin autorización por roles**: `/admin/*` solo pide `auth + verified`. Cualquier
   usuario verificado es administrador de facto.
2. **`UserSeeder` con contraseña en texto plano** en el repositorio.
3. **Carrito en sesión, no en cuenta**: se pierde si expira la sesión y no queda
   ligado al usuario. Los modelos `Cart` / `CartItem` / `ComboCartItem` y sus tablas
   están sin uso.
4. **Feature de ofertas (`offers`) incompleta**: existe la migración `offers` pero
   **no existe el modelo `Offer`**. `CartItem::getUnitPriceAttribute()` referencia
   `Product::activeOffer` / `$product->active_offer`, relaciones que **no existen** en
   `Product`. Como el carrito activo no usa `CartItem`, no rompe en runtime, pero es
   código a limpiar o completar.
5. **Portabilidad de BD**: pensado para SQLite. El `down()` de
   `create_gender_product_table` usa SQL solo‑MySQL. Migrar a MySQL requiere revisar
   esa migración.
6. **Migraciones con estilos mezclados**: clases nombradas antiguas
   (`class CreateProductsTable extends Migration`) y clases anónimas modernas.
7. **Dos migraciones casi idénticas** para agregar `price` a `cart_items`
   (`2026_01_15_185808` está vacía, `2026_01_15_185825` hace el trabajo).
8. **Sin tests de negocio** (ver §12).
9. **Datos sensibles hardcodeados en el front**: número de WhatsApp y links de redes
   aparecen tanto en `config/services.php` como duplicados en varios componentes
   React (`Footer.jsx`, `TopBar.jsx`, `WhatsAppButton.jsx`).

---

## 14. Puesta en marcha (local)

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite          # si no existe
php artisan migrate --seed               # crea el usuario admin del UserSeeder
npm install
composer dev                             # server + queue + pail + vite

# opcional
php artisan images:optimize --dry-run
```

Requisitos: PHP 8.2+, Node, y **extensión GD o Imagick** de PHP si se quieren
redimensionar/servir imágenes con Glide (si falta, el sitio funciona pero sirve las
imágenes sin transformar).
