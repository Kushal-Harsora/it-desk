import { Priority, Status } from "@prisma/client";

export const timeZone = 'Asia/Kolkata';

export type Ticket = {
    title: string
    priority: Priority,
    status: Status,
    ticket: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    attachment: string
}

export type StatusCount = {
  date: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  count: number;
};

export type PriorityCount = {
  date: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  count: number;
};

export type StatusGrouped = {
  date: Date;
  OPEN?: number;
  IN_PROGRESS?: number;
  RESOLVED?: number;
  CLOSED?: number;
};

export type PriorityGrouped = {
  date: Date;
  LOW?: number;
  MEDIUM?: number;
  HIGH?: number;
};