"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Home,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type Shift = {
  label: string;
  value: string;
};

type Schedule = Record<string, string>;

const shifts: Shift[] = [
  {
    label: "17:30 - 22:30",
    value: "17:30-22:30",
  },
  {
    label: "18:00 - 22:00",
    value: "18:00-22:00",
  },
  {
    label: "18:30 - 22:30",
    value: "18:30-22:30",
  },
  {
    label: "休",
    value: "休",
  },
];

const weekDays = [
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日",
];

function getMonday(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  result.setHours(0, 0, 0, 0);

  return result;
}

function formatDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 不使用 toISOString()
 * 避免台灣時區造成日期前後一天的問題
 */
function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDates(monday: Date) {
  return weekDays.map((_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return date;
  });
}

export default function Reward() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMonday(new Date())
  );

  const [schedule, setSchedule] = useState<Schedule>({});

  const [copied, setCopied] = useState<string | null>(null);

  const weekDates = useMemo(
    () => getWeekDates(weekStart),
    [weekStart]
  );

  /**
   * 修改班別
   */
  const changeShift = (date: Date, value: string) => {
    const key = getDateKey(date);

    setSchedule((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * 取得某一天的班別
   */
  const getShift = (date: Date) => {
    const key = getDateKey(date);

    return schedule[key] ?? "";
  };

  /**
   * 複製文字
   */
  const copyText = async (
    text: string,
    key: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(key);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error("複製失敗:", error);

      // Clipboard API 不可用時的 fallback
      const textarea = document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      document.execCommand("copy");

      document.body.removeChild(textarea);

      setCopied(key);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    }
  };

  /**
   * 複製單日
   */
  const copyDay = (
    date: Date,
    index: number
  ) => {
    const shift = getShift(date) || "未排班";

    const text = `${formatDate(date)} : ${shift}`;

    void copyText(text, `day-${index}`);
  };

  /**
   * 複製整週
   */
  const copyAll = () => {
    const text = weekDates
      .map((date) => {
        const shift = getShift(date) || "未排班";

        return `${formatDate(date)} : ${shift}`;
      })
      .join("\n");

    void copyText(text, "all");
  };

  /**
   * 切換週
   */
  const changeWeek = (amount: number) => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);

      newDate.setDate(
        newDate.getDate() + amount * 7
      );

      return newDate;
    });
  };

  const weekTitle = `${formatDate(
    weekDates[0]
  )} ～ ${formatDate(weekDates[6])}`;

  return (
  <Card className="w-full shadow-sm">
      {/* Header */}
     <CardHeader
  className="
    flex flex-col gap-4 pb-4 border-b
    sm:flex-row sm:items-center sm:justify-between
  "
>

  <div className="flex flex-col gap-1.5 w-full sm:w-auto">
    <div className="flex items-center justify-between sm:justify-start sm:gap-4">
    
      <CardTitle className="flex items-center gap-2 text-xl font-semibold">
        <CalendarDays size={22} className="text-primary" />
        週排班
      </CardTitle>

      <Button variant="outline" size="icon"  className="h-8 w-8 shrink-0 active:scale-95 ">
        <Link href="/">
          <Home size={18} />
        </Link>
      </Button>
    </div>

    <CardDescription className="text-sm">
      {weekTitle}
    </CardDescription>
  </div>

  
  <button
    type="button"
    onClick={copyAll}
    className="
      relative z-10
      inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2
      rounded-md border border-input bg-background
      px-4 py-2 text-sm font-medium shadow-sm
      transition-all active:scale-95 active:bg-accent/80
      hover:bg-accent hover:text-accent-foreground
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    "
  >
    {copied === "all" ? (
      <>
        <Check size={16} className="text-green-500" />
        已複製
      </>
    ) : (
      <>
        <Copy size={16} />
        複製全部
      </>
    )}
  </button>
</CardHeader>
      <CardContent className="space-y-6">
        
        <div
          className="
            flex items-center justify-between
            rounded-xl
            border
            bg-card
            p-2
            text-card-foreground
            shadow-sm
          "
        >
          <Button 
            type="button"
            onClick={() => changeWeek(-1)}
            className="
              inline-flex h-9 w-9
              items-center justify-center
              rounded-md
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
            title="上一週"
            variant={"ghost"}
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="text-center">
            <div className="mb-1.5 text-sm font-medium">
              本週
            </div>

            <div className="text-xs text-muted-foreground">
              {weekTitle}
            </div>
          </div>

          <Button
            type="button"
            onClick={() => changeWeek(1)}
            className="
              inline-flex h-9 w-9
              items-center justify-center
              rounded-md
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
            "
            title="下一週"
            variant="ghost"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  日期
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  星期
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  班別
                </th>

                <th className="w-20 px-4 py-3 text-center font-medium">
                  複製
                </th>
              </tr>
            </thead>

            <tbody>
              {weekDates.map((date, index) => {
                const currentShift =
                  getShift(date);

                return (
                  <tr
                    key={getDateKey(date)}
                    className="
                      border-t
                      transition-colors
                      hover:bg-muted/50
                    "
                  >
                    <td className="px-4 py-4 font-medium">
                      {formatDate(date)}
                    </td>

                    <td className="px-4 py-4">
                      {weekDays[index]}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={currentShift}
                        onChange={(event) =>
                          changeShift(
                            date,
                            event.target.value
                          )
                        }
                        className="
                          h-9
                          w-full
                          max-w-50
                          
                          rounded-md
                          border
                          border-input
                          bg-background
                          px-3
                          text-sm
                          shadow-sm
                          outline-none
                          focus:ring-1
                          focus:ring-ring
                        "
                      >
                        <option value="" disabled>
                          選擇班別
                        </option>

                        {shifts.map((shift) => (
                          <option
                            key={shift.value}
                            value={shift.value}
                          >
                            {shift.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Button
                        type="button"
                        onClick={() =>
                          copyDay(date, index)
                        }
                        variant="ghost"
                        className="
                          inline-flex
                          
                          h-8 w-8
                          items-center
                          justify-center
                          rounded-md
                          transition-colors
                          hover:bg-accent
                          hover:text-accent-foreground
                        "
                        title="複製"
                      >
                        {copied ===
                        `day-${index}` ? (
                          <Check size={16} className="text-black" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {weekDates.map((date, index) => {
            const currentShift =
              getShift(date);

            return (
              <Card
                key={getDateKey(date)}
                className="border-border/80 shadow-none"
              >
                <CardHeader
                  className="
                    flex flex-row
                    items-center
                    justify-between
                    space-y-0
                    p-4 pb-3
                  "
                >
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {formatDate(date)}
                    </CardTitle>

                    <CardDescription>
                      {weekDays[index]}
                    </CardDescription>
                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      copyDay(date, index)
                    }
                    className="
                      inline-flex
                      h-8 w-8
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-input
                      bg-background
                      transition-colors
                      hover:bg-accent
                      hover:text-accent-foreground
                    "
                    title="複製"
                  >
                    {copied ===
                    `day-${index}` ? (
                      <Check size={16} className="text-black" />
                    ) : (
                      <Copy size={16} className="text-black" />
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <select
                    value={currentShift}
                    onChange={(event) =>
                      changeShift(
                        date,
                        event.target.value
                      )
                    }
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3 py-2
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-ring
                    "
                  >
                    <option value="" disabled>
                      選擇班別
                    </option>

                    {shifts.map((shift) => (
                      <option
                        key={shift.value}
                        value={shift.value}
                      >
                        {shift.label}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>

 
);
}
