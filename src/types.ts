export const statuses = ['queued', 'running', 'succeeded', 'failed'] as const
export type RunStatus = (typeof statuses)[number]
export type StatusFilter = RunStatus | 'all'
export type Run = {
	id: string
	name: string
	repository: string
	branch: string
	status: RunStatus
	createdAt: string
	durationSeconds?: number
	logs: string[]
	result?: string
}
