import type { RunStatus } from '../../types'
import styles from './StatusBadge.module.scss'

export function StatusBadge({ status }: { status: RunStatus }) {
	return (
		<span className={`${styles.badge} ${styles[status]}`}>
			{status[0].toUpperCase() + status.slice(1)}
		</span>
	)
}
