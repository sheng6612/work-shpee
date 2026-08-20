"use client";

import { useState } from "react";
import { Send, CalendarDays } from "lucide-react";
import Reward from "@/components/reward";
import Scheduling from "@/components/scheduling";

export default function Home() {
  // 控制目前顯示哪一個組件的狀態
  const [activeTab, setActiveTab] = useState("reward");

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8 space-y-6">
      
      {/* 選單區域 (仿 shadcn Tabs 風格) */}
      <div className="mx-auto flex max-w-md items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <button
          onClick={() => setActiveTab("reward")}
          className={`
            inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all
            ${activeTab === "reward" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"}
          `}
        >
          < CalendarDays size={16} />
          
          排班 (Reward)
        
        </button>

        <button
          onClick={() => setActiveTab("scheduling")}
          className={`
            inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all
            ${activeTab === "scheduling" ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"}
          `}
        >
          <Send size={16} />
            回報 (Scheduling)
        </button>
      </div>

      {/* 內容渲染區域 */}
      <div className="mx-auto w-full max-w-4xl pt-4">
        {activeTab === "reward" && <Reward />}
        
        {activeTab === "scheduling" && <Scheduling/>}
      </div>

    </div>
  );
}