import type { Run, StatusFilter } from './types'

export function filterRuns(runs: Run[], query: string, status: StatusFilter) {
	const search = query.trim().toLocaleLowerCase()
	return runs.filter(
		(run) =>
			(status === 'all' || run.status === status) &&
			`${run.name}\n${run.repository}`.toLocaleLowerCase().includes(search),
	)
}
export function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC',
	}).format(new Date(value))
}
export function formatDuration(seconds?: number) {
	if (seconds === undefined) return '—'
	return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}
