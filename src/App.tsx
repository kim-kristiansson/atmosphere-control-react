import { useState } from 'react'
import SmartNumberInput from './components/SmartNumberInput'

const App = () => {
    const [value, setValue] = useState(0)

    return (
        <div>
            <SmartNumberInput min={0} max={100} step={1} value={value} onChange={setValue} />
        </div>
    )
}

export default App
