import type { Run } from '../../types'
import { formatDate, formatDuration } from '../../utils'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './RunDetails.module.scss'

export function RunDetails({ run, onClose }: { run: Run; onClose: () => void }) {
	return (
		<div className={styles.modal}>
			<div className={styles.overlay} onClick={onClose} data-testid="run-details-overlay" />
			<article
				className={styles.details}
				onKeyDown={(event) => {
					if (event.key === 'Escape') onClose()
					if (event.key === 'Tab') event.preventDefault()
				}}
			>
				<header className={styles.header}>
					<div>
						<StatusBadge status={run.status} />
						<h2 className={styles.title}>{run.name}</h2>
					</div>
					<button type="button" className={styles.closeButton} onClick={onClose} autoFocus>
						×
					</button>
				</header>
				<dl className={styles.metadata}>
					<div>
						<dt>Repository</dt>
						<dd>{run.repository}</dd>
					</div>
					<div>
						<dt>Branch</dt>
						<dd>{run.branch}</dd>
					</div>
					<div>
						<dt>Created (UTC)</dt>
						<dd>{formatDate(run.createdAt)}</dd>
					</div>
					<div>
						<dt>Duration</dt>
						<dd>{formatDuration(run.durationSeconds)}</dd>
					</div>
				</dl>
				<h3>Execution logs</h3>
				<pre className={styles.logs}>
					{run.logs.length ? run.logs.join('\n') : 'No logs available yet.'}
				</pre>
				<h3>Result</h3>
				<p className={styles.result}>{run.result ?? 'No result available for this run.'}</p>
			</article>
		</div>
	)
}
