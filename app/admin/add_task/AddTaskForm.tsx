"use client";
import { addTaskToDatabase } from "@/app/actions/addTask";
import React from "react";

function AddTaskForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await addTaskToDatabase(e);
      if (result.success) {
        console.log(result.message);
      } else {
        console.log(result.message);

        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);

      // Handle error (e.g., show a notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex justify-center items-center min-h-screen ">
      <form
        action={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Task Title"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="link"
          id="link"
          placeholder="Task Link"
          className="border p-2 rounded"
            required
        />

        <textarea
          id="description"
          name="description"
          placeholder="Task Description"
          className="border p-2 rounded"
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}

export default AddTaskForm;
