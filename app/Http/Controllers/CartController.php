<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Size;
use Illuminate\Http\Request;
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

        $combos = array_values(array_map(fn ($i) => [
            'key'         => $i['key'],
            'type'        => 'combo',
            'combo_id'    => $i['combo_id'],
            'name'        => $i['name'],
            'image'       => $i['image'],
            'size_id'     => $i['size_id'] ?? null,
            'size_name'   => $i['size_name'] ?? null,
            'gender_id'   => $i['gender_id'] ?? null,
            'gender_name' => $i['gender_name'] ?? null,
            'picks'       => $i['picks'] ?? [],
            'price'       => (float) $i['price'],
            'quantity'    => (int) $i['quantity'],
            'subtotal'    => (float) $i['price'] * (int) $i['quantity'],
        ], $cart['combos'] ?? []));

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
            'gender_id' => ['required', 'integer', 'exists:genders,id'],
            'picks'     => ['required', 'array'],
            'picks.*'   => ['array'],
            'picks.*.*' => ['integer', 'exists:products,id'],
            'quantity'  => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $combo  = Combo::findOrFail($data['combo_id']);
        $size   = Size::find($data['size_id']);
        $gender = Gender::find($data['gender_id']);

        $picksHash = md5(json_encode($data['picks']));
        $key       = 'c-' . $combo->id . '-' . $data['size_id'] . '-' . $data['gender_id'] . '-' . $picksHash;

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
                'gender_id'   => $gender->id,
                'gender_name' => $gender->name,
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

        $request->validate($rules);

        // El procesamiento de la orden / pago todavía no está implementado.
        // Por ahora limpiamos el carrito y volvemos al inicio con un flash.
        $this->saveCart(['products' => [], 'combos' => []]);

        return redirect()->route('home')->with('flash', [
            'order_placed' => 'Recibimos tu pedido. Te contactaremos a la brevedad.',
        ]);
    }
}
