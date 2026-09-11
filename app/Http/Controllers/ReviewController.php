<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function create()
    {
        return Inertia::render('Reviews/Create', [
            'reviews' => Review::visible()
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->paginate(24)
                ->through(fn (Review $r) => $this->present($r)),
            'stats' => $this->stats(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'author_name' => ['nullable', 'string', 'max:80'],
            'rating'      => ['required', 'integer', 'between:1,5'],
            'body'        => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'rating.required' => 'Elegí un puntaje del 1 al 5.',
            'rating.between'  => 'El puntaje tiene que estar entre 1 y 5 estrellas.',
            'body.required'   => 'Escribí tu reseña.',
            'body.min'        => 'Contanos un poco más (mínimo 5 caracteres).',
        ]);

        Review::create([
            'author_name' => $data['author_name'] ? trim($data['author_name']) : null,
            'rating'      => $data['rating'],
            'body'        => trim($data['body']),
            'is_visible'  => true,
        ]);

        return redirect()
            ->route('reviews.create')
            ->with('flash', ['review_submitted' => '¡Gracias! Tu reseña se publicó correctamente.']);
    }

    private function present(Review $r): array
    {
        return [
            'id'          => $r->id,
            'author_name' => $r->author_name,
            'rating'      => (int) $r->rating,
            'body'        => $r->body,
            'created_at'  => optional($r->created_at)->toIso8601String(),
        ];
    }

    private function stats(): array
    {
        $base = Review::visible();
        $count = (clone $base)->count();

        return [
            'count'   => $count,
            'average' => $count > 0 ? round((float) (clone $base)->avg('rating'), 1) : 0.0,
        ];
    }
}
