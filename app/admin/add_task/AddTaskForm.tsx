"use client";
import { addTaskToDatabase } from "@/app/actions/addTask";
import { toast } from "@/components/ui/toast";
import { ListPlus } from "lucide-react";
import React from "react";

function AddTaskForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await addTaskToDatabase(e);
      if (result.success) {
        toast.add({
          type: "success",
          title: "Task Added",
          description: "New Task Added successfully to the server.",
        });
      } else {
        toast.add({
          type: "error",
          title: "Failed To Add Task",
          description: result.message,
        });
        throw new Error(result.message);
      }
    } catch (error) {
      toast.add({
        type: "error",
        title: "Error Adding Task",
        description: String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="border-b border-slate-800 bg-slate-950/70 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/20">
              <ListPlus />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Add New Task</h2>
              <p className="mt-1 text-sm text-slate-400">
                Fill in the details below to publish a new task.
              </p>
            </div>
          </div>
        </div>

        <form
          action={handleSubmit}
          className="grid gap-5 px-6 py-6 sm:px-8 lg:grid-cols-2 lg:gap-6"
        >
          <div className="space-y-5 lg:col-span-2">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Task Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter task title"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="link"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Task Link
              </label>
              <input
                type="text"
                name="link"
                id="link"
                placeholder="Paste task link"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the task details"
                rows={6}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              ></textarea>
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-cyan-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskForm;
