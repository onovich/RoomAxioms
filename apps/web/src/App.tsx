import { lazy, Suspense } from 'react'

import { RoomAxiomsScreen } from './view/screens/RoomAxiomsScreen'
import { shouldShowAuthoringWorkbench } from './workbench/route'
import './App.css'

const AuthoringWorkbenchScreen = lazy(() => import('./workbench/AuthoringWorkbenchScreen'))

export default function App() {
  if (shouldShowAuthoringWorkbench(window.location)) {
    return (
      <Suspense fallback={<div className="workbench-loading">Loading authoring workbench...</div>}>
        <AuthoringWorkbenchScreen />
      </Suspense>
    )
  }

  return <RoomAxiomsScreen />
}
