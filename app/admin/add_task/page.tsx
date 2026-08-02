import React from 'react'
import AddTaskForm from './AddTaskForm';

function page() {
  return (
    <div className="p-4 flex justify-center items-center min-h-screen ">{<AddTaskForm></AddTaskForm>}</div>
  )
}

export default page