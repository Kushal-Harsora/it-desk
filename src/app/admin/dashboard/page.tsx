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

import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye } from "lucide-react"
// Calendar import***
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Priority, Status } from "@prisma/client"

import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import axios from "axios"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


type Ticket = {
    id: string
    title: string
    priority: string,
    status: Status,
    ticket: string,
    description: string,
    createdAt: Date,
    attachment: string,
    attachmentUrl: string
}

export default function AdminDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredTickets, setFilteredTickets] = useState([]);





    // useEffect(() => {
    //     const fetchTickets = async () => {
    //         try {
    //             const res = await fetch("/api/tickets", {
    //                 method: "GET",
    //                 credentials: "include", // to send cookies if using session auth
    //             })
    //             const data = await res.json()
    //             setTickets(data)
    //         } catch (error) {
    //             console.error("Error fetching tickets:", error)
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchTickets()
    // }, [])

    // Filter button to get filtered tickets based on monthly, weekly....
    // const handleFilter = async (type: string) => {
    //     setLoading(true)
    //     try {
    //         const url = type === "all" ? "/api/tickets" : `/api/tickets?filter=${type}`
    //         const res = await fetch(url, {
    //             method: "GET",
    //             credentials: "include",
    //         })
    //         const data = await res.json()
    //         setTickets(data)
    //     } catch (error) {
    //         console.error("Error fetching filtered tickets:", error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }


    const columns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "status",
            header: () => <div className="text-start">Status</div>,
            cell: ({ row }) => {
                const status: string = row.getValue("status");
                return <div className={cn(`text-left font-semibold`, {
                    'text-red-500': status === 'OPEN',
                    'text-yellow-500': status === 'IN_PRORESS',
                    'text-green-500': status === 'RESOLVED',
                    'text-blue-500': status === 'CLOSED',
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
                    'text-red-500': priority === 'HIGH',
                    'text-yellow-500': priority === 'MEDIUM',
                    'text-green-500': priority === 'LOW',
                })}>{priority}</div>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const title = row.original.title
                const row_data = row.original;
                const createdAt = new Date(row_data.createdAt);

                const formattedDate = new Intl.DateTimeFormat('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                }).format(createdAt);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'ghost'} className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(title)}
                            >
                                Copy Ticket Name
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className=" w-full" variant={'ghost'}>
                                        View Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className=" text-center">
                                            Ticket Details for <span className=" font-bold text-blue-500">{row_data.title}</span>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className=" w-full h-fit flex flex-col justify-center items-center gap-2">
                                        <div className=" w-full h-fit flex flex-row justify-evenly items-center">
                                            <div className=" flex flex-row gap-1 justify-center items-center">
                                                <span className=" font-medium">Status: </span>
                                                <div className={cn(`text-left font-medium`, {
                                                    'text-red-500': row_data.status === 'OPEN',
                                                    'text-yellow-500': row_data.status === 'IN_PROGRESS',
                                                    'text-green-500': row_data.status === 'RESOLVED',
                                                    'text-blue-500': row_data.status === 'CLOSED',
                                                })}>{row_data.status}</div>
                                            </div>
                                            <div className=" flex flex-row gap-1 justify-center items-center">
                                                <span className=" font-medium">Priority: </span>
                                                <div className={cn(`text-left font-medium`, {
                                                    'text-red-500': row_data.priority === 'HIGH',
                                                    'text-yellow-500': row_data.priority === 'MEDIUM',
                                                    'text-green-500': row_data.priority === 'LOW',
                                                })}>{row_data.priority}</div>
                                            </div>
                                            <div className=" flex flex-row gap-1 justify-center items-center">
                                                <span className=" font-medium">Date: </span>
                                                <div className="text-left font-medium">{formattedDate}</div>
                                            </div>
                                        </div>
                                        <div className=" flex flex-col justify-center items-center gap-2">
                                            <span className=" font-medium">Description: </span>
                                            <div className=" w-full h-fit max-h-[100px] overflow-auto text-wrap">
                                                {row_data.description}
                                            </div>
                                        </div>
                                        {row_data?.attachment && row_data?.id && (
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <span className="font-medium">Attachment:</span>
                                                <a
                                                    href={`/api/tickets/${row_data.id}/attachment`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button>View Attachment</Button>
                                                </a>

                                            </div>
                                        )}


                                        <div className=" flex flex-col justify-center items-center gap-2">
                                            <span className=" font-medium">Comments: </span>
                                            <div className=" w-full h-fit max-h-[100px] overflow-auto text-wrap">
                                                {row_data.description}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data: filteredTickets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    // Calendar code

    const FormSchema = z.object({
        dateRange: z.object({
            from: z.date({
                error: "Start date is required",
            }),
            to: z.date({
                error: "End date is required",
            }),
        }),
    })

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dateRange: {
                from: weekAgo,
                to: today,
            },
        },
    });

    // this goes in the same component as your <form> and the <Table>


    useEffect(() => {
        axios.get("/api/tickets")
            .then((res) => {
                console.log(res.data.tickets)
                setFilteredTickets(res.data.tickets);
            })
            .catch((err) => {
                console.error("Error fetching tickets:", err);
            }
            )
            .finally(() => {
                setLoading(false)
            })
            ;
    }, []);

    // useReactTable config
    // update this in your `onSubmit`
    const onSubmit = async (data: { dateRange: { from: Date; to: Date } }) => {
        try {
            const from = data.dateRange.from.toISOString();
            const to = data.dateRange.to.toISOString();

            const res = await axios.get(`/api/tickets?start=${from}&end=${to}`);
            console.log("Response here: - " + res)
            setFilteredTickets(res.data.tickets); // Access tickets array from response
        } catch (error) {
            console.error("Error fetching filtered tickets:", error);
        }
    };

    function CalendarForm() {
        const form = useForm<z.infer<typeof FormSchema>>({
            resolver: zodResolver(FormSchema),
        })

    }

    if (loading) return <div className="p-6">Loading tickets...</div>

    return (
        <main className="top-0 left-0 flex-1 h-full items-center justify-center max-md:px-[3.5vw]">
            <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2">
                <h1 className=" text-5xl max-lg:text-3xl font-bold">
                    Admin Dashboard 🎟️
                </h1>
                <div className="w-full flex justify-evenly items-center gap-2 py-4">
                    <Input
                        placeholder="Filter tickets..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    {/* Calendar FrontEnd */}

                    <Dialog>
                        <DialogTrigger className="mr-auto cursor-pointer">Open</DialogTrigger>
                        <DialogContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="dateRange"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date of birth</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[270px] pl-3 text-left font-normal",
                                                                    !field.value?.from && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value?.from ? (
                                                                    field.value.to ? (
                                                                        <>
                                                                            {format(field.value.from, "PPP")} – {format(field.value.to, "PPP")}
                                                                        </>
                                                                    ) : (
                                                                        format(field.value.from, "PPP")
                                                                    )
                                                                ) : (
                                                                    <span>Pick a date range</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>

                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="range"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            captionLayout="dropdown"
                                                        />
                                                    </PopoverContent>
                                                </Popover>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Submit</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>



                    {/* Calendar End */}


                    {/* <DropdownMenu>
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
                    </DropdownMenu> */}

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

