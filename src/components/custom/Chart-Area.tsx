"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { PriorityGrouped, StatusGrouped } from "@/const/constVal"

// const status = [
//     { date: "2025-08-05", OPEN: 8, IN_PROGRESS: 4, RESOLVED: 5, CLOSED: 3 },
//     { date: "2025-08-04", OPEN: 5, IN_PROGRESS: 6, RESOLVED: 2, CLOSED: 4 },
//     { date: "2025-08-03", OPEN: 7, IN_PROGRESS: 3, RESOLVED: 6, CLOSED: 2 },
//     { date: "2025-08-02", OPEN: 6, IN_PROGRESS: 5, RESOLVED: 4, CLOSED: 1 },
//     { date: "2025-08-01", OPEN: 9, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 2 },
//     { date: "2025-07-31", OPEN: 4, IN_PROGRESS: 3, RESOLVED: 5, CLOSED: 3 },
//     { date: "2025-07-30", OPEN: 6, IN_PROGRESS: 4, RESOLVED: 4, CLOSED: 1 },
//     { date: "2025-07-29", OPEN: 7, IN_PROGRESS: 2, RESOLVED: 6, CLOSED: 2 },
//     { date: "2025-07-28", OPEN: 5, IN_PROGRESS: 5, RESOLVED: 3, CLOSED: 3 },
//     { date: "2025-07-27", OPEN: 6, IN_PROGRESS: 3, RESOLVED: 2, CLOSED: 4 },
//     { date: "2025-07-26", OPEN: 8, IN_PROGRESS: 4, RESOLVED: 4, CLOSED: 2 },
//     { date: "2025-07-25", OPEN: 4, IN_PROGRESS: 6, RESOLVED: 3, CLOSED: 1 },
//     { date: "2025-07-24", OPEN: 7, IN_PROGRESS: 3, RESOLVED: 5, CLOSED: 2 },
//     { date: "2025-07-23", OPEN: 6, IN_PROGRESS: 2, RESOLVED: 6, CLOSED: 3 },
//     { date: "2025-07-22", OPEN: 5, IN_PROGRESS: 4, RESOLVED: 4, CLOSED: 2 },
//     { date: "2025-07-21", OPEN: 9, IN_PROGRESS: 1, RESOLVED: 3, CLOSED: 2 },
//     { date: "2025-07-20", OPEN: 6, IN_PROGRESS: 5, RESOLVED: 4, CLOSED: 1 },
//     { date: "2025-07-19", OPEN: 7, IN_PROGRESS: 3, RESOLVED: 2, CLOSED: 4 },
//     { date: "2025-07-18", OPEN: 5, IN_PROGRESS: 4, RESOLVED: 5, CLOSED: 2 },
//     { date: "2025-07-17", OPEN: 6, IN_PROGRESS: 2, RESOLVED: 6, CLOSED: 3 },
//     { date: "2025-07-16", OPEN: 4, IN_PROGRESS: 6, RESOLVED: 3, CLOSED: 1 },
//     { date: "2025-07-15", OPEN: 7, IN_PROGRESS: 3, RESOLVED: 5, CLOSED: 2 },
//     { date: "2025-07-14", OPEN: 8, IN_PROGRESS: 2, RESOLVED: 4, CLOSED: 3 },
//     { date: "2025-07-13", OPEN: 5, IN_PROGRESS: 5, RESOLVED: 2, CLOSED: 3 },
//     { date: "2025-07-12", OPEN: 6, IN_PROGRESS: 4, RESOLVED: 4, CLOSED: 1 },
//     { date: "2025-07-11", OPEN: 9, IN_PROGRESS: 3, RESOLVED: 3, CLOSED: 2 },
//     { date: "2025-07-10", OPEN: 4, IN_PROGRESS: 2, RESOLVED: 6, CLOSED: 3 },
//     { date: "2025-07-09", OPEN: 6, IN_PROGRESS: 5, RESOLVED: 3, CLOSED: 1 },
//     { date: "2025-07-08", OPEN: 7, IN_PROGRESS: 2, RESOLVED: 4, CLOSED: 2 },
//     { date: "2025-07-07", OPEN: 5, IN_PROGRESS: 3, RESOLVED: 5, CLOSED: 3 },
//     { date: "2025-07-06", OPEN: 6, IN_PROGRESS: 4, RESOLVED: 2, CLOSED: 4 },
// ];

