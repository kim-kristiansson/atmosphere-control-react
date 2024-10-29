import React from 'react'

const SmartNumberInput = () => {
    const [value, setValue] = React.useState(0)

    const handleScroll = (e: React.WheelEvent<HTMLInputElement>) => {
        if (e.deltaY < 0) {
            setValue((prev) => prev + 1)
        } else {
            setValue((prev) => prev - 1)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value)
        if (!isNaN(newValue)) {
            setValue(newValue)
        }
    }

    const handleIncrement = () => setValue((prev) => prev + 1)
    const handleDecrement = () => setValue((prev) => prev - 1)

    return (
        <div className='flex flex-col items-center h-screen bg-gray-100 space-y-4'>
            <div className='flex items-center space-x-2'>
                <button
                    onClick={handleDecrement}
                    className='bg-gray-300 text-3xl font-bold p-2 rounded-lg hover:bg-gray-400'
                >
                    -
                </button>
                <input
                    type='number'
                    value={value}
                    onChange={handleChange}
                    onWheel={handleScroll}
                    className='text-3xl font-semibold w-24 text-center p-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-all'
                />
                <button
                    onClick={handleIncrement}
                    className='bg-gray-300 text-3xl font-bold p-2 rounded-lg hover:bg-gray-400'
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default SmartNumberInput
