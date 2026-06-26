export const AUTHORING_WORKBENCH_HASH = '#authoring-workbench'
export const AUTHORING_WORKBENCH_QUERY_KEY = 'authoring'
export const AUTHORING_WORKBENCH_QUERY_VALUE = 'workbench'

export interface WorkbenchLocationLike {
  readonly hash?: string
  readonly search?: string
}

export function shouldShowAuthoringWorkbench(location: WorkbenchLocationLike): boolean {
  if (location.hash === AUTHORING_WORKBENCH_HASH) return true

  const search = location.search?.startsWith('?') ? location.search.slice(1) : (location.search ?? '')
  const params = new URLSearchParams(search)

  return params.get(AUTHORING_WORKBENCH_QUERY_KEY) === AUTHORING_WORKBENCH_QUERY_VALUE
}