// const priority = [
//     { date: "2025-08-05", LOW: 4, MEDIUM: 6, HIGH: 2 },
//     { date: "2025-08-04", LOW: 5, MEDIUM: 3, HIGH: 3 },
//     { date: "2025-08-03", LOW: 6, MEDIUM: 4, HIGH: 2 },
//     { date: "2025-08-02", LOW: 3, MEDIUM: 5, HIGH: 4 },
//     { date: "2025-08-01", LOW: 4, MEDIUM: 4, HIGH: 4 },
//     { date: "2025-07-31", LOW: 7, MEDIUM: 2, HIGH: 2 },
//     { date: "2025-07-30", LOW: 3, MEDIUM: 6, HIGH: 2 },
//     { date: "2025-07-29", LOW: 5, MEDIUM: 3, HIGH: 3 },
//     { date: "2025-07-28", LOW: 4, MEDIUM: 4, HIGH: 3 },
//     { date: "2025-07-27", LOW: 6, MEDIUM: 2, HIGH: 3 },
//     { date: "2025-07-26", LOW: 5, MEDIUM: 5, HIGH: 1 },
//     { date: "2025-07-25", LOW: 4, MEDIUM: 3, HIGH: 4 },
//     { date: "2025-07-24", LOW: 3, MEDIUM: 6, HIGH: 2 },
//     { date: "2025-07-23", LOW: 6, MEDIUM: 3, HIGH: 2 },
//     { date: "2025-07-22", LOW: 4, MEDIUM: 4, HIGH: 3 },
//     { date: "2025-07-21", LOW: 5, MEDIUM: 2, HIGH: 4 },
//     { date: "2025-07-20", LOW: 4, MEDIUM: 5, HIGH: 2 },
//     { date: "2025-07-19", LOW: 6, MEDIUM: 2, HIGH: 3 },
//     { date: "2025-07-18", LOW: 3, MEDIUM: 4, HIGH: 4 },
//     { date: "2025-07-17", LOW: 5, MEDIUM: 5, HIGH: 1 },
//     { date: "2025-07-16", LOW: 4, MEDIUM: 3, HIGH: 3 },
//     { date: "2025-07-15", LOW: 6, MEDIUM: 2, HIGH: 3 },
//     { date: "2025-07-14", LOW: 3, MEDIUM: 5, HIGH: 3 },
//     { date: "2025-07-13", LOW: 5, MEDIUM: 3, HIGH: 3 },
//     { date: "2025-07-12", LOW: 4, MEDIUM: 4, HIGH: 3 },
//     { date: "2025-07-11", LOW: 7, MEDIUM: 1, HIGH: 3 },
//     { date: "2025-07-10", LOW: 5, MEDIUM: 4, HIGH: 2 },
//     { date: "2025-07-09", LOW: 6, MEDIUM: 3, HIGH: 2 },
//     { date: "2025-07-08", LOW: 4, MEDIUM: 4, HIGH: 3 },
//     { date: "2025-07-07", LOW: 5, MEDIUM: 5, HIGH: 1 },
//     { date: "2025-07-06", LOW: 3, MEDIUM: 6, HIGH: 2 }
// ]

const chartConfig = {
    Tickets: {
        label: "Tickets"
    },
    OPEN: {
        label: "Open",
        color: "#EC253F",
    },
    HIGH: {
        label: "High",
        color: "#EC253F",
    },
    IN_PROGRESS: {
        label: "In Progress",
        color: "#FE9A37",
    },
    MEDIUM: {
        label: "Medium",
        color: "#FE9A37",
    },
    RESOLVED: {
        label: "Resolved",
        color: "#7CCF35"
    },
    LOW: {
        label: "Low",
        color: "#7CCF35"
    },
    CLOSED: {
        label: "Closed",
        color: "#155DFC"
    }
} satisfies ChartConfig

interface ChartProps {
    status: StatusGrouped[],
    priority: PriorityGrouped[]
}

