"use client";

// System Component Imports
import React from "react"
import axios, { AxiosResponse } from "axios"
import { format, toZonedTime } from 'date-fns-tz'
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// UI Component Imports
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
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

// Consts and Icons Imports
import { ArrowUpDown, MoreHorizontal, SlidersHorizontal } from "lucide-react"
import { timeZone } from '@/const/constVal'

// Database Helper Imports
import { Company } from "@prisma/client"


// Schema for adding a new company
const addCompanySchema = z.object({
    name: z.string().min(1, {
        message: "Name Required!"
    }),
    subdomain: z.string().min(2, {
        message: "Sub-Domain Required!"
    })
});


const CompanyPage = () => {

    const form = useForm<z.infer<typeof addCompanySchema>>({
        resolver: zodResolver(addCompanySchema),
        defaultValues: {
            name: "",
            subdomain: ""
        }
    })

    const [companies, setCompanies] = React.useState<Company[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const [add, setAdd] = React.useState<boolean>(false);

    React.useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('/api/superAdmin/company', { withCredentials: true });

                if (response.status === 200) {
                    console.log("Get Companies!!")
                    setCompanies(response.data);
                }
            } catch (err) {
                console.error("Error fetching Companies:", err);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    const handleAdd = async (values: z.infer<typeof addCompanySchema>) => {
        try {
            const response: AxiosResponse = await axios.post("/api/superAdmin/company", values, { withCredentials: true });
            const new_admin = response.data

            setCompanies((prev) => [...prev, new_admin]);
            if (response.status == 201) {
                form.reset();
                setAdd(false);
                toast.success("Successfully Registered New Company",
                    {
                        style: {
                            "backgroundColor": "#D5F5E3",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 1500
                    })

            }

        } catch (error) {
            toast.error("Error while adding new company!!", {
                style: {
                    "backgroundColor": "#FADBD8",
                    "color": "black",
                    "border": "none"
                },
                duration: 2500
            });
            form.reset();
            console.log("Error while adding new company!!", error)
        }
    }

    const columns: ColumnDef<Company>[] = [
        {
            accessorKey: "name",
            header: () => <div className="text-left">Name</div>,
            cell: ({ row }) => <div>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "subdomain",
            header: () => <div className="text-left">Subdomain</div>,
            cell: ({ row }) => <div>{row.getValue("subdomain")}</div>,
        },
        {
            accessorKey: "users",
            header: () => <div className="text-left">Users</div>,
            cell: ({ row }) => <div>{row.getValue("users")}</div>,
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
            id: "actions",
            enableHiding: false,
            cell: () => {
                return (
                    <main>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </main>
                )

            },
        },
    ];

    const table = useReactTable({
        data: companies,
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



    if (loading) return <div className=" flex-1 h-full overflow-hidden flex items-center justify-center">Loading Admins</div>


    return (

        <main className="flex-1 h-fit items-center justify-center max-md:px-[3.5vw]">
            <div className="w-full h-full px-[2.5vw] flex flex-col items-center justify-center gap-2">
                <div className="h-fit w-full flex max-md:flex-col justify-evenly items-center gap-2 py-4">
                    <div className="w-full max-md:w-fit flex max-md:flex-row justify-between items-center gap-2.5">
                        <span className="max-md:text-xs text-center px-6 max-md:px-0 w-full">
                            Total Companies - <strong>{companies.length}</strong>
                        </span>
                    </div>

                    <div className=" w-fit h-fit flex flex-row justify-evenly items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto max-md:text-xs">
                                    <SlidersHorizontal /> View
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
                                                        default:
                                                            return column.id;
                                                    }
                                                })()}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant={'success'}
                            onClick={() => setAdd(true)}
                        >
                            Register Company
                        </Button>
                        <Dialog open={add} onOpenChange={setAdd}>
                            <DialogContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                                        <DialogHeader>
                                            <DialogTitle>Register New Company</DialogTitle>
                                            <DialogDescription className="mb-3">
                                                Click register when you&apos;re
                                                done.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="enter name of company"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="subdomain"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sub Domain</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="enter subdomain of company"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button type="submit">Register</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
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
    );
}

export default CompanyPage