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
import { Admin } from "@prisma/client";


export default function Page() {
    const [admins, setAdmins] = useState<Admin[]>([]);
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
    const [deleted, setDeleted] = useState(false);
    const [updated, setUpdated] = useState(false);

    const [adminIdToDelete, setAdminIdToDelete] = useState<number | null>(null);
    const [adminIdToUpdate, setAdminIdToUpdate] = useState<number | null>(null);
    const [add, setAdd] = useState(false)
    useEffect(() => {
        const getData = async () => {
            try {
                const response_admin = await axios.get('/api/superAdmin/admins', { withCredentials: true });

                if (response_admin.status === 200) {
                    console.log("Get Admins")
                    setAdmins(response_admin.data);
                }
            } catch (err) {
                console.error("Error fetching admins:", err);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" })
                const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.preventDefault()
                    const { name, value } = e.target
                    setAdminForm((prev) => ({ ...prev, [name]: value }))
                }

                const handleAdd = async () => {
                    try {
                        const response = await axios.post("/api/superAdmin/admins"
                            , {
                                name: adminForm.name,
                                email: adminForm.email,
                                password: adminForm.password
                            }
                            , { withCredentials: true })
                        const new_admin = response.data
                        setAdmins((prev) => [...prev, new_admin])

                        if(response.status==201){
                            toast.success("Successfully Added New Admin",
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
                        toast.error("Failed to add new admin!!",
                            {
                                style: { backgroundColor: "#c1121f", color: "white" },
                                duration:1500
                            }
                        )
                        console.log("Error while adding new admin!!", error)
                    }
                }

    const columns: ColumnDef<Admin>[] = [

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
            accessorKey: "email",
            header: () => <div className="text-left">Email</div>,
            cell: ({ row }) => <div>{row.getValue("email")}</div>,
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
            accessorKey: "role",
            header: () => <div className="text-left">Role</div>,
            cell: ({ row }) => <div>{row.getValue("role")}</div>,
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
                const [formData, setFormData] = useState({ name: "", email: "", password: "" });
                const confirmDelete = async (id: number) => {
                    try {
                        const data = await axios.delete(`/api/superAdmin/admins/${id}`, { withCredentials: true })
                        console.log("here!!")
                        if (data.status === 200) {
                            setDeleted(true);
                            toast.success("Deleted successfully!", {
                                style: {
                                    "backgroundColor": "#D5F5E3",
                                    "color": "black",
                                    "border": "none"
                                },
                                duration: 1500
                            });
                            setDeleted(false);
                            setAdmins(prev => prev.filter(admin => admin.id !== id));
                        }

                    } catch (error) {
                        toast.success("Some error occured!", {
                            style: {
                                "backgroundColor": "#c1121f",
                                "color": "black",
                                "border": "none"
                            },
                            duration: 1500
                        });
                        console.log("Error occured while deleting an admin!!", error)
                    }

                    console.log(id)

                }
                const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (adminIdToUpdate !== null) {
                        handleUpdate(adminIdToUpdate);
                    }
                };

                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

                    const { name, value } = e.target
                    setFormData(prev => ({ ...prev, [name]: value }));

                }
                const handleUpdate = async (id: number) => {
                    console.log("clicked" + id)


                    try {
                        const res = await axios.put(
                            `/api/superAdmin/admins/${id}`,
                            formData,
                            { withCredentials: true }
                        );

                        if (res.status === 200) {
                            toast.success("Profile updated successfully!", {
                                style: { backgroundColor: "#D5F5E3", color: "black" },
                                duration: 1500
                            });

                            // Close modal
                            setUpdated(false);


                        }
                    } catch (error) {
                        toast.error("Updation failed!", {
                            style: { backgroundColor: "#c1121f", color: "white" },
                            duration: 1500
                        });
                        console.error(error);
                    }
                };


                



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

                                <DropdownMenuItem
                                    onClick={() => {
                                        setAdminIdToUpdate(row_data.id)
                                        setUpdated(true)
                                    }}
                                    className="bg-blue-600 mb-3 cursor-pointer hover:bg-blue-700 hover:text-accent-foreground"
                                >
                                    Update
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setAdminIdToDelete(row_data.id)
                                        setFormData({ name: row_data.name, email: row_data.email, password: "" }); // preload existing data except password for security

                                        setDeleted(true)
                                    }}
                                    className="bg-red-600 cursor-pointer hover:bg-red-700 hover:text-accent-foreground"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={deleted} onOpenChange={setDeleted}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => setDeleted(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="delete" onClick={() => {
                                        if (adminIdToDelete !== null) confirmDelete(adminIdToDelete);
                                        setDeleted(false);
                                        setAdminIdToDelete(null);
                                    }
                                    }>
                                        Confirm
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={updated} onOpenChange={setUpdated}>
                            <DialogContent>
                                <form onSubmit={handleSubmit}>
                                    <DialogTrigger asChild>
                                    </DialogTrigger>
                                    <DialogHeader>
                                        <DialogTitle>Edit profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your admin profile here. Click save when you&apos;re
                                            done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name-1">Name</Label>
                                            <input value={formData.name} name="name"
                                                onChange={handleChange}

                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="username-1">Email</Label>
                                            <input
                                                value={formData.email} name="email"
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="username-1">Password</Label>
                                            <input
                                                value={formData.password} name="password"
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        
                    </main>
                )

            },
        },
    ];

    const table = useReactTable({
        data: admins,
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
                            Total Admins - <strong>{admins.length}</strong>
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
                        <Button variant={'success'} onClick={() => setAdd(true)}>Add Admin</Button>
                        <Dialog open={add} onOpenChange={setAdd}>
                            <DialogContent>
                                <form onSubmit={handleAdd}>
                                    <DialogTrigger asChild>
                                    </DialogTrigger>
                                    <DialogHeader>
                                        <DialogTitle>Add New Admin</DialogTitle>
                                        <DialogDescription className="mb-3">
                                            Create new admin. Click create when you&apos;re
                                            done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name-1">Name</Label>
                                            <input value={adminForm.name} name="name"
                                                onChange={handleAddChange}

                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="username-1">Email</Label>
                                            <input
                                                value={adminForm.email} name="email"
                                                onChange={handleAddChange}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="username-1">Password</Label>
                                            <input
                                                value={adminForm.password} name="password"
                                                onChange={handleAddChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Create</Button>
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
