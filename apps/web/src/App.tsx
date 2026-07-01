import { lazy, Suspense } from 'react'

import { RoomAxiomsScreen } from './view/screens/RoomAxiomsScreen'
import { shouldShowFigmaPuzzlePrototype } from './figma-puzzle-prototype/route'
import { shouldShowAuthoringWorkbench } from './workbench/route'
import './App.css'

const AuthoringWorkbenchScreen = lazy(() => import('./workbench/AuthoringWorkbenchScreen'))
const FigmaPuzzlePrototype = lazy(() => import('./figma-puzzle-prototype/FigmaPuzzlePrototype'))

export default function App() {
  if (shouldShowFigmaPuzzlePrototype(window.location)) {
    return (
      <Suspense fallback={<div className="workbench-loading">Loading prototype...</div>}>
        <FigmaPuzzlePrototype />
      </Suspense>
    )
  }

  if (shouldShowAuthoringWorkbench(window.location)) {
    return (
      <Suspense fallback={<div className="workbench-loading">Loading authoring workbench...</div>}>
        <AuthoringWorkbenchScreen />
      </Suspense>
    )
  }

  return <RoomAxiomsScreen />
}
