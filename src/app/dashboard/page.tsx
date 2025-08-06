"use client"

// System imports
import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, toZonedTime } from 'date-fns-tz'


// Component imports
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
// import { Checkbox } from "@/components/ui/checkbox"

// Icon, Style and consts imports
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import axios, { AxiosResponse } from "axios"
import { Priority, Status } from "@prisma/client"
import { ChartArea } from "@/components/custom/Chart-Area"
import { Label } from "@/components/ui/label"
import { timeZone } from '@/const/constVal'


// Ticket Type Definition
export type Ticket = {
    title: string
    priority: string,
    status: Status,
    ticket: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    attachment: string
}

// Create Ticket Form Schema
const TicketSchema = z.object({
    title: z.string().min(1, {
        message: "Ticket title is required"
    }),
    description: z.string().min(1, {
        message: "Problem description is required"
    }),
    attachProof: z.instanceof(File).optional(),
    priority: z.string()
});

const columns: ColumnDef<Ticket>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
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
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="w-fit">
                    <Button
                        className="w-fit text-center"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Date of Creation
                        <ArrowUpDown />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const createdAt: Date = row.getValue("createdAt");
            const dateCreated = toZonedTime(new Date(createdAt), timeZone);
            const formattedDate = format(dateCreated, 'yyyy-MM-dd', { timeZone });
            return <div className='font-medium text-center'>{formattedDate}</div>
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => {
            return (
                <div className="w-fit">
                    <Button
                        className="w-fit text-center"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Last Updated
                        <ArrowUpDown />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const createdAt: Date = row.getValue("updatedAt");
            const dateCreated = toZonedTime(new Date(createdAt), timeZone);
            const formattedDate = format(dateCreated, 'yyyy-MM-dd', { timeZone });
            return <div className='font-medium text-center'>{formattedDate}</div>
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
                                    {(row_data.attachment != '') && <div className=" flex flex-col justify-center items-center gap-2">
                                        <span className=" font-medium">Attachment: </span>
                                        {/* <div className=" w-full h-fit max-h-[100px] overflow-auto text-wrap">
                                            {row_data.attachment}
                                        </div> */}
                                        <Button variant={'default'}>
                                            View Attachment
                                        </Button>
                                    </div>}

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


export default function Page() {

    // Form Handling
    const form = useForm<z.infer<typeof TicketSchema>>({
        resolver: zodResolver(TicketSchema),
        defaultValues: {
            title: "",
            description: "",
            attachProof: undefined,
        },
    });

    const [open, setOpen] = React.useState(false);
    const [TicketData, setTicketData] = React.useState<Ticket[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data: TicketData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        },
    });

    // Get the Ticket Data
    React.useEffect(() => {
        const getData = async () => {
            const response: AxiosResponse = await axios.get('api/tickets');
            if (response.status === 200) {
                setTicketData(response.data);
                console.log(response.data);
            }
        }

        getData();
    }, [])

    const onSubmit = async (values: z.infer<typeof TicketSchema>) => {

        const formData = new FormData();
        formData.append("title", values.title)
        formData.append("description", values.description);
        formData.append("priority", values.priority.toLowerCase());
        if (values.attachProof != undefined)
            formData.append("attachProof", values.attachProof);
        try {
            const response: AxiosResponse = await axios.post('/api/tickets', formData, {
                headers: {
                    'Content-type': 'multipart/form-data'
                }
            });

            const data = response.data;

            if (response.status === 201) {
                form.reset();
                toast.success(data.message || "Ticket Created successfully", {
                    style: {
                        "backgroundColor": "#D5F5E3",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 1500
                });
                setOpen(false);
                window.location.reload();
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 500) {
                    toast.error(data.error || "Failed to create ticket", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    form.reset();
                }
            }
        }

    }

    return (
        <main className="flex-1 h-fit items-center justify-center max-md:px-[3.5vw]">
            <ChartArea />
            <div className="w-full h-full px-[2.5vw] flex flex-col items-center justify-center gap-2">
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
                                            {(() => {
                                                switch (column.id) {
                                                    case "createdAt":
                                                        return "Date of Creation";
                                                    case "updatedAt":
                                                        return "Last Updated";
                                                    default:
                                                        return column.id;
                                                }
                                            })()}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant={'default'}>Create Ticket</Button>
                        </DialogTrigger>
                        <DialogContent className="max-sm:max-w-4/5 w-full">
                            <DialogHeader>
                                <DialogTitle>Ticket</DialogTitle>
                                <DialogDescription>
                                    Enter the ticket details here. Click save when you&apos;re done.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ticket Title</FormLabel>
                                                <FormControl>
                                                    <Input className='placeholder:text-gray-800 border-black' placeholder="Ticket Title" type='text' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ticket Description</FormLabel>
                                                <FormControl>
                                                    <Textarea className="min-h-[100px] max-h-[400px] overflow-auto" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="attachProof"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Attach PDF/Image</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        accept=".pdf, image/*"
                                                        type="file"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            field.onChange(file);
                                                        }}
                                                        onBlur={field.onBlur}
                                                        name={field.name}
                                                        ref={field.ref}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Priority</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select ticket priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Ticket Priority</SelectLabel>
                                                                <SelectItem value="HIGH">High</SelectItem>
                                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                                <SelectItem value="LOW">Low</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Create Ticket</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className=" w-full rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
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
                                        className="h-24 p-2 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    {/* <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div> */}
                    <div className="w-fit items-center gap-2 flex flex-row">
                        <Label htmlFor="rows-per-page" className="text-sm max-md:text-xs font-medium">
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="w-20" id="rows-per-page">
                                <SelectValue
                                    placeholder={table.getState().pagination.pageSize}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-fit items-center justify-center text-sm max-md:text-xs font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>

                    <div className="flex flex-row space-x-2 max-md:space-x-1">
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
            </div>
        </main>
    )
}