export const ChartArea: React.FC<ChartProps> = (props) => {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("30d");

    const [chartField, setChartField] = React.useState<"status" | "priority">("priority");

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    const filteredData = React.useMemo(() => {
        const data = chartField === "priority" ? props.priority : props.status;
        const referenceDate = new Date();
        let daysToSubtract = 90;

        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }

        const startDate = new Date(referenceDate);
        startDate.setDate(referenceDate.getDate() - daysToSubtract);

        return data.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate;
        });
    }, [chartField, timeRange, props.priority, props.status]);

    return (
        <section className=" px-[2.5vw]">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardTitle className=" max-md:text-center">Total Tickets</CardTitle>
                    <div className="absolute w-fit h-fit flex flex-col max-md:flex-row justify-center items-end gap-1.5 p-2 mb-2 right-2 max-md:right-4 top-[-5px] max-md:top-4">
                        <div>
                            <ToggleGroup
                                type="single"
                                value={chartField}
                                onValueChange={(value) => setChartField(value as "status" | "priority")}
                                variant="outline"
                                className="@[767px]/card:flex hidden"
                            >
                                <ToggleGroupItem value="priority" className="h-8 px-2.5 cursor-pointer">
                                    Priority
                                </ToggleGroupItem>
                                <ToggleGroupItem value="status" className="h-8 px-2.5 cursor-pointer">
                                    Status
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <Select value={chartField} onValueChange={(value) => setChartField(value as "status" | "priority")}>
                                <SelectTrigger
                                    className="@[767px]/card:hidden flex w-32"
                                    aria-label="Select field"
                                >
                                    <SelectValue placeholder="Attribute" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="priority" className="rounded-lg">
                                        Priority
                                    </SelectItem>
                                    <SelectItem value="status" className="rounded-lg">
                                        Status
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <ToggleGroup
                                type="single"
                                value={timeRange}
                                onValueChange={setTimeRange}
                                variant="outline"
                                className="@[767px]/card:flex hidden"
                            >
                                <ToggleGroupItem value="90d" className="h-8 px-2.5 cursor-pointer">
                                    Last 90 days
                                </ToggleGroupItem>
                                <ToggleGroupItem value="30d" className="h-8 px-2.5 cursor-pointer">
                                    Last 30 days
                                </ToggleGroupItem>
                                <ToggleGroupItem value="7d" className="h-8 px-2.5 cursor-pointer">
                                    Last 7 days
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger
                                    className="@[767px]/card:hidden flex w-32"
                                    aria-label="Select a value"
                                >
                                    <SelectValue placeholder="Last 3 months" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="90d" className="rounded-lg">
                                        Last 90 days
                                    </SelectItem>
                                    <SelectItem value="30d" className="rounded-lg">
                                        Last 30 days
                                    </SelectItem>
                                    <SelectItem value="7d" className="rounded-lg">
                                        Last 7 days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        {chartField === "status" ? (
                            <AreaChart data={filteredData}>
                                <defs>
                                    <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.OPEN.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.OPEN.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>

                                    <linearGradient id="fillInProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.IN_PROGRESS.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.IN_PROGRESS.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>

                                    <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.RESOLVED.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.RESOLVED.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>

                                    <linearGradient id="fillClosed" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.CLOSED.color}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.CLOSED.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="OPEN"
                                    type="natural"
                                    fill="url(#fillOpen)"
                                    stroke={chartConfig.OPEN.color}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="IN_PROGRESS"
                                    type="natural"
                                    fill="url(#fillInProgress)"
                                    stroke={chartConfig.IN_PROGRESS.color}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="RESOLVED"
                                    type="natural"
                                    fill="url(#fillResolved)"
                                    stroke={chartConfig.RESOLVED.color}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="CLOSED"
                                    type="natural"
                                    fill="url(#fillClosed)"
                                    stroke={chartConfig.CLOSED.color}
                                    stackId="a"
                                />
                            </AreaChart>) : (
                            <AreaChart data={filteredData}>
                                <defs>
                                    <linearGradient id="fillLow" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.LOW.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.LOW.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient id="fillMedium" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.MEDIUM.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.MEDIUM.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient id="fillHigh" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig.HIGH.color}
                                            stopOpacity={1.0}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig.HIGH.color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                return new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="HIGH"
                                    type="natural"
                                    fill="url(#fillHigh)"
                                    stroke={chartConfig.HIGH.color}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="MEDIUM"
                                    type="natural"
                                    fill="url(#fillMedium)"
                                    stroke={chartConfig.MEDIUM.color}
                                    stackId="a"
                                />
                                <Area
                                    dataKey="LOW"
                                    type="natural"
                                    fill="url(#fillLow)"
                                    stroke={chartConfig.LOW.color}
                                    stackId="a"
                                />

                            </AreaChart>
                        )}
                    </ChartContainer>
                </CardContent>
            </Card>
        </section>
    )
}
