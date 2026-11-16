import { statuses, type StatusFilter } from '../../types'
import styles from './RunFilters.module.scss'
type Props = {
	query: string
	status: StatusFilter
	onQuery: (value: string) => void
	onStatus: (value: StatusFilter) => void
	counts: Record<StatusFilter, number>
}

export function RunFilters({ query, status, onQuery, onStatus, counts }: Props) {
	return (
		<div className={styles.filters}>
			<div className={styles.tabs}>
				{(['all', ...statuses] as const).map((value) => (
					<button
						key={value}
						className={status === value ? styles.activeTab : undefined}
						onClick={() => onStatus(value)}
					>
						{value[0].toUpperCase() + value.slice(1)}
						<span>{counts[value]}</span>
					</button>
				))}
			</div>
			<div className={styles.search}>
				<input
					type="search"
					placeholder="Search runs or repositories…"
					value={query}
					onChange={(event) => onQuery(event.target.value)}
				/>
			</div>
		</div>
	)
}
