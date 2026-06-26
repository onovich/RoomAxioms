import { RoomAxiomsScreen } from './view/screens/RoomAxiomsScreen'
import { AuthoringWorkbenchScreen } from './workbench/AuthoringWorkbenchScreen'
import { shouldShowAuthoringWorkbench } from './workbench/route'
import './App.css'

export default function App() {
  if (shouldShowAuthoringWorkbench(window.location)) return <AuthoringWorkbenchScreen />

  return <RoomAxiomsScreen />
}
