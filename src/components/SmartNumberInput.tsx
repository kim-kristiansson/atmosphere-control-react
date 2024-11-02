import React, { useState, useRef, useEffect, useCallback } from 'react'

interface SwipeNumberInputProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    wheelSensitivity?: number
    distanceSensitivity?: number
    maxDistanceMultiplier?: number
    distanceExponent?: number
    minThreshold?: number
    allowDecimals?: boolean
    decimalPlaces?: number
}

const SmartNumberInput: React.FC<SwipeNumberInputProps> = ({
    value,
    onChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    label = 'Value',
    wheelSensitivity = 0.5,
    distanceSensitivity = 100,
    maxDistanceMultiplier = 3,
    distanceExponent = 2,
    minThreshold = 0.1,
    allowDecimals = false,
    decimalPlaces = 2,
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const lastY = useRef(0)
    const intervalRef = useRef<number>()
    const containerRef = useRef<HTMLDivElement>(null)

    const roundValue = useCallback(
        (num: number): number => {
            if (!allowDecimals) return Math.round(num)
            const multiplier = Math.pow(10, decimalPlaces)
            return Math.round(num * multiplier) / multiplier
        },
        [allowDecimals, decimalPlaces]
    )

    const formatValue = useCallback(
        (num: number): string => {
            if (!allowDecimals) return Math.round(num).toLocaleString()
            return num.toLocaleString(undefined, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
            })
        },
        [allowDecimals, decimalPlaces]
    )

    const calculateNewValue = useCallback(
        (currentY: number): number => {
            // Calculate distance from start position
            const distance = Math.abs(currentY - startY)
            const normalizedDistance = distance / distanceSensitivity

            // Apply exponential scaling to the normalized distance
            const multiplier = Math.pow(normalizedDistance, distanceExponent)

            // Cap the multiplier at the maximum
            const cappedMultiplier = Math.min(multiplier, maxDistanceMultiplier)

            if (cappedMultiplier < minThreshold) return value

            // Determine direction based on current position relative to start
            const direction = currentY > startY ? 1 : -1

            // Calculate increment based only on distance
            const increment = step * cappedMultiplier * direction
            const newValue = value - increment

            return Math.min(Math.max(roundValue(newValue), min), max)
        },
        [
            value,
            step,
            min,
            max,
            minThreshold,
            distanceSensitivity,
            maxDistanceMultiplier,
            distanceExponent,
            roundValue,
            startY,
        ]
    )

    useEffect(() => {
        if (isDragging) {
            const updateValue = () => {
                onChange(calculateNewValue(lastY.current))
            }
            intervalRef.current = window.setInterval(updateValue, 16)
        }
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current)
            }
        }
    }, [isDragging, calculateNewValue, onChange])

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        const touchY = e.touches[0].clientY
        setStartY(touchY)
        lastY.current = touchY
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const currentY = e.touches[0].clientY
        lastY.current = currentY
        onChange(calculateNewValue(currentY))
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const wheelDistance = Math.abs(e.deltaY) * wheelSensitivity
        const direction = e.deltaY > 0 ? 1 : -1
        const newValue = value + wheelDistance * direction
        onChange(Math.min(Math.max(roundValue(newValue), min), max))
    }

    return (
        <div className='w-full max-w-xs'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
            <div
                ref={containerRef}
                className={`
                    relative p-4 bg-white border rounded-lg shadow-sm
                    ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                    touch-none select-none
                `}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
            >
                <div className='flex items-center justify-between'>
                    <span className='text-lg font-semibold'>{formatValue(value)}</span>
                    <div className='flex flex-col items-center text-gray-400'>
                        <span className='text-xs'>⬆️</span>
                        <span className='text-xs'>⬇️</span>
                    </div>
                </div>
                {isDragging && <div className='absolute inset-0 bg-blue-50/20 rounded-lg' />}
            </div>
        </div>
    )
}

export default SmartNumberInput
