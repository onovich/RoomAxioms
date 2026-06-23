import type { CellKind } from '@room-axioms/domain'

interface ObjectIconProps {
  readonly kind: CellKind
}

export function ObjectIcon({ kind }: ObjectIconProps) {
  if (kind === 'bottle') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M20 5h8v8l4 5v22a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V18l4-5V5Z" />
        <path d="M20 10h8M16 25h16" />
      </svg>
    )
  }

  if (kind === 'bin') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 16h20l-2 27H16l-2-27Z" />
        <path d="M11 13h26M19 13V8h10v5M21 21v15M27 21v15" />
      </svg>
    )
  }

  if (kind === 'mirror') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="11" y="5" width="26" height="34" rx="12" />
        <path d="M24 39v5M17 44h14M17 14c3-4 8-5 12-3" />
      </svg>
    )
  }

  if (kind === 'guest') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="15" r="8" />
        <path d="M10 43c1-10 6-16 14-16s13 6 14 16M17 13h.1M31 13h.1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="3" />
      <path d="M14 24h5M29 24h5" />
    </svg>
  )
}
