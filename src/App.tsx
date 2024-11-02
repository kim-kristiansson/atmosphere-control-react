import { useState } from 'react'
import SmartNumberInput from './components/SmartNumberInput'
const App = () => {
    const [value, setValue] = useState(0)
    return (
        <div>
            <SmartNumberInput
                value={value}
                onChange={setValue}
                min={-10000}
                max={1000}
                step={0.8}
                label='Demo Input'
                wheelSensitivity={0.5}
                distanceSensitivity={51}
                distanceExponent={2}
                minThreshold={0.1}
                allowDecimals={false}
            />
        </div>
    )
}

export default App
