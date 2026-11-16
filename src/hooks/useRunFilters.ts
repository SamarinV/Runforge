import { useEffect, useState } from 'react'
import { statuses, type Run, type StatusFilter } from '../types'
import { filterRuns } from '../utils'

type Filters = { query: string; status: StatusFilter }
type Sort = 'date' | 'duration'

function readFilters(): Filters {
	const params = new URLSearchParams(window.location.search)
	return {
		query: params.get('q') ?? '',
		status: statuses.find((status) => status === params.get('status')) ?? 'all',
	}
}

export function useRunFilters(runs: Run[]) {
	const [filters, setFilters] = useState(readFilters)
	const [sort, setSort] = useState<Sort>('date')

	useEffect(() => {
		const syncFilters = () => setFilters(readFilters())
		window.addEventListener('popstate', syncFilters)
		return () => window.removeEventListener('popstate', syncFilters)
	}, [])

	const filteredRuns = filterRuns(runs, filters.query, filters.status).sort((a, b) => {
		const byDate = Date.parse(b.createdAt) - Date.parse(a.createdAt)
		if (sort === 'date') return byDate

		const byDuration = (b.durationSeconds ?? -1) - (a.durationSeconds ?? -1)
		return byDuration || byDate
	})

	function updateFilters(next: Filters) {
		const url = new URL(window.location.href)
		if (next.query) url.searchParams.set('q', next.query)
		else url.searchParams.delete('q')
		if (next.status !== 'all') url.searchParams.set('status', next.status)
		else url.searchParams.delete('status')
		window.history.replaceState(window.history.state, '', url)
		setFilters(next)
	}

	function setQuery(query: string) {
		updateFilters({ ...filters, query })
	}

	function setStatus(status: StatusFilter) {
		updateFilters({ ...filters, status })
	}

	function resetFilters() {
		updateFilters({ query: '', status: 'all' })
	}

	return { filters, setQuery, setStatus, resetFilters, filteredRuns, sort, setSort }
}
