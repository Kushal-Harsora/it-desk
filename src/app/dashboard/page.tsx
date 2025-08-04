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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Icon and Style imports
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample Table Data
export type Payment = {
    id: string
    priority: 'high' | 'medium' | 'low'
    status: 'open' | 'in progress' | 'closed'
    ticket: string,
    problem: string
}

const data: Payment[] = [
    {
        id: "m5gr84i9",
        priority: 'high',
        status: "closed",
        ticket: "Ticket1",
        problem: "Network lag"
    },
    {
        id: "3u1reuv4",
        priority: 'low',
        status: "in progress",
        ticket: "Ticket2",
        problem: "Payment lag"
    },
    {
        id: "derv1ws0",
        priority: 'medium',
        status: "in progress",
        ticket: "Ticket3",
        problem: "Firewall issue"
    },
    {
        id: "5kma53ae",
        priority: 'high',
        status: "open",
        ticket: "Ticket4",
        problem: "Wifi lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
    {
        id: "bhqecj4p",
        priority: 'low',
        status: "closed",
        ticket: "Ticket5",
        problem: "Network lag"
    },
]

export const columns: ColumnDef<Payment>[] = [
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
            return <div className={cn(`text-left font-medium`, {
                'text-red-500': status === 'open',
                'text-yellow-500': status === 'in progress',
                'text-green-500': status === 'closed',
            })}>{status}</div>
        },
    },
    {
        accessorKey: "ticket",
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
        cell: ({ row }) => <div className="lowercase">{row.getValue("ticket")}</div>,
    },
    {
        accessorKey: "problem",
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
        cell: ({ row }) => <div className=" capitalize">{row.getValue("problem")}</div>,
    },
    {
        accessorKey: "priority",
        header: () => <div className="text-left">Priority</div>,
        cell: ({ row }) => {
            const priority: string = row.getValue("priority");
            return <div className={cn(`text-left font-medium`, {
                'text-red-500': priority === 'high',
                'text-yellow-500': priority === 'medium',
                'text-green-500': priority === 'low',
            })}>{priority}</div>
        },
    },
    // {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //         const payment = row.original

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant={'ghost'} className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuItem
    //                         onClick={() => navigator.clipboard.writeText(payment.id)}
    //                     >
    //                         Copy payment ID
    //                     </DropdownMenuItem>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem>View customer</DropdownMenuItem>
    //                     <DropdownMenuItem>View payment details</DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    // },
]

// Get the Ticket Data
const getData = async () => {
    // Fetch data from an API or database
}

export default function Page() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <main className="flex-1 h-full items-center justify-center px-[5vw] max-md:px-[3.5vw]">
            <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2">
                <h1 className=" text-5xl max-lg:text-3xl font-bold">
                    Ticket Table
                </h1>
                <div className="w-full flex justify-evenly items-center gap-2 py-4">
                    <Input
                        placeholder="Filter tickets..."
                        value={(table.getColumn("ticket")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("ticket")?.setFilterValue(event.target.value)
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
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
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
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col items-start justify-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Ticket Title
                                    </Label>
                                    <Input id="name" className="col-span-3" />
                                </div>
                                <div className="flex flex-col items-start justify-center gap-4">
                                    <Label htmlFor="username" className="text-left">
                                        Description
                                    </Label>
                                    <Textarea id="username" className="col-span-3 min-h-[100px] max-h-[800px] overflow-y-auto" />
                                </div>
                                <div className="flex flex-col items-start justify-center gap-4">
                                    <Label htmlFor="username" className="text-left">
                                        Attack Image
                                    </Label>
                                    <Input id="picture" type="file" />
                                </div>
                                <div className="flex flex-col items-start justify-center gap-4">
                                    <Label htmlFor="username" className="text-left">
                                        Priority
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select ticket priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Ticket Priority</SelectLabel>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="w-full rounded-md border">
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
                    <div className="space-x-2">
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
