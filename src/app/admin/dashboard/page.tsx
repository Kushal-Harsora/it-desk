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
import axios, { AxiosResponse } from "axios"


// Component imports
import {
    Dialog,
    DialogClose,
    DialogContent,
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { ChartArea } from "@/components/custom/Chart-Area"

// Icon, Style and consts imports
import { ArrowUpDown, CalendarIcon, MoreHorizontal, SlidersHorizontal } from "lucide-react"
import { PriorityGrouped, StatusGrouped, timeZone } from '@/const/constVal'

// Ticket Type Definition
import { Ticket } from "@/const/constVal"


// Form Schemas
const CommentSchema = z.object({
    comment: z.string().min(1, {
        message: "Comment must be more than 1 character long"
    }),
    ticketId: z.number()
});

const StatusSchema = z.object({
    status: z.string(),
    ticketId: z.number()
})

const CalendarSchema = z.object({
    dateRange: z.object({
        from: z.date({
            error: "Start date is required",
        }),
        to: z.date({
            error: "End date is required",
        }),
    }),
})


export default function Page() {

    // Form Handling
    const commentForm = useForm<z.infer<typeof CommentSchema>>({
        resolver: zodResolver(CommentSchema),
        defaultValues: {
            comment: ''
        }
    });

    const statusForm = useForm<z.infer<typeof StatusSchema>>({
        resolver: zodResolver(StatusSchema),
        defaultValues: {
            status: ""
        }
    })

    const formCalendar = useForm({
        resolver: zodResolver(CalendarSchema),
        defaultValues: {
            dateRange: {
                from: toZonedTime(new Date(), timeZone),
                to: toZonedTime(new Date(), timeZone),
            },
        },
    });

    const dialogCloseButton = React.useRef<HTMLButtonElement | null>(null);

    const [openCalendar, setOpenCalendar] = React.useState(false);
    const [TicketData, setTicketData] = React.useState<Ticket[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<StatusGrouped[]>([]);
    const [priority, setPriority] = React.useState<PriorityGrouped[]>([]);
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

    const columns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        className="w-fit text-left"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status: string = row.getValue("status");
                return (
                    <div className={cn(`text-left font-semibold`, {
                        'text-red-500': status === 'OPEN',
                        'text-yellow-500': status === 'IN_PROGRESS',
                        'text-green-500': status === 'RESOLVED',
                        'text-blue-500': status === 'CLOSED',
                    })}>
                        {status}
                    </div>
                )
            },
            sortingFn: (rowA, rowB, columnId) => {
                const statusOrder = {
                    'OPEN': 1,
                    'IN_PROGRESS': 2,
                    'RESOLVED': 3,
                    'CLOSED': 4,
                };

                const a = rowA.getValue(columnId) as keyof typeof statusOrder;
                const b = rowB.getValue(columnId) as keyof typeof statusOrder;

                return statusOrder[a] - statusOrder[b];
            }
        },
        {
            accessorKey: "title",
            header: () => <div className="text-left">Ticket</div>,
            cell: ({ row }) => <div>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "description",
            header: () => <div className="text-left">Description</div>,
            cell: ({ row }) => <div>{row.getValue("description")}</div>,
        },
        {
            accessorKey: "priority",
            header: ({ column }) => {
                return (
                    <Button
                        className="w-fit text-left"
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Priority
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const priority: string = row.getValue("priority");
                return <div className={cn(`text-left font-medium`, {
                    'text-red-500': priority === 'HIGH',
                    'text-yellow-500': priority === 'MEDIUM',
                    'text-green-500': priority === 'LOW',
                })}>{priority}</div>
            },
            sortingFn: (rowA, rowB, columnId) => {
                const priorityOrder = {
                    'HIGH': 1,
                    'MEDIUM': 2,
                    'LOW': 3,
                };

                const a = rowA.getValue(columnId) as keyof typeof priorityOrder;
                const b = rowB.getValue(columnId) as keyof typeof priorityOrder;

                return priorityOrder[a] - priorityOrder[b];
            }
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
                                    <Button className="w-full" variant="ghost">Toggle Status</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Toggle Status</DialogTitle>
                                    </DialogHeader>
                                    <Form {...statusForm}>
                                        <form onSubmit={statusForm.handleSubmit(onSubmitStatus)} className="space-y-4">
                                            <input
                                                type="hidden"
                                                value={row_data.id}
                                                {...statusForm.register("ticketId", { valueAsNumber: true })}
                                            />
                                            <FormField
                                                control={statusForm.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select ticket status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Ticket Status</SelectLabel>
                                                                        <SelectItem value="OPEN">Open</SelectItem>
                                                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit">Save changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                    <DialogClose asChild>
                                        <Button className="hidden" ref={dialogCloseButton}></Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                            <DropdownMenuSeparator />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full" variant="ghost">Add/Edit Comment</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add/Edit Comment</DialogTitle>
                                    </DialogHeader>
                                    <Form {...commentForm}>
                                        <form onSubmit={commentForm.handleSubmit(onSubmitComment)} className="space-y-4">
                                            <input
                                                type="hidden"
                                                value={row_data.id}
                                                {...commentForm.register("ticketId", { valueAsNumber: true })}
                                            />
                                            <FormField
                                                control={commentForm.control}
                                                name="comment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ticket Comment</FormLabel>
                                                        <FormControl>
                                                            <Textarea className="w-full min-h-[100px] max-h-[400px] overflow-auto" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="submit">Save changes</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                    <DialogClose asChild>
                                        <Button className="hidden" ref={dialogCloseButton}></Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                            <DropdownMenuSeparator />
                            <Dialog >
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
                                        <div className=" w-full h-fit flex flex-row max-md:flex-col justify-evenly items-center">
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
                                        {(row_data.attachment != '') && <div className=" flex flex-row justify-center items-center gap-2">
                                            <span className=" font-medium">Attachment: </span>
                                            {/* <div className=" w-full h-fit max-h-[100px] overflow-auto text-wrap">
                                                                {row_data.attachment}
                                                            </div> */}
                                            <Button variant={'default'}>
                                                View Attachment
                                            </Button>
                                        </div>}

                                        {(row_data.comments.length > 0) ? (<div className="w-full h-fit max-h-[40vh] overflow-auto flex flex-col justify-center items-center gap-2">
                                            <span className=" font-medium">Comments: </span>
                                            {row_data.comments.map((comment_data, index) => (
                                                <div key={index} className="bg-gray-100 p-2 rounded-lg w-full h-fit max-h-[200px] overflow-auto text-wrap">
                                                    {comment_data.message}
                                                </div>
                                            ))}
                                        </div>) :
                                            (<div className="w-full h-fit max-h-[40vh] overflow-auto flex flex-col justify-center items-center gap-2">
                                                <span className=" font-medium">Comments: </span>
                                                <div className="text-center w-full h-fit overflow-auto text-wrap">
                                                    No Comment Found
                                                </div>
                                            </div>)}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

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
            const response_ticket: AxiosResponse = await axios.get('api/tickets', {
                withCredentials: true
            });
            if (response_ticket.status === 200) {
                setTicketData(response_ticket.data.tickets);
                console.log(response_ticket.data.tickets);
            }

            const response_chart: AxiosResponse = await axios.get('api/chart');
            if (response_chart.status === 200) {
                setStatus(response_chart.data.status);
                setPriority(response_chart.data.priority);
            }

            if (response_chart.status === 200 && response_ticket.status === 200) {
                setLoading(false);
            }
        }

        getData();
    }, []);

    const onSubmitCalendar = async (data: { dateRange: { from: Date; to: Date } }) => {
        try {
            const from = toZonedTime(new Date(data.dateRange.from.toISOString()), timeZone);
            const to = toZonedTime(new Date(data.dateRange.to.toISOString()), timeZone);

            const res = await axios.get(`api/tickets?start=${from}&end=${to}`);
            setTicketData(res.data.tickets);
            setOpenCalendar(false);
        } catch (error) {
            console.error("Error fetching filtered tickets:", error);
        }
    }

    const onSubmitStatus = async (values: z.infer<typeof StatusSchema>) => {
        try {
            const formData = {
                email: window.localStorage.getItem("email"),
                name: window.localStorage.getItem("name"),
                ...values
            }
            const response: AxiosResponse = await axios.put('api/status', formData, {
                headers: {
                    'Content-Type': 'Application/json'
                }
            });
            const data = response.data;
            if (response.status === 201) {
                commentForm.reset();
                toast.success(data.message || "Status Updated Successfully", {
                    style: {
                        "backgroundColor": "#D5F5E3",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 1500
                });
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 500) {
                    toast.error(data.message || "Internal Server Error", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                } else if (status === 404) {
                    toast.error(data.message || "Admin not found. Kindly login again.", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                } else if (status === 401) {
                    toast.error(data.message || "Some error in updating status", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                }
            } else {
                toast.error("Some Unknown error occured. Try Again later.", {
                    style: {
                        "backgroundColor": "#FADBD8",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 2500
                });
                commentForm.reset();
            }
        }
    }

    const onSubmitComment = async (values: z.infer<typeof CommentSchema>) => {
        try {
            const formData = {
                email: window.localStorage.getItem("email"),
                name: window.localStorage.getItem("name"),
                ...values
            }

            console.log(formData);

            const response: AxiosResponse = await axios.post('api/comment', formData, {
                headers: {
                    'Content-Type': 'Application/json'
                }
            });
            const data = response.data;
            console.log("data: ", data);
            if (response.status === 201) {
                commentForm.reset();
                toast.success(data.message || "Added Comment Successfully", {
                    style: {
                        "backgroundColor": "#D5F5E3",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 1500
                });
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 500) {
                    toast.error(data.message || "Failed to add comment to ticket", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                } else if (status === 404) {
                    toast.error(data.message || "Admin not found. Kindly login again.", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                } else if (status === 401) {
                    toast.error(data.message || "Some error creating comment", {
                        style: {
                            "backgroundColor": "#FADBD8",
                            "color": "black",
                            "border": "none"
                        },
                        duration: 2500
                    })
                    commentForm.reset();
                }
            } else {
                toast.error("Some Unknown error occured. Try Again later.", {
                    style: {
                        "backgroundColor": "#FADBD8",
                        "color": "black",
                        "border": "none"
                    },
                    duration: 2500
                });
                commentForm.reset();
            }
        }
    }

    if (loading) return <div className=" flex-1 h-full overflow-hidden flex items-center justify-center">Loading ticket</div>

    return (
        <main className="flex-1 h-fit items-center justify-center max-md:px-[3.5vw]">
            <ChartArea priority={priority} status={status} />
            <div className="w-full h-full px-[2.5vw] flex flex-col items-center justify-center gap-2">
                <div className="h-fit w-full flex max-md:flex-col justify-evenly items-center gap-2 py-4">
                    <div className="w-full max-md:w-fit flex max-md:flex-row justify-between items-center gap-2.5">
                        <Input
                            placeholder="Filter tickets..."
                            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("title")?.setFilterValue(event.target.value)
                            }
                            className="w-full max-w-md"
                        />

                        <span className="max-md:text-xs text-center px-6 max-md:px-0 w-full">
                            Total Tickets - <strong>{TicketData.length}</strong>
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

                        <Dialog open={openCalendar} onOpenChange={setOpenCalendar}>
                            <DialogTrigger className="mr-auto cursor-pointer w-fit" asChild>
                                <Button variant="outline" className="ml-auto max-md:text-xs">
                                    Filter
                                </Button>
                            </DialogTrigger>
                            <DialogContent className=" w-full h-fit flex flex-col justify-center items-center">
                                <DialogHeader>
                                    <DialogTitle className=" text-center">
                                        Filter Out the Dates of Tickets
                                    </DialogTitle>
                                </DialogHeader>
                                <Form {...formCalendar}>
                                    <form onSubmit={formCalendar.handleSubmit(onSubmitCalendar)} className="space-y-8">
                                        <FormField
                                            control={formCalendar.control}
                                            name="dateRange"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col w-full h-full">
                                                    <FormLabel className=" text-center">Select the Range of Date</FormLabel>
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
                                        <Button className="w-full" type="submit">
                                            Submit
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        {/* <Dialog open={openTicket} onOpenChange={setOpenTicket}>
                            <DialogTrigger className="mr-auto cursor-pointer w-fit" asChild>
                                <Button className=" max-md:text-xs" variant={'default'}>Create Ticket</Button>
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
                        </Dialog> */}
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
    )
}