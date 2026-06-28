import type { DialogueLine, DialogueScene } from './dialogue'

export function activeDialogueLine(scene: DialogueScene, lineIndex: number): DialogueLine | null {
  return scene.lines[lineIndex] ?? null
}

export function nextDialogueLineIndex(scene: DialogueScene, lineIndex: number): number | null {
  const nextIndex = lineIndex + 1
  return nextIndex < scene.lines.length ? nextIndex : null
}

