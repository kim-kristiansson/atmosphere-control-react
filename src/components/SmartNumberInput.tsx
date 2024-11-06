import React from 'react'

interface SmartNumberInputProps {
    min: number
    max: number
    step: number
    value: number
    onChange: (value: number) => void
}

let prevY = 0

const SmartNumberInput = ({
    min = 0,
    max = 100,
    step = 1,
    value = 0,
    onChange,
}: SmartNumberInputProps) => {
    const handleTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
        const currentY = e.touches[0].clientY

        if (currentY > prevY && value + step <= max) {
            onChange(value + step)
        } else if (currentY < prevY && value - step >= min) {
            onChange(value - step)
        }

        prevY = currentY
    }

    return (
        <div>
            <input type='number' onTouchMove={handleTouchMove} value={value} readOnly />
        </div>
    )
}

export default SmartNumberInput
