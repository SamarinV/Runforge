import type { KeyboardEvent } from 'react'
import type { Run } from '../../types'
import { formatDate, formatDuration } from '../../utils'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './RunList.module.scss'

type Props = {
	runs: Run[]
	onSelect: (run: Run) => void
}

export function RunList({ runs, onSelect }: Props) {
	function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, run: Run) {
		if (event.key !== 'Enter' && event.key !== ' ') return

		event.preventDefault()
		onSelect(run)
	}

	return (
		<div className={styles.tableWrap}>
			<table className={styles.table}>
				<thead>
					<tr>
						<th scope="col">Run / Repository</th>
						<th scope="col">Status</th>
						<th scope="col">
							Created <span className={styles.utc}>UTC</span>
						</th>
						<th scope="col">Duration</th>
					</tr>
				</thead>
				<tbody>
					{runs.map((run) => (
						<tr
							key={run.id}
							tabIndex={0}
							onClick={() => onSelect(run)}
							onKeyDown={(event) => handleRowKeyDown(event, run)}
						>
							<td>
								<div className={styles.runName}>{run.name}</div>
								<div className={styles.repo}>
									{run.repository} / <span className={styles.branch}>{run.branch}</span>
								</div>
							</td>
							<td>
								<StatusBadge status={run.status} />
							</td>
							<td className={styles.date}>
								<time dateTime={run.createdAt}>{formatDate(run.createdAt)}</time>
							</td>
							<td className={styles.duration}>{formatDuration(run.durationSeconds)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
