import Link from 'next/link';
import React from 'react'

function page() {
  return (
    <div className='flex justify-center items-center min-h-screen'>
        <Link href={"/admin/add_task"} className="rounded bg-blue-600 px-20 py-20 text-sm font-medium text-white hover:bg-blue-700">
            Add Task
        </Link>
    </div>
  )
}

export default page