import type { CellKind, PlayerMark, PuzzleDefinition, Tool } from '../domain/types'

export const cellLabels: Readonly<Record<CellKind, string>> = {
  empty: '空地',
  bottle: '酒瓶',
  bin: '垃圾桶',
  mirror: '镜子',
  guest: '访客',
}

export const toolLabels: Readonly<Record<Tool, string>> = {
  inspect: '调查',
  guest: '标访客',
  safe: '标安全',
}

export const markLabels: Readonly<Record<PlayerMark, string>> = {
  guest: '访客',
  safe: '安全',
}

export const case004 = {
  schemaVersion: 1,
  id: 'case-004',
  title: '客房 04：清扫记录',
  caseName: '案卷 04 · 客房清扫记录',
  board: { width: 4, height: 4 },
  allowedKinds: ['empty', 'bottle', 'bin', 'mirror', 'guest'],
  rules: [
    {
      id: 'R1',
      type: 'globalCount',
      target: 'bin',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: '清扫容器',
        flavor: '房间中恰有 1 个垃圾桶。',
      },
    },
    {
      id: 'R2',
      type: 'globalCount',
      target: 'guest',
      count: { op: 'eq', value: 2 },
      presentation: {
        title: '未登记住客',
        flavor: '房间中恰有 2 名访客。',
      },
    },
    {
      id: 'R3',
      type: 'forEachCount',
      subject: 'bottle',
      scope: { kind: 'orthogonal' },
      target: 'bin',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: '酒瓶清扫',
        flavor: '每个酒瓶的正交邻域中，恰好有 1 个垃圾桶。',
      },
    },
    {
      id: 'R4',
      type: 'forEachCount',
      subject: 'bin',
      scope: { kind: 'adjacent' },
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: {
        title: '清扫安全区',
        flavor: '每个垃圾桶的邻接域中，没有访客。',
      },
    },
    {
      id: 'R5',
      type: 'forEachCount',
      subject: 'mirror',
      scope: { kind: 'adjacent' },
      target: 'guest',
      count: { op: 'eq', value: 1 },
      presentation: {
        title: '镜面登记',
        flavor: '每面镜子的邻接域中，恰好有 1 名访客。',
      },
    },
    {
      id: 'R6',
      type: 'forEachCount',
      subject: 'bottle',
      scope: { kind: 'orthogonal' },
      target: 'guest',
      count: { op: 'eq', value: 0 },
      presentation: {
        title: '酒瓶禁区',
        flavor: '每个酒瓶的正交邻域中，没有访客。',
      },
    },
  ],
  initialReveals: ['B1', 'A2', 'C2'],
  target: {
    A1: 'empty',
    B1: 'bottle',
    C1: 'mirror',
    D1: 'guest',
    A2: 'bottle',
    B2: 'bin',
    C2: 'bottle',
    D2: 'empty',
    A3: 'mirror',
    B3: 'empty',
    C3: 'mirror',
    D3: 'empty',
    A4: 'empty',
    B4: 'guest',
    C4: 'empty',
    D4: 'empty',
  },
  metadata: {
    difficulty: 2,
    tags: ['intersection', 'local-count', 'tutorial-candidate'],
    status: 'draft',
  },
} as const satisfies PuzzleDefinition

