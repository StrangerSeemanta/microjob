"use client";

import Link from "next/link";
import React, { useCallback, useEffect } from "react";
function Tasks() {
  const [tasks, setTasks] = React.useState<
    { _id: string; title: string; link:string; description: string }[]
  >([]);
  const fetchTasks = useCallback(async () => {
    try {
      const data = await fetch("/api/gettasks").then((res) => res.json());
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
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
  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="border border-gray-300 rounded p-4 mb-4 flex flex-col items-start justify-between">
          <h3> Task Title : {task.title}</h3>
          <p> Task Description : {task.description}</p>
          <Link href={task.link? task.link : `#`} target="_blank" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View Task
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Tasks;
