import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import PurchaseDetailsPage from './PurchaseDetailsPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PurchaseDetailsPage/>
    </>
  )
}

export default App
