"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  Package,
  Send,
  Store,
} from "lucide-react";

import { useState,useEffect } from "react";

/* =========================================================
   Type
========================================================= */

type SectionData = {
  boxes: string;
  completedAt: string;
  unableCount: string;
  reason: string;
};

type ReportData = {
  date: string;
  store: string;

  scsUpload: SectionData;

  nddUpload: SectionData;

  nddPacking: SectionData;

  scsHdPacking: SectionData;
};

type SectionKey =
  | "scsUpload"
  | "nddUpload"
  | "nddPacking"
  | "scsHdPacking";

/* =========================================================
   門市
========================================================= */

const stores = [
  {
    value: "民主橫",
    label: "民主橫",
  },
  {
    value: "新盛",
    label: "新盛",
  },
  {
    value: "五福",
    label: "五福",
  },
  {
    value: "六合",
    label: "六合",
  },
  {
    value: "新興七賢",
    label: "新興七賢",
  },
  {
    value: "忠孝",
    label: "忠孝",
  },
];
//待加入

/* =========================================================
   日期
========================================================= */

function getToday() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
const STORAGE_PREFIX = "scheduling-report-";

function getStorageKey(date: string) {
  return `${STORAGE_PREFIX}${date}`;
}
function formatDate(date: string) {
  const [, month, day] = date.split("-");

  return `${Number(month)}/${Number(day)}`;
}

/* =========================================================
   取得目前時間
========================================================= */

function getCurrentTime() {
  const date = new Date();

  return `${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(
    2,
    "0"
  )}`;
}

/* =========================================================
   空白資料
========================================================= */

function createEmptySection(): SectionData {
  return {
    boxes: "",
    completedAt: "",
    unableCount: "",
    reason: "",
  };
}

/* =========================================================
   ReportSection
========================================================= */

type ReportSectionProps = {
  title: string;

  section: SectionKey;

  boxLabel: string;

  timeLabel: string;

  unableLabel: string;

  copyKey: string;

  report: ReportData;

  copied: string | null;

  onUpdate: (
    section: SectionKey,
    field: keyof SectionData,
    value: string
  ) => void;

  onCurrentTime: (section: SectionKey) => void;

  onCopy: (text: string, key: string) => void;

  getText: () => string;
};

