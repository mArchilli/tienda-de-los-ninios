<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboEmprendedor;
use App\Models\Gender;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    // ─── Helpers de sesión ────────────────────────────────────────────────────

    protected function getCart(): array
    {
        return session('cart', ['products' => [], 'combos' => []]);
    }

    protected function saveCart(array $cart): void
    {
        session(['cart' => $cart]);
    }

    public static function totalItems(?array $cart = null): int
    {
        $cart = $cart ?? session('cart', ['products' => [], 'combos' => []]);
        $count = 0;
        foreach (($cart['products'] ?? []) as $item) {
            $count += (int) ($item['quantity'] ?? 0);
        }
        foreach (($cart['combos'] ?? []) as $item) {
            $count += (int) ($item['quantity'] ?? 0);
        }
        return $count;
    }

    public static function currentCart(): array
    {
        $cart     = session('cart', ['products' => [], 'combos' => []]);
        $products = array_values(array_map(fn ($i) => [
            'key'         => $i['key'],
            'type'        => 'product',
            'name'        => $i['name'],
            'image'       => $i['image'],
            'size_name'   => $i['size_name'] ?? null,
            'price'       => (float) $i['price'],
            'quantity'    => (int) $i['quantity'],
            'subtotal'    => (float) $i['price'] * (int) $i['quantity'],
        ], $cart['products'] ?? []));

        $combos = array_values(array_map(fn ($i) => [
            'key'         => $i['key'],
            'type'        => 'combo',
            'name'        => $i['name'],
            'image'       => $i['image'],
            'size_name'   => $i['size_name'] ?? null,
            'gender_name' => $i['gender_name'] ?? null,
            'price'       => (float) $i['price'],
            'quantity'    => (int) $i['quantity'],
            'subtotal'    => (float) $i['price'] * (int) $i['quantity'],
        ], $cart['combos'] ?? []));

        $items = array_merge($products, $combos);

        return [
            'items'    => $items,
            'subtotal' => array_sum(array_column($items, 'subtotal')),
        ];
    }

    protected function buildView(array $cart): array
    {
        $products = array_values(array_map(fn ($i) => [
            'key'        => $i['key'],
            'type'       => 'product',
            'product_id' => $i['product_id'],
            'name'       => $i['name'],
            'image'      => $i['image'],
            'size_id'    => $i['size_id'] ?? null,
            'size_name'  => $i['size_name'] ?? null,
            'price'      => (float) $i['price'],
            'quantity'   => (int) $i['quantity'],
            'subtotal'   => (float) $i['price'] * (int) $i['quantity'],
        ], $cart['products'] ?? []));

        // Pre-load category and product names for all combo picks in one query each.
        $allCategoryIds = [];
        $allProductIds  = [];
        foreach ($cart['combos'] ?? [] as $i) {
            if (($i['variant'] ?? null) === 'emprendedor') {
                foreach ($i['picks'] ?? [] as $pick) {
                    $allProductIds[] = (int) ($pick['product_id'] ?? 0);
                }
            } else {
                foreach ($i['picks'] ?? [] as $catId => $productIds) {
                    $allCategoryIds[] = (int) $catId;
                    foreach ((array) $productIds as $pid) {
                        $allProductIds[] = (int) $pid;
                    }
                }
            }
        }
        $categoryNames = $allCategoryIds
            ? Category::whereIn('id', array_unique($allCategoryIds))->pluck('name', 'id')
            : collect();
        $productNames  = $allProductIds
            ? Product::whereIn('id', array_unique($allProductIds))->pluck('name', 'id')
            : collect();

        $combos = array_values(array_map(function ($i) use ($categoryNames, $productNames) {
            $variant      = $i['variant'] ?? 'combo';
            $picksDisplay = [];

            if ($variant === 'emprendedor') {
                // Agrupamos picks por nombre de talle: cada talle muestra las prendas elegidas.
                $bySize = [];
                foreach ($i['picks'] ?? [] as $pick) {
                    $sizeName = $pick['size_name'] ?? '—';
                    $name = $productNames[(int) ($pick['product_id'] ?? 0)] ?? null;
                    if (! $name) continue;
                    if (! isset($bySize[$sizeName])) $bySize[$sizeName] = [];
                    $bySize[$sizeName][] = $name;
                }
                foreach ($bySize as $sizeName => $prods) {
                    $picksDisplay[] = [
                        'category_name' => 'Talle ' . $sizeName,
                        'products'      => $prods,
                    ];
                }
            } else {
                foreach ($i['picks'] ?? [] as $catId => $productIds) {
                    $catName = $categoryNames[(int) $catId] ?? null;
                    $prods   = [];
                    foreach ((array) $productIds as $pid) {
                        $name = $productNames[(int) $pid] ?? null;
                        if ($name) {
                            $prods[] = $name;
                        }
                    }
                    if ($catName || $prods) {
                        $picksDisplay[] = [
                            'category_name' => $catName ?? "Categoría {$catId}",
                            'products'      => $prods,
                        ];
                    }
                }
            }

            return [
                'key'          => $i['key'],
                'type'         => 'combo',
                'variant'      => $variant,
                'combo_id'     => $i['combo_id'],
                'name'         => $i['name'],
                'image'        => $i['image'],
                'size_id'      => $i['size_id'] ?? null,
                'size_name'    => $i['size_name'] ?? null,
                'gender_id'    => $i['gender_id'] ?? null,
                'gender_name'  => $i['gender_name'] ?? null,
                'picks'        => $i['picks'] ?? [],
                'picks_display'=> $picksDisplay,
                'price'        => (float) $i['price'],
                'quantity'     => (int) $i['quantity'],
                'subtotal'     => (float) $i['price'] * (int) $i['quantity'],
            ];
        }, $cart['combos'] ?? []));

        $items    = array_merge($products, $combos);
        $subtotal = array_sum(array_column($items, 'subtotal'));

        return [
            'items'    => $items,
            'subtotal' => $subtotal,
            'count'    => self::totalItems($cart),
        ];
    }

    // ─── Vistas ───────────────────────────────────────────────────────────────

    public function index()
    {
        $view = $this->buildView($this->getCart());

        return Inertia::render('Cart/Index', [
            'cart' => $view,
        ]);
    }

    public function checkout()
    {
        $view = $this->buildView($this->getCart());

        if (empty($view['items'])) {
            return redirect()->route('cart.index');
        }

        return Inertia::render('Checkout/Index', [
            'cart' => $view,
        ]);
    }

    // ─── Mutaciones ───────────────────────────────────────────────────────────

    public function addProduct(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'size_id'    => ['nullable', 'integer', 'exists:sizes,id'],
            'quantity'   => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::with('sizes')->findOrFail($data['product_id']);

        $sizeName = null;
        if (! empty($data['size_id'])) {
            $size = $product->sizes->firstWhere('id', $data['size_id']);
            if (! $size) {
                return back()->withErrors(['size_id' => 'Talle inválido para este producto.']);
            }
            $sizeName = $size->name;
        }

        $key  = 'p-' . $product->id . '-' . ($data['size_id'] ?? 'none');
        $cart = $this->getCart();

        if (isset($cart['products'][$key])) {
            $cart['products'][$key]['quantity'] += (int) $data['quantity'];
        } else {
            $cart['products'][$key] = [
                'key'        => $key,
                'product_id' => $product->id,
                'name'       => $product->name,
                'image'      => $product->images[0] ?? null,
                'size_id'    => $data['size_id'] ?? null,
                'size_name'  => $sizeName,
                'price'      => (float) $product->price,
                'quantity'   => (int) $data['quantity'],
            ];
        }

        $this->saveCart($cart);

        return back()->with('flash', [
            'cart_added' => 'Producto agregado al carrito.',
        ]);
    }

    public function addCombo(Request $request)
    {
        $data = $request->validate([
            'combo_id'  => ['required', 'integer', 'exists:combos,id'],
            'size_id'   => ['required', 'integer', 'exists:sizes,id'],
            'picks'     => ['required', 'array'],
            'picks.*'   => ['array'],
            'picks.*.*' => ['integer', 'exists:products,id'],
            'quantity'  => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $combo  = Combo::with('gender')->findOrFail($data['combo_id']);
        $size   = Size::find($data['size_id']);
        $gender = $combo->gender;

        $picksHash = md5(json_encode($data['picks']));
        $genderKey = $gender ? $gender->id : 'na';
        $key       = 'c-' . $combo->id . '-' . $data['size_id'] . '-' . $genderKey . '-' . $picksHash;

        $cart = $this->getCart();
        $qty  = (int) ($data['quantity'] ?? 1);

        if (isset($cart['combos'][$key])) {
            $cart['combos'][$key]['quantity'] += $qty;
        } else {
            $cart['combos'][$key] = [
                'key'         => $key,
                'combo_id'    => $combo->id,
                'name'        => $combo->name,
                'image'       => $combo->image ? '/' . ltrim($combo->image, '/') : null,
                'size_id'     => $size->id,
                'size_name'   => $size->name,
                'gender_id'   => $gender?->id,
                'gender_name' => $gender?->name,
                'picks'       => $data['picks'],
                'price'       => (float) $combo->price,
                'quantity'    => $qty,
            ];
        }

        $this->saveCart($cart);

        return back()->with('flash', [
            'cart_added' => 'Combo agregado al carrito.',
        ]);
    }

    public function addComboEmprendedor(Request $request)
    {
        $comboId = (int) $request->input('combo_emprendedor_id');
        $combo   = ComboEmprendedor::with(['items', 'genders'])->findOrFail($comboId);

        $data = $request->validate([
            'combo_emprendedor_id' => ['required', 'integer', 'exists:combo_emprendedors,id'],
            'picks'                => ['required', 'array', 'min:1', 'max:' . $combo->max_items],
            'picks.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'picks.*.size_id'      => ['required', 'integer', 'exists:sizes,id'],
            'quantity'             => ['nullable', 'integer', 'min:1', 'max:99'],
        ], [
            'picks.max' => "Este combo permite hasta {$combo->max_items} prendas.",
            'picks.min' => 'Elegí al menos una prenda para armar el combo.',
        ]);

        // Curaduría: todos los productos elegidos deben estar dentro del set permitido.
        $allowedProductIds = $combo->items->pluck('product_id')->map(fn ($id) => (int) $id)->all();
        foreach ($data['picks'] as $pick) {
            if (! in_array((int) $pick['product_id'], $allowedProductIds, true)) {
                return back()->withErrors([
                    'picks' => 'Una o más prendas seleccionadas no forman parte del combo.',
                ]);
            }
        }

        $sizeIds   = array_unique(array_map(fn ($p) => (int) $p['size_id'], $data['picks']));
        $sizeNames = Size::whereIn('id', $sizeIds)->pluck('name', 'id');

        $picks = array_map(fn ($p) => [
            'product_id' => (int) $p['product_id'],
            'size_id'    => (int) $p['size_id'],
            'size_name'  => $sizeNames[(int) $p['size_id']] ?? null,
        ], $data['picks']);

        $genderNames = $combo->genders->pluck('name')->all();

        $picksHash = md5(json_encode($picks));
        $key       = 'ce-' . $combo->id . '-' . $picksHash;

        $cart = $this->getCart();
        $qty  = (int) ($data['quantity'] ?? 1);

        if (isset($cart['combos'][$key])) {
            $cart['combos'][$key]['quantity'] += $qty;
        } else {
            $cart['combos'][$key] = [
                'key'         => $key,
                'variant'     => 'emprendedor',
                'combo_id'    => $combo->id,
                'name'        => $combo->name,
                'image'       => $combo->image ? '/' . ltrim($combo->image, '/') : null,
                'size_id'     => null,
                'size_name'   => null,
                'gender_id'   => null,
                'gender_name' => $genderNames ? implode(' / ', $genderNames) : null,
                'picks'       => $picks,
                'price'       => (float) $combo->price,
                'quantity'    => $qty,
            ];
        }

        $this->saveCart($cart);

        return back()->with('flash', [
            'cart_added' => 'Combo emprendedor agregado al carrito.',
        ]);
    }

    public function update(Request $request, string $key)
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cart = $this->getCart();

        if (isset($cart['products'][$key])) {
            $cart['products'][$key]['quantity'] = (int) $data['quantity'];
        } elseif (isset($cart['combos'][$key])) {
            $cart['combos'][$key]['quantity'] = (int) $data['quantity'];
        } else {
            return back()->withErrors(['key' => 'Item no encontrado.']);
        }

        $this->saveCart($cart);

        return back();
    }

    public function remove(string $key)
    {
        $cart = $this->getCart();

        unset($cart['products'][$key], $cart['combos'][$key]);

        $this->saveCart($cart);

        return back();
    }

    public function clear()
    {
        $this->saveCart(['products' => [], 'combos' => []]);

        return back();
    }

    public function placeOrder(Request $request)
    {
        $rules = [
            'shipping_method' => ['required', 'in:home,branch'],
            'first_name'      => ['required', 'string', 'max:120'],
            'last_name'       => ['required', 'string', 'max:120'],
            'email'           => ['required', 'email', 'max:160'],
            'dni'             => ['required', 'string', 'max:20'],
            'province'        => ['required', 'string', 'max:80'],
            'locality'        => ['required', 'string', 'max:120'],
            'postal_code'     => ['required', 'string', 'max:20'],
            'courier'         => ['required', 'string', 'max:80'],
            'phone'           => ['required', 'string', 'max:30'],
        ];

        if ($request->input('shipping_method') === 'home') {
            $rules['address']      = ['required', 'string', 'max:200'];
            $rules['observations'] = ['nullable', 'string', 'max:500'];
        }

        $data = $request->validate($rules);

        $view = $this->buildView($this->getCart());
        if (empty($view['items'])) {
            return redirect()->route('cart.index')->withErrors([
                'cart' => 'Tu carrito está vacío.',
            ]);
        }

        $stock = app(StockService::class);

        $order = DB::transaction(function () use ($data, $view, $stock) {
            $order = Order::create([
                'user_id'         => Auth::check() ? Auth::id() : null,
                'total'           => $view['subtotal'],
                'status'          => Order::STATUS_PENDING,
                'shipping_status' => Order::SHIPPING_STATUS_PENDING,
                'first_name'      => $data['first_name'],
                'last_name'       => $data['last_name'],
                'email'           => $data['email'],
                'dni'             => $data['dni'],
                'phone'           => $data['phone'],
                'shipping_method' => $data['shipping_method'],
                'courier_company' => $data['courier'],
                'province'        => $data['province'],
                'city'            => $data['locality'],
                'postal_code'     => $data['postal_code'],
                'address'         => $data['address'] ?? null,
                'observations'    => $data['observations'] ?? null,
            ]);

            foreach ($view['items'] as $item) {
                if (($item['type'] ?? null) === 'combo') {
                    $orderItem = OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => null,
                        'quantity'   => $item['quantity'],
                        'price'      => $item['price'],
                        'size'       => $item['size_name'] ?? null,
                        'combo_data' => [
                            'variant'     => $item['variant'] ?? 'combo',
                            'combo_id'    => $item['combo_id'] ?? null,
                            'name'        => $item['name'],
                            'gender_id'   => $item['gender_id'] ?? null,
                            'gender_name' => $item['gender_name'] ?? null,
                            'picks'       => $item['picks'] ?? [],
                        ],
                    ]);
                } else {
                    $orderItem = OrderItem::create([
                        'order_id'   => $order->id,
                        'product_id' => $item['product_id'] ?? null,
                        'quantity'   => $item['quantity'],
                        'price'      => $item['price'],
                        'size'       => $item['size_name'] ?? null,
                        'combo_data' => null,
                    ]);
                }

                $stock->adjustForOrderItem($orderItem, -1);
            }

            return $order;
        });

        // Vaciamos el carrito tras crear la orden.
        $this->saveCart(['products' => [], 'combos' => []]);

        // Guardamos el id de orden en sesión para autorizar la vista de confirmación.
        session(['confirmation_order_id' => $order->id]);

        return redirect()->route('checkout.confirmation');
    }

    public function confirmation()
    {
        $orderId = session('confirmation_order_id');
        if (! $orderId) {
            return redirect()->route('home');
        }

        $order = Order::with('items.product')->find($orderId);
        if (! $order) {
            session()->forget('confirmation_order_id');
            return redirect()->route('home');
        }

        // Resolve category/product names for combo picks in one batch query each.
        $allCategoryIds = [];
        $allProductIds  = [];
        foreach ($order->items as $item) {
            if ($item->combo_data && ! empty($item->combo_data['picks'])) {
                $variant = $item->combo_data['variant'] ?? 'combo';
                if ($variant === 'emprendedor') {
                    foreach ($item->combo_data['picks'] as $pick) {
                        $allProductIds[] = (int) ($pick['product_id'] ?? 0);
                    }
                } else {
                    foreach ($item->combo_data['picks'] as $catId => $productIds) {
                        $allCategoryIds[] = (int) $catId;
                        foreach ((array) $productIds as $pid) {
                            $allProductIds[] = (int) $pid;
                        }
                    }
                }
            }
        }
        $categoryNames = $allCategoryIds
            ? Category::whereIn('id', array_unique($allCategoryIds))->pluck('name', 'id')
            : collect();
        $productNames  = $allProductIds
            ? Product::whereIn('id', array_unique($allProductIds))->pluck('name', 'id')
            : collect();

        $items = $order->items->map(function ($item) use ($categoryNames, $productNames) {
            $isCombo      = ! is_null($item->combo_data);
            $picksDisplay = [];

            if ($isCombo && ! empty($item->combo_data['picks'])) {
                $variant = $item->combo_data['variant'] ?? 'combo';

                if ($variant === 'emprendedor') {
                    $bySize = [];
                    foreach ($item->combo_data['picks'] as $pick) {
                        $sizeName = $pick['size_name'] ?? '—';
                        $name = $productNames[(int) ($pick['product_id'] ?? 0)] ?? null;
                        if (! $name) continue;
                        if (! isset($bySize[$sizeName])) $bySize[$sizeName] = [];
                        $bySize[$sizeName][] = $name;
                    }
                    foreach ($bySize as $sizeName => $prods) {
                        $picksDisplay[] = [
                            'category_name' => 'Talle ' . $sizeName,
                            'products'      => $prods,
                        ];
                    }
                } else {
                    foreach ($item->combo_data['picks'] as $catId => $productIds) {
                        $catName = $categoryNames[(int) $catId] ?? "Categoría {$catId}";
                        $prods   = [];
                        foreach ((array) $productIds as $pid) {
                            $name = $productNames[(int) $pid] ?? null;
                            if ($name) {
                                $prods[] = $name;
                            }
                        }
                        $picksDisplay[] = [
                            'category_name' => $catName,
                            'products'      => $prods,
                        ];
                    }
                }
            }

            return [
                'type'          => $isCombo ? 'combo' : 'product',
                'name'          => $isCombo
                    ? ($item->combo_data['name'] ?? 'Combo')
                    : ($item->product?->name ?? 'Producto'),
                'size_name'     => $item->size ?? null,
                'gender_name'   => $isCombo ? ($item->combo_data['gender_name'] ?? null) : null,
                'quantity'      => (int) $item->quantity,
                'price'         => (float) $item->price,
                'subtotal'      => (float) $item->price * (int) $item->quantity,
                'picks_display' => $picksDisplay,
            ];
        })->values()->all();

        $message     = $this->buildWhatsappMessage($order);
        $number      = preg_replace('/\D+/', '', (string) config('services.whatsapp.business_number'));
        $whatsappUrl = $number
            ? 'https://wa.me/' . $number . '?text=' . rawurlencode($message)
            : null;

        return Inertia::render('Checkout/Confirmation', [
            'order' => [
                'id'              => $order->id,
                'total'           => (float) $order->total,
                'first_name'      => $order->first_name,
                'last_name'       => $order->last_name,
                'email'           => $order->email,
                'phone'           => $order->phone,
                'shipping_method' => $order->shipping_method,
            ],
            'items'            => $items,
            'whatsapp_url'     => $whatsappUrl,
            'whatsapp_number'  => $number,
            'whatsapp_message' => $message,
        ]);
    }

    protected function buildWhatsappMessage(Order $order): string
    {
        $shippingLabel = $order->shipping_method === 'home' ? 'A Domicilio' : 'A Sucursal';
        $fmt = fn ($n) => '$' . number_format((float) $n, 2, ',', '.') . ' ARS';

        $lines = [];
        $lines[] = '*Nuevo Pedido #' . $order->id . '*';
        $lines[] = '';
        $lines[] = '*Cliente*';
        $lines[] = 'Nombre: ' . $order->first_name . ' ' . $order->last_name;
        $lines[] = 'DNI: ' . $order->dni;
        $lines[] = 'Email: ' . $order->email;
        $lines[] = 'Teléfono: ' . $order->phone;
        $lines[] = '';
        $lines[] = '*Envío*';
        $lines[] = 'Método: ' . $shippingLabel;
        if ($order->courier_company) {
            $lines[] = 'Empresa: ' . $order->courier_company;
        }
        $lines[] = 'Provincia: ' . $order->province;
        $lines[] = 'Localidad: ' . $order->city;
        $lines[] = 'CP: ' . $order->postal_code;
        if ($order->shipping_method === 'home' && $order->address) {
            $lines[] = 'Dirección: ' . $order->address;
        }
        if ($order->observations) {
            $lines[] = 'Observaciones: ' . $order->observations;
        }
        $lines[] = '';
        $lines[] = '*Productos*';

        // Pre-cargamos nombres de productos para los picks de combos (ambas variantes).
        $pickIds = [];
        foreach ($order->items as $item) {
            if ($item->combo_data && ! empty($item->combo_data['picks'])) {
                $variant = $item->combo_data['variant'] ?? 'combo';
                if ($variant === 'emprendedor') {
                    foreach ($item->combo_data['picks'] as $pick) {
                        $pickIds[] = (int) ($pick['product_id'] ?? 0);
                    }
                } else {
                    foreach ($item->combo_data['picks'] as $ids) {
                        foreach ((array) $ids as $id) {
                            $pickIds[] = (int) $id;
                        }
                    }
                }
            }
        }
        $pickNames = [];
        if (! empty($pickIds)) {
            $pickNames = Product::whereIn('id', array_unique($pickIds))->pluck('name', 'id')->toArray();
        }

        foreach ($order->items as $item) {
            $isCombo = ! is_null($item->combo_data);
            $variant = $isCombo ? ($item->combo_data['variant'] ?? 'combo') : null;
            $label   = $variant === 'emprendedor' ? 'Combo Emprendedor' : ($isCombo ? 'Combo' : 'Producto');
            $name    = $isCombo
                ? ($item->combo_data['name'] ?? $label)
                : ($item->product?->name ?? 'Producto');

            $details = [];
            if ($item->size) {
                $details[] = 'Talle ' . $item->size;
            }
            if ($isCombo && ! empty($item->combo_data['gender_name'])) {
                $details[] = $item->combo_data['gender_name'];
            }
            $detailsStr = $details ? ' (' . implode(' / ', $details) . ')' : '';

            $subtotal = (float) $item->price * (int) $item->quantity;
            $prefix   = $variant === 'emprendedor' ? '[Emprendedor] ' : '';
            $lines[]  = '• ' . $prefix . $name . $detailsStr . ' x ' . $item->quantity . ' — ' . $fmt($subtotal);

            if ($isCombo && ! empty($item->combo_data['picks'])) {
                if ($variant === 'emprendedor') {
                    $bySize = [];
                    foreach ($item->combo_data['picks'] as $pick) {
                        $sizeName = $pick['size_name'] ?? '—';
                        $pid      = (int) ($pick['product_id'] ?? 0);
                        if (! isset($pickNames[$pid])) continue;
                        $bySize[$sizeName][] = $pickNames[$pid];
                    }
                    foreach ($bySize as $sizeName => $prods) {
                        $lines[] = '   Talle ' . $sizeName . ': ' . implode(', ', $prods);
                    }
                } else {
                    $picked = [];
                    foreach ($item->combo_data['picks'] as $ids) {
                        foreach ((array) $ids as $id) {
                            if (isset($pickNames[$id])) {
                                $picked[] = $pickNames[$id];
                            }
                        }
                    }
                    if ($picked) {
                        $lines[] = '   Incluye: ' . implode(', ', $picked);
                    }
                }
            }
        }

        $lines[] = '';
        $lines[] = '*Total: ' . $fmt($order->total) . '*';
        $lines[] = '(El costo de envío se coordina aparte)';

        return implode("\n", $lines);
    }
}
