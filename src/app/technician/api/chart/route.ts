import { PriorityCount, StatusCount, timeZone } from "@/const/constVal";
import { prisma } from "@/db/prisma";
import { format, toZonedTime } from "date-fns-tz";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const statusRaw: StatusCount[] =
            await prisma.$queryRawUnsafe(`
        SELECT 
  d.date,
  s.status,
  COALESCE(t.count, 0) AS count
FROM (
  SELECT CURDATE() - INTERVAL n DAY AS date
  FROM (
    SELECT a.N + b.N * 10 AS n
    FROM (
      SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) a,
    (
      SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) b
  ) AS days
  WHERE n < 90
) d
CROSS JOIN (
  SELECT 'OPEN' AS status UNION ALL
  SELECT 'IN_PROGRESS' UNION ALL
  SELECT 'RESOLVED' UNION ALL
  SELECT 'CLOSED'
) s
LEFT JOIN (
  SELECT DATE(createdAt) AS date, status, COUNT(*) AS count
  FROM Ticket
  WHERE createdAt >= CURDATE() - INTERVAL 90 DAY
  GROUP BY DATE(createdAt), status
) t
  ON d.date = t.date AND s.status = t.status
ORDER BY d.date DESC;
      `);

        const priorityRaw: PriorityCount[] =
            await prisma.$queryRawUnsafe(`
        SELECT 
  d.date,
  p.priority,
  COALESCE(t.count, 0) AS count
FROM (
  SELECT CURDATE() - INTERVAL n DAY AS date
  FROM (
    SELECT a.N + b.N * 10 AS n
    FROM (
      SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) a,
    (
      SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) b
  ) AS days
  WHERE n < 90
) d
CROSS JOIN (
  SELECT 'LOW' AS priority UNION ALL
  SELECT 'MEDIUM' UNION ALL
  SELECT 'HIGH'
) p
LEFT JOIN (
  SELECT DATE(createdAt) AS date, priority, COUNT(*) AS count
  FROM Ticket
  WHERE createdAt >= CURDATE() - INTERVAL 90 DAY
  GROUP BY DATE(createdAt), priority
) t
  ON d.date = t.date AND p.priority = t.priority
ORDER BY d.date DESC;
      `);

        const statusRawSafe = statusRaw.map(({ date, status, count }) => {
            const istDate = toZonedTime(new Date(date), timeZone);
            return {
                date: format(istDate, 'yyyy-MM-dd', { timeZone: timeZone }),
                status,
                count: Number(count),
            };
        });

        const priorityRawSafe = priorityRaw.map(({ date, priority, count }) => {
            const istDate = toZonedTime(new Date(date), timeZone);
            return {
                date: format(istDate, 'yyyy-MM-dd', { timeZone: timeZone }),
                priority,
                count: Number(count),
            };
        });
        function groupByDate<T extends { date: string; count: number }>(
            data: T[],
            key: keyof T
        ) {
            const grouped: Record<string, unknown> = {};

            data.forEach((item) => {
                const { date, count } = item;
                const field = item[key] as string;
                if (!grouped[date]) grouped[date] = { date };
                (grouped[date] as Record<string, unknown>)[field] = count;
            });

            return Object.values(grouped);
        }

        const statusGrouped = groupByDate(statusRawSafe, "status");
        const priorityGrouped = groupByDate(priorityRawSafe, "priority");

        return NextResponse.json({ status: statusGrouped, priority: priorityGrouped }, { status: 200 });
    } catch (error) {
        console.error("Error fetching summary:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
