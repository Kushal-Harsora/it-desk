"use client";
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
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { format, toZonedTime } from 'date-fns-tz'
import axios, { AxiosResponse } from "axios"
import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, CalendarIcon, MoreHorizontal, SlidersHorizontal } from "lucide-react"
import { timeZone } from '@/const/constVal'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Admin, Company } from "@prisma/client";


export default function Page() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const [add, setAdd] = useState(false)
    useEffect(() => {
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

    const [companyForm, setCompanyForm] = useState({ name: "", subdomain: "", password: "" })
                const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.preventDefault()
                    const { name, value } = e.target
                    setCompanyForm((prev) => ({ ...prev, [name]: value }))
                }
    const handleAdd = async () => {
                    try {
                        const response = await axios.post("/api/superAdmin/company"
                            , {
                                name: companyForm.name,
                                subdomain:companyForm.subdomain,

                            }
                            , { withCredentials: true })
                        const new_admin = response.data
                        setCompanies((prev) => [...prev, new_admin])

                        if(response.status==201){
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
                        toast.error("Failed to register new company!!",
                            {
                                style: { backgroundColor: "#c1121f", color: "white" },
                                duration:1500
                            }
                        )
                        console.log("Error while adding new company!!", error)
                    }
                }

    const columns: ColumnDef<Company>[] = [

        {
            accessorKey: "id",
            // header: () => <div className="text-left">Admin-Id</div>,
            header: ({ column }) => {
                return (
                    <div className="w-fit">
                        <Button
                            className="w-fit text-center"
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            Id
                            <ArrowUpDown />
                        </Button>
                    </div>
                )
            },
        },
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
            cell: ({ row }) => {
                const row_data = row.original;
                const createdAt = new Date(row_data.createdAt);
                const formattedDate = new Intl.DateTimeFormat('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                }).format(createdAt);
                

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
                        <Button variant={'success'} onClick={() => setAdd(true)}>Register Company</Button>
                        <Dialog open={add} onOpenChange={setAdd}>
                            <DialogContent>
                                <form onSubmit={handleAdd}>
                                    <DialogTrigger asChild>
                                    </DialogTrigger>
                                    <DialogHeader>
                                        <DialogTitle>Register New Company</DialogTitle>
                                        <DialogDescription className="mb-3">
                                            Click register when you&apos;re
                                            done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name-1">Name</Label>
                                            <input value={companyForm.name} name="name"
                                                onChange={handleAddChange}

                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="username-1">SubDomain</Label>
                                            <input
                                                placeholder="Enter a subdomain of company.."
                                                value={companyForm.subdomain} name="subdomain"
                                                onChange={handleAddChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Register</Button>
                                    </DialogFooter>
                                </form>
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