function ReportSection({
  title,
  section,
  boxLabel,
  timeLabel,
  unableLabel,
  copyKey,
  report,
  copied,
  onUpdate,
  onCurrentTime,
  onCopy,
  getText,
}: ReportSectionProps) {
  const data = report[section];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package size={19} />

              {title}
            </CardTitle>

            <CardDescription className="mt-1">
              填寫完成狀況
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onCopy(getText(), copyKey)
            }
          >
            {copied === copyKey ? (
              <>
                <Check size={16} />
                已複製
              </>
            ) : (
              <>
                <Copy size={16} />
                複製
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 數量 */}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {boxLabel}
            </label>

            <Input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder={`請輸入${boxLabel}`}
              value={data.boxes}
              onChange={(event) =>
                onUpdate(
                  section,
                  "boxes",
                  event.target.value
                )
              }
            />
          </div>

          {/* 完成時間 */}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} />

              {timeLabel}
            </label>

            <div className="flex gap-2">
              <Input
                type="time"
                value={data.completedAt}
                onChange={(event) =>
                  onUpdate(
                    section,
                    "completedAt",
                    event.target.value
                  )
                }
              />

              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  onCurrentTime(section)
                }
              >
                現在
              </Button>
            </div>
          </div>

          {/* 無法數量 */}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {unableLabel}
            </label>

            <Input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="沒有請填 0"
              value={data.unableCount}
              onChange={(event) =>
                onUpdate(
                  section,
                  "unableCount",
                  event.target.value
                )
              }
            />
          </div>

          {/* 說明 */}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">
              無法處理說明
            </label>

            <Textarea
              placeholder="如果沒有請留空"
              value={data.reason}
              onChange={(event) =>
                onUpdate(
                  section,
                  "reason",
                  event.target.value
                )
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Scheduling
========================================================= */
export default function Scheduling() {
  const [report, setReport] =
    useState<ReportData>(() => {
      const today = getToday();

      // SSR 時沒有 localStorage
      if (typeof window === "undefined") {
        return {
          date: today,
          store: "",
          scsUpload: createEmptySection(),
          nddUpload: createEmptySection(),
          nddPacking: createEmptySection(),
          scsHdPacking: createEmptySection(),
        };
      }

      const key =
        getStorageKey(today);

      const saved =
        localStorage.getItem(key);

      if (saved) {
        try {
          const parsed =
            JSON.parse(saved) as ReportData;

          return {
            ...parsed,
            date: today,
          };
        } catch (error) {
          console.error(
            "讀取排班資料失敗:",
            error
          );
        }
      }

      return {
        date: today,
        store: "",
        scsUpload: createEmptySection(),
        nddUpload: createEmptySection(),
        nddPacking: createEmptySection(),
        scsHdPacking: createEmptySection(),
      };
    });

  const [copied, setCopied] =
    useState<string | null>(null);

  /* =======================================================
     自動保存
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const key =
      getStorageKey(report.date);

    localStorage.setItem(
      key,
      JSON.stringify(report)
    );
  }, [report]);

  /* =======================================================
     修改欄位
  ======================================================= */

  const updateSection = (
    section: SectionKey,
    field: keyof SectionData,
    value: string
  ) => {
    setReport((prev) => ({
      ...prev,

      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  /* =======================================================
     使用目前時間
  ======================================================= */

  const setCurrentTime = (
    section: SectionKey
  ) => {
    updateSection(
      section,
      "completedAt",
      getCurrentTime()
    );
  };

  /* =======================================================
     複製
  ======================================================= */

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

      const textarea =
        document.createElement("textarea");

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

  /* =======================================================
     SCS 上架
  ======================================================= */

  const getSCSUploadText = () => {
    const data = report.scsUpload;

    return `${formatDate(report.date)}
${report.store}
SCS上架完成回報
🔸到貨箱數：${data.boxes || 0}
🔸上架完成時間:${data.completedAt || "--:--"}
🔸無法上架顆數：${data.unableCount || 0}${
      data.reason ? `（${data.reason}）` : ""
    }`;
  };

  /* =======================================================
     NDD 上架
  ======================================================= */

  const getNDDUploadText = () => {
    const data = report.nddUpload;

    return `${formatDate(report.date)}
${report.store}
NDD上架完成回報
🔸到貨箱數：${data.boxes || 0}
🔸上架完成時間:${data.completedAt || "--:--"}
🔸無法上架顆數：${data.unableCount || 0}${
      data.reason ? `（${data.reason}）` : ""
    }`;
  };

  /* =======================================================
     NDD 打包
  ======================================================= */

  const getNDDPackingText = () => {
    const data = report.nddPacking;

    return `${formatDate(report.date)}
${report.store}
NDD打包完成回報
🔸打包箱數：${data.boxes || 0}
🔸打包完成時間:${data.completedAt || "--:--"}
🔸無法打包顆數：${data.unableCount || 0}${
      data.reason ? `（${data.reason}）` : ""
    }`;
  };

  /* =======================================================
     SCS HD 打包
  ======================================================= */

  const getSCSHDPackingText = () => {
    const data = report.scsHdPacking;

    return `${formatDate(report.date)}
${report.store}
SCS HD打包完成回報：
🔸打包包數：${data.boxes || 0}
🔸打包完成時間:${data.completedAt || "--:--"}
🔸無法打包顆數：${data.unableCount || 0}${
      data.reason ? `（${data.reason}）` : ""
    }`;
  };

  /* =======================================================
     複製全部
  ======================================================= */

  const copyAll = () => {
    const text = [
      getSCSUploadText(),
      getNDDUploadText(),
      getNDDPackingText(),
      getSCSHDPackingText(),
    ].join("\n\n");

    void copyText(text, "all");
  };

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="w-full space-y-6">
      {/* ===================================================
          Header
      =================================================== */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Send size={20} />

                工作回報
              </CardTitle>

              <CardDescription className="mt-1">
                填寫今日門市工作完成狀況
              </CardDescription>
            </div>

            <Button
              type="button"
              onClick={copyAll}
              className="w-full sm:w-auto"
            >
              {copied === "all" ? (
                <>
                  <Check size={17} />
                  已複製全部
                </>
              ) : (
                <>
                  <Copy size={17} />
                  複製全部
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 日期 */}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays size={16} />

                日期
              </label>

              <Input
                type="date"
                value={report.date}
                readOnly
              />
            </div>

            {/* 門市 */}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Store size={16} />

                門市
              </label>

              <Select
                value={report.store}
                onValueChange={(value) => {
                  if (!value) return;

                  setReport((prev) => ({
                    ...prev,
                    store: value,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇門市" />
                </SelectTrigger>

                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem
                      key={store.value}
                      value={store.value}
                    >
                      {store.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          SCS 上架
      =================================================== */}

      <ReportSection
        title="SCS上架完成回報"
        section="scsUpload"
        boxLabel="到貨箱數"
        timeLabel="上架完成時間"
        unableLabel="無法上架顆數"
        copyKey="scs"
        report={report}
        copied={copied}
        onUpdate={updateSection}
        onCurrentTime={setCurrentTime}
        onCopy={copyText}
        getText={getSCSUploadText}
      />

      {/* ===================================================
          NDD 上架
      =================================================== */}

      <ReportSection
        title="NDD上架完成回報"
        section="nddUpload"
        boxLabel="到貨箱數"
        timeLabel="上架完成時間"
        unableLabel="無法上架顆數"
        copyKey="ndd-upload"
        report={report}
        copied={copied}
        onUpdate={updateSection}
        onCurrentTime={setCurrentTime}
        onCopy={copyText}
        getText={getNDDUploadText}
      />

      {/* ===================================================
          NDD 打包
      =================================================== */}

      <ReportSection
        title="NDD打包完成回報"
        section="nddPacking"
        boxLabel="打包箱數"
        timeLabel="打包完成時間"
        unableLabel="無法打包顆數"
        copyKey="ndd-packing"
        report={report}
        copied={copied}
        onUpdate={updateSection}
        onCurrentTime={setCurrentTime}
        onCopy={copyText}
        getText={getNDDPackingText}
      />

      {/* ===================================================
          SCS HD 打包
      =================================================== */}

      <ReportSection
        title="SCS HD打包完成回報"
        section="scsHdPacking"
        boxLabel="打包包數"
        timeLabel="打包完成時間"
        unableLabel="無法打包顆數"
        copyKey="scs-hd"
        report={report}
        copied={copied}
        onUpdate={updateSection}
        onCurrentTime={setCurrentTime}
        onCopy={copyText}
        getText={getSCSHDPackingText}
      />

      {/* ===================================================
          複製全部
      =================================================== */}

      <div className="pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={copyAll}
          className="w-full"
        >
          {copied === "all" ? (
            <>
              <Check size={17} />
              已複製完整回報
            </>
          ) : (
            <>
              <Copy size={17} />
              複製完整回報
            </>
          )}
        </Button>
      </div>
    </div>
  );
}