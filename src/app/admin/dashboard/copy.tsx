'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";

type Ticket = {
    _id: string;
    title: string;
    description: string;
    status: string;
    attachment?: string;
    comments?: string;
};

const AdminDashboard = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get("/api/tickets");
                setTickets(response.data);
            } catch (error) {
                console.error("Failed to fetch tickets:", error);
            }
        };

        fetchTickets();
    }, []);

    const handleStatusChange = async (id: string, newStatus: 'Pending' | 'Resolved') => {
        try {
            await axios.put("http://localhost:5000/api/tickets/${id}", {
                status: newStatus
            });

            setTickets(prev =>
                prev.map(ticket =>
                    ticket._id === id ? { ...ticket, status: newStatus } : ticket
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleCommentChange = async (id: string, newComment: string) => {
        try {
            await axios.put("http://localhost:5000/api/tickets/${id}", {
                comments: newComment
            });

            setTickets(prev =>
                prev.map(ticket =>
                    ticket._id === id ? { ...ticket, comments: newComment } : ticket
                )
            );
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    return (
<div className="p-6 space-y-6">
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>

    {tickets.map(ticket => (
        <div
            key={ticket._id}
            className="border border-gray-300 rounded-xl p-5 shadow-md bg-white"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    Ticket from <span className="text-blue-600">
                        {ticket._id ? `User${ticket._id.slice(-4)}` : 'Unknown User'}
                    </span>
                </h2>
                <span
                    className={`text-sm px-3 py-1 rounded-full ${
                        ticket.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                    {ticket.status}
                </span>
            </div>

            <p className="mt-2 text-gray-700">{ticket.description}</p>

            {ticket.attachment && (
                <a
                    href={ticket.attachment}
                    download
                    className="block mt-3 text-blue-600 underline"
                >
                    Download Attachment
                </a>
            )}

            <div className="mt-4">
                <label className="mr-2 font-medium">Update Status:</label>
                <select
                    value={ticket.status}
                    onChange={e =>
                        handleStatusChange(ticket._id, e.target.value as 'Pending' | 'Resolved')
                    }
                    className="border px-2 py-1 rounded"
                >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block font-medium mb-1">Admin Comment:</label>
                <textarea
                    value={ticket.comments || ''}
                    onChange={e => handleCommentChange(ticket._id, e.target.value)}
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Write your comment here..."
                />
            </div>
        </div>
    ))}
</div>

    );
};

export default AdminDashboard;