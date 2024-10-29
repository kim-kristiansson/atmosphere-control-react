import { useState } from 'react'
import SmartNumberInput from './components/SmartNumberInput'

const App = () => {
    const [value, setValue] = useState(0)
    return (
        <SmartNumberInput
            value={value}
            onChange={setValue}
            sensitivity={1000} // Less sensitive
            maxMultiplier={5} // Slower maximum speed
            minThreshold={0} // Ignore smaller movements
            wheelSensitivity={0.3} // Slower scroll wheel
            allowDecimals={true}
            decimalPlaces={4} // Shows numbers like "123.4567"
        />
    )
}

export default App
