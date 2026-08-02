"use client";

import React from 'react'
import { getTasksFromDatabase } from '../actions/getTasks';

function Tasks() {
    const getTasks = async () => {
        const tasks = await getTasksFromDatabase();
        return tasks;
    }

    const tasks = getTasks();
  return (
    <div>{tasks}</div>
  )
}

export default Tasks