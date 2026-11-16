import { useState } from 'react'
import styles from './App.module.scss'
import { RunDetails } from './components/RunDetails/RunDetails'
import { RunsSection } from './components/RunsSection/RunsSection'
import { useRuns } from './hooks/useRuns'
import type { Run } from './types'

export function App() {
	const runs = useRuns()
	const [selected, setSelected] = useState<Run | null>(null)

	return (
		<main className={styles.main}>
			<div inert={selected !== null}>
				<RunsSection {...runs} onSelect={setSelected} />
			</div>
			{selected && <RunDetails run={selected} onClose={() => setSelected(null)} />}
		</main>
	)
}
