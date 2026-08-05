"use client";

import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/formatCurrency";
import React from "react";

function StartTaskBtn({
  taskId,
  taskLink,
}: {
  taskId: string;
  taskLink: string;
}) {
  const [taskLoading, setTaskLoading] = React.useState<boolean>(false);
  const [cooldown, setCooldown] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startCooldown = (cooldownEndsAt: string | Date) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const endTime = new Date(cooldownEndsAt).getTime();

    const update = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setCooldown(remaining);

      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Run immediately so the UI updates without waiting 1 second
    update();

    timerRef.current = setInterval(update, 1000);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  async function startTask(taskId: string, taskLink: string) {
    if (taskLoading) return;
    setTaskLoading(true);

    try {
      const res = await fetch("/api/tasks/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.add({
          type: "error",
          title: "Failed to start task...BAD RESPONSE",
          description: data.message,
        });
        setTaskLoading(false);
        return;
      }

      //start timer lockdown
      startCooldown(data.cooldownEndsAt);

      // Open immediately after server returns
      const ntab = window.open(taskLink, "_blank");
      const isTabOpened =
        ntab && !ntab.closed && typeof ntab.closed !== "undefined";

      if (ntab && isTabOpened) {
        const res_task_complete = await fetch("/api/tasks/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId,
          }),
        });
        if (!res_task_complete || !res_task_complete.ok) {
          throw new Error(
            "Can't Update Balance and Task Count. Try this task later",
          );
        }
        const task_complete_data = await res_task_complete.json();
        if (task_complete_data.success) {
          toast.add({
            type: "success",
            title: `1 Task Completed !`,
            description: `+${formatCurrency(0.1)} added into your account.\nNew Balance: ${formatCurrency(task_complete_data.newBalance)}`,
          });
        }
      } else {
        toast.add({
          type: "error",
          title: "FAST CLICK: Failed to start this task !!!",
          description:
            "Don't Click new task too soon , Disable Adblocker,  Try again in a few moments",
        });
      }

      setTaskLoading(false);
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        title: "Failed to start this task !!!",
        description: String(error),
      });
      setTaskLoading(false);
    }
  }
  return (
    <>
      <button
        onClick={() => startTask(taskId, taskLink)}
        disabled={taskLoading || cooldown > 0}
        type="submit"
        className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-red-600 to-rose-600 disabled:bg-linear-to-r disabled:from-slate-500/50 disabled:to-slate-800/80 disabled:text-slate-300/70 disabled:pointer-events-none  px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-rose-700 sm:w-auto"
      >
        {taskLoading ? (
          "Loading..."
        ) : cooldown > 0 ? (
          `Wait ${cooldown} seconds`
        ) : (
          <>
            <span>Start Task</span>
            <span className="ml-2 text-base">→</span>
          </>
        )}
      </button>
    </>
  );
}

export default StartTaskBtn;
