import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

export default function Chat({ auth, users, chatUser, initialMessages }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);

    // Sync local state when Inertia props change (i.e. switching users)
    useEffect(() => {
        setMessages(initialMessages || []);
    }, [initialMessages]);

    // Listen to the private WebSocket channel for incoming messages
    useEffect(() => {
        if (!chatUser || !window.Echo) return;

        // Create a unique shared channel name for these two users
        const id1 = auth.user.id < chatUser.id ? auth.user.id : chatUser.id;
        const id2 = auth.user.id > chatUser.id ? auth.user.id : chatUser.id;
        const channelName = `chat.${id1}.${id2}`;

        const channel = window.Echo.private(channelName);

        channel.listen('MessageSent', (e) => {
            if (e.message.sender_id !== auth.user.id) {
                setMessages((prev) => [...prev, e.message]);
            }
        });

        channel.listenForWhisper('typing', (e) => {
            if (e.userID === chatUser.id) {
                setIsTyping(true);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
            }
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [chatUser, auth.user.id]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatUser) return;

        const payload = {
            receiver_id: chatUser.id,
            text: newMessage,
        };

        // Optimistically update the UI, or wait for the response (waiting chosen here)
        axios.post(route('messages.send'), payload).then((response) => {
            setMessages((prev) => [...prev, response.data]);
            setNewMessage('');
        });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (chatUser && window.Echo) {
            const id1 = auth.user.id < chatUser.id ? auth.user.id : chatUser.id;
            const id2 = auth.user.id > chatUser.id ? auth.user.id : chatUser.id;
            
            window.Echo.private(`chat.${id1}.${id2}`).whisper('typing', {
                userID: auth.user.id
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}
        >
            <Head title="Chat" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex space-x-4 h-[600px]">
                    {/* Users Sidebar */}
                    <div className="w-1/3 bg-white overflow-hidden shadow-sm sm:rounded-lg p-4 overflow-y-auto">
                        <h3 className="font-bold mb-4">Users</h3>
                        <ul>
                            {users.map((user) => (
                                <li
                                    key={user.id}
                                >
                                    <Link
                                        href={route('chat', user.id)}
                                        className={`block p-2 rounded ${chatUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                    >
                                        {user.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Chat Area */}
                    <div className="w-2/3 bg-white overflow-hidden shadow-sm sm:rounded-lg flex flex-col">
                        {chatUser ? (
                            <>
                                <div className="p-4 border-b font-bold bg-gray-50">{chatUser.name}</div>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender_id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-2 rounded-lg max-w-xs ${msg.sender_id === auth.user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="text-gray-500 text-sm italic mt-2">
                                            {chatUser.name} is typing...
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={sendMessage} className="p-4 border-t flex">
                                    <input type="text" value={newMessage} onChange={handleTyping} placeholder="Type a message..." className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">Send</button>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">Select a user to start chatting</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}