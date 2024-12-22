'use client'
import React from 'react'

const AddButton = ({onClick}) => {
    return (
        <div onClick={onClick} className=' w-12 cursor-pointer h-12 rounded-full flex items-center justify-center bg-red-600 fixed bottom-5 right-5'>
            <span className="material-symbols-outlined">
                add
            </span>
        </div>
    )
}

export default AddButton
