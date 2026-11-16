import { useRunFilters } from '../../hooks/useRunFilters'
import type { useRuns } from '../../hooks/useRuns'
import type { Run } from '../../types'
import { RunFilters } from '../RunFilters/RunFilters'
import { RunList } from '../RunList/RunList'
import styles from './RunsSection.module.scss'

type Props = ReturnType<typeof useRuns> & { onSelect: (run: Run) => void }

type ResultsProps = Pick<Props, 'state' | 'retry' | 'onSelect'> & {
	runs: Run[]
	onReset: () => void
}

export function RunsSection({ state, runs, statusCounts, retry, onSelect }: Props) {
	const { filters, setQuery, setStatus, resetFilters, filteredRuns, sort, setSort } =
		useRunFilters(runs)

	return (
		<section>
			<header className={styles.header}>
				<h1 className={styles.title}>Runs</h1>
				<label className={styles.sort}>
					Sort by
					<select
						value={sort}
						onChange={(event) => setSort(event.target.value === 'duration' ? 'duration' : 'date')}
					>
						<option value="date">Newest first</option>
						<option value="duration">Longest first</option>
					</select>
				</label>
			</header>
			<RunFilters {...filters} counts={statusCounts} onQuery={setQuery} onStatus={setStatus} />
			<RunResults
				state={state}
				runs={filteredRuns}
				retry={retry}
				onReset={resetFilters}
				onSelect={onSelect}
			/>
		</section>
	)
}

function RunResults({ state, runs, retry, onReset, onSelect }: ResultsProps) {
	if (state.status === 'loading') {
		return (
			<div className={styles.state}>
				<span className={styles.spinner} />
				<h2>Loading your runs</h2>
			</div>
		)
	}

	if (state.status === 'error') {
		return (
			<div className={styles.state}>
				<h2>Unable to load runs</h2>
				<p>{state.message}</p>
				<button className={styles.primaryButton} onClick={retry}>
					Try again
				</button>
			</div>
		)
	}

	if (runs.length === 0) {
		return (
			<div className={styles.state}>
				<h2>No runs found</h2>
				<p>Try a different search or clear your filters.</p>
				<button className={styles.primaryButton} onClick={onReset}>
					Reset filters
				</button>
			</div>
		)
	}

	return <RunList runs={runs} onSelect={onSelect} />
}
