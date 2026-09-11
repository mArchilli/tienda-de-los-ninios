<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $filter = in_array($request->query('visibility'), ['visible', 'hidden'], true)
            ? $request->query('visibility')
            : 'all';
        $search = trim((string) $request->query('search', ''));

        $reviews = Review::query()
            ->when($filter === 'visible', fn ($q) => $q->where('is_visible', true))
            ->when($filter === 'hidden', fn ($q) => $q->where('is_visible', false))
            ->when($search !== '', fn ($q) => $q->where(fn ($sub) => $sub
                ->where('body', 'like', "%{$search}%")
                ->orWhere('author_name', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Review $r) => [
                'id'          => $r->id,
                'author_name' => $r->author_name,
                'rating'      => (int) $r->rating,
                'body'        => $r->body,
                'is_visible'  => (bool) $r->is_visible,
                'created_at'  => optional($r->created_at)->toIso8601String(),
            ]);

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => ['visibility' => $filter, 'search' => $search],
            'counts'  => [
                'all'     => Review::count(),
                'visible' => Review::where('is_visible', true)->count(),
                'hidden'  => Review::where('is_visible', false)->count(),
            ],
        ]);
    }

    public function updateVisibility(Request $request, Review $review)
    {
        $data = $request->validate([
            'is_visible' => ['required', 'boolean'],
        ]);

        $review->update(['is_visible' => $data['is_visible']]);

        return back()->with('success', $data['is_visible']
            ? 'Reseña visible en la web.'
            : 'Reseña oculta.');
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return back()->with('success', 'Reseña eliminada.');
    }
}
