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
