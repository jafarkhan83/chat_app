<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function show(?User $user = null)
    {
        $users = User::where('id', '!=', Auth::id())->get();
        $messages = [];

        if ($user) {
            $messages = Message::where(function ($query) use ($user) {
                $query->where('sender_id', Auth::id())
                      ->where('receiver_id', $user->id);
            })->orWhere(function ($query) use ($user) {
                $query->where('sender_id', $user->id)
                      ->where('receiver_id', Auth::id());
            })->orderBy('created_at', 'asc')->get();
        }

        return Inertia::render('Chat', [
            'users' => $users,
            'chatUser' => $user,
            'initialMessages' => $messages,
        ]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'text' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'text' => $request->text,
        ]);

        broadcast(new MessageSent($message));

        return response()->json($message);
    }
}
