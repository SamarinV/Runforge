import { useEffect, useRef, useState } from 'react'
import { fetchRuns } from '../services/runs'
import type { Run, StatusFilter } from '../types'

type LoadState =
	| {
			status: 'loading'
	  }
	| {
			status: 'error'
			message: string
	  }
	| {
			status: 'success'
			runs: Run[]
	  }

export function useRuns() {
	const [state, setState] = useState<LoadState>({ status: 'loading' })
	const [attempt, setAttempt] = useState(0)
	const request = useRef<Promise<Run[]> | null>(null)

	useEffect(() => {
		let active = true
		request.current ??= fetchRuns()
		void request.current.then(
			(runs) => {
				if (active)
					setState({
						status: 'success',
						runs,
					})
			},
			(error: unknown) => {
				if (active)
					setState({
						status: 'error',
						message: error instanceof Error ? error.message : 'Could not load runs.',
					})
			},
		)
		return () => {
			active = false
		}
	}, [attempt])

	function retry() {
		request.current = null
		setState({ status: 'loading' })
		setAttempt((value) => value + 1)
	}

	const runs = state.status === 'success' ? state.runs : []
	const statusCounts = runs.reduce<Record<StatusFilter, number>>(
		(acc, run) => {
			acc[run.status]++
			acc.all++
			return acc
		},
		{
			all: 0,
			queued: 0,
			running: 0,
			succeeded: 0,
			failed: 0,
		},
	)
	return { state, runs, statusCounts, retry }
}
