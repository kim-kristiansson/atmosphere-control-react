import React, { useState, useRef, useEffect, useCallback } from 'react'

interface SwipeNumberInputProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    // Speed sensitivity props
    sensitivity?: number
    maxMultiplier?: number
    minThreshold?: number
    wheelSensitivity?: number
    // Distance sensitivity props
    distanceSensitivity?: number // How quickly distance affects speed (lower = faster effect)
    maxDistanceMultiplier?: number // Maximum speed multiplier from distance
    // Decimal control props
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
    // Speed defaults
    sensitivity = 300,
    maxMultiplier = 2,
    minThreshold = 0.1,
    wheelSensitivity = 0.5,
    // Distance defaults
    distanceSensitivity = 100, // Pixels needed for full effect
    maxDistanceMultiplier = 3, // Maximum multiplier from distance
    // Decimal defaults
    allowDecimals = false,
    decimalPlaces = 2,
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [currentSpeed, setCurrentSpeed] = useState(0)
    const [startY, setStartY] = useState(0)
    const lastY = useRef(0)
    const lastTime = useRef(Date.now())
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
        (speed: number, currentY: number): number => {
            // Calculate base multiplier from movement speed
            const speedMultiplier = Math.min(Math.abs(speed) / sensitivity, maxMultiplier)

            // Calculate distance multiplier using sensitivity props
            const distance = Math.abs(currentY - startY)
            const distanceMultiplier = Math.min(
                distance / distanceSensitivity,
                maxDistanceMultiplier
            )

            // Combine speed and distance multipliers
            const totalMultiplier = speedMultiplier * (1 + distanceMultiplier)

            if (totalMultiplier < minThreshold) return value

            // Apply easing for more precise control
            const easedMultiplier = Math.pow(totalMultiplier, 1.5)

            const increment = step * easedMultiplier * Math.sign(speed)
            const newValue = value - increment

            return Math.min(Math.max(roundValue(newValue), min), max)
        },
        [
            value,
            step,
            min,
            max,
            sensitivity,
            maxMultiplier,
            minThreshold,
            distanceSensitivity,
            maxDistanceMultiplier,
            roundValue,
            startY,
        ]
    )

    useEffect(() => {
        if (isDragging && currentSpeed !== 0) {
            const updateValue = () => {
                onChange(calculateNewValue(currentSpeed, lastY.current))
            }

            intervalRef.current = window.setInterval(updateValue, 16)
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current)
            }
        }
    }, [isDragging, currentSpeed, calculateNewValue, onChange])

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        const touchY = e.touches[0].clientY
        setStartY(touchY)
        lastY.current = touchY
        lastTime.current = Date.now()
        setCurrentSpeed(0)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return

        const currentY = e.touches[0].clientY
        const currentTime = Date.now()
        const deltaY = currentY - lastY.current
        const deltaTime = currentTime - lastTime.current

        if (deltaTime > 0) {
            const speed = (deltaY / deltaTime) * 1000
            setCurrentSpeed(speed)
            onChange(calculateNewValue(speed, currentY))
        }

        lastY.current = currentY
        lastTime.current = currentTime
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        setCurrentSpeed(0)
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const speed = e.deltaY * wheelSensitivity
        const mouseY = e.clientY
        onChange(calculateNewValue(speed, mouseY))
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
