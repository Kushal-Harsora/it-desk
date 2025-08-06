"use client"

import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender, getPaginationRowModel } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

import { ArrowUpDown, ChevronDown, Eye } from "lucide-react"


type Ticket = {
    id: string
    title: string
    problem: string
    status: string
    priority: string
    description: string
}

export default function AdminDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch("/api/tickets", {
                    method: "GET",
                    credentials: "include", // to send cookies if using session auth
                })
                const data = await res.json()
                setTickets(data)
            } catch (error) {
                console.error("Error fetching tickets:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTickets()
    }, [])

    // Filter button to get filtered tickets based on monthly, weekly....
    const handleFilter = async (type: string) => {
        setLoading(true)
        try {
            const url = type === "all" ? "/api/tickets" : `/api/tickets?filter=${type}`
            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            })
            const data = await res.json()
            setTickets(data)
        } catch (error) {
            console.error("Error fetching filtered tickets:", error)
        } finally {
            setLoading(false)
        }
    }


    const columns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "status",
            header: () => <div className="text-start">Status</div>,
            cell: ({ row }) => {
                const status: string = row.getValue("status");
                return <div className={cn(`text-left font-medium`, {
                    'text-red-500': status === 'open',
                    'text-yellow-500': status === 'in progress',
                    'text-green-500': status === 'closed',
                })}>{status}</div>
            },
        },
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        className="w-fit text-left"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Ticket
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "description",
            header: ({ column }) => {
                return (
                    <Button
                        className="w-fit text-start"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Problem
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("description")}</div>,
        },
        {
            accessorKey: "priority",
            header: () => <div className="text-left">Priority</div>,
            cell: ({ row }) => {
                const priority: string = row.getValue("priority");
                return <div className={cn(`text-left font-medium`, {
                    'text-red-500': priority.toLowerCase() === 'high',
                    'text-yellow-500': priority.toLowerCase() === 'medium',
                    'text-green-500': priority.toLowerCase() === 'low',
                })}>{priority}</div>
            },
        },
        {
            id: "view",
            header: "View",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        alert(
                            `Ticket Details:\n\nTitle: ${row.original.title}\nProblem: ${row.original.problem}\nStatus: ${row.original.status}\nPriority: ${row.original.priority}\nDescription: ${row.original.description}`
                        )
                    }
                >
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ]

    const table = useReactTable({
        data: tickets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    if (loading) return <div className="p-6">Loading tickets...</div>

    return (
        <main className="top-0 left-0 flex-1 h-full items-center justify-center max-md:px-[3.5vw]">
            <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2">
                <h1 className=" text-5xl max-lg:text-3xl font-bold">
                    Admin Dashboard 🎟️
                </h1>



                {/* <div className="flex gap-2 mb-4">
                    <button onClick={() => handleFilter("weekly")} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                        Weekly
                    </button>
                    <button onClick={() => handleFilter("monthly")} className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">
                        Monthly
                    </button>
                    <button onClick={() => handleFilter("all")} className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">
                        All
                    </button>
                </div> */}



                <div className="w-full flex justify-evenly items-center gap-2 py-4">
                    <Input
                        placeholder="Filter tickets..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex justify-evenly items-center gap-2 py-4">
                                Filter <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem className="cursor-pointer" onCheckedChange={() => handleFilter("all")}>
                                All
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem className="cursor-pointer" onCheckedChange={() => handleFilter("weekly")}>
                                Weekly
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem className="cursor-pointer" onCheckedChange={() => handleFilter("monthly")}>
                                Monthly
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </main>
    )
}
