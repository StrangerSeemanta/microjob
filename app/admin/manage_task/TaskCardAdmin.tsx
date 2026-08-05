"use client";

import { deleteTask } from "@/app/actions/addTask";
import { toast } from "@/components/ui/toast";
import { ObjectId } from "mongodb";
import React, { useCallback, useEffect } from "react";

function TaskCardAdmin() {
  const [tasks, setTasks] = React.useState<
    { _id: string; title: string; link: string; description: string }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/tasks/list");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Unable to load tasks right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTasks();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchTasks]);
  const handleDelete = async (tid: string | ObjectId) => {
    const taskId = tid.toString();
    const response = await deleteTask(taskId);
    await fetchTasks();

    if (response) {
      toast.add({
        title: "Task Deleted",
      });
    } else {
      toast.add({
        title: "Failed To Delete Task",
      });
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-red-950 to-slate-900 px-3 py-6 sm:px-4 sm:py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
              Available Tasks
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-100 sm:text-3xl">
              Explore and start your next opportunity
            </h1>
          </div>
          <div className="self-start rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm md:self-auto">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} available
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm backdrop-blur sm:p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
              <p className="text-slate-300">Loading tasks...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-800/40 bg-red-950/40 p-6 text-center text-red-200 shadow-sm sm:p-8">
            <p className="font-semibold">Oops! Something went wrong.</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 text-center shadow-sm sm:p-10">
            <p className="text-lg font-semibold text-slate-200">
              No tasks available right now.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Please check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {tasks.map((task) => (
              <article
                key={task._id}
                className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                    New
                  </span>
                  <span className="text-sm text-slate-500">Opportunity</span>
                </div>

                <h3 className="mb-3 text-lg font-semibold text-slate-100 sm:text-xl">
                  {task.title}
                </h3>

                {/* <h2 className="my-2 break-all text-base font-bold text-slate-100 sm:text-lg">
                  {task.link}
                </h2> */}

                <p className="mb-6 text-sm leading-6 text-slate-400">
                  {task.description}
                </p>
                <h1 className="text-lg mb-3 font-bold text-emerald-400">
                  Earn : BDT 0.10 taka
                </h1>

                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-600 p-3"
                >
                  Delete This Task
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCardAdmin;
