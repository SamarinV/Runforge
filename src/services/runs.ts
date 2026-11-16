import { runs } from '../data/runs'
import type { Run } from '../types'
let demoErrorPending = new URLSearchParams(window.location.search).get('demoError') === '1'
export async function fetchRuns(): Promise<Run[]> {
	await new Promise<void>((resolve) => window.setTimeout(resolve, 650))
	if (demoErrorPending) {
		demoErrorPending = false
		throw new Error('The workspace could not be reached. Please try again.')
	}
	return runs.map((run) => ({
		...run,
		logs: [...run.logs],
	}))
}
