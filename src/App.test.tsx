import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { runs } from './data/runs'
import { fetchRuns } from './services/runs'

vi.mock('./services/runs', () => ({ fetchRuns: vi.fn() }))

const mockFetchRuns = vi.mocked(fetchRuns)

beforeEach(() => {
	mockFetchRuns.mockReset().mockResolvedValue(runs)
})

afterEach(() => {
	cleanup()
	window.history.replaceState(null, '', '/')
})

function runRow(name: RegExp) {
	return screen.getByRole('row', { name })
}

async function openRuns() {
	const user = userEvent.setup()
	render(<App />)
	await screen.findByRole('table')
	return user
}

describe('Run filters', () => {
	it('shows matching statuses and restores the list with All', async () => {
		const user = await openRuns()

		await user.click(screen.getByRole('button', { name: /^Failed\b/ }))
		expect(runRow(/Add dashboard analytics/)).toBeVisible()
		expect(screen.queryByRole('row', { name: /Fix checkout edge cases/ })).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /^All\b/ }))
		expect(runRow(/Fix checkout edge cases/)).toBeVisible()
	})

	it('combines repository search with status and resets an empty result', async () => {
		const user = await openRuns()
		const search = screen.getByRole('searchbox')

		await user.type(search, ' WEB-PLATFORM ')
		expect(runRow(/Refactor authentication flow/)).toBeVisible()
		expect(runRow(/Add dashboard analytics/)).toBeVisible()
		expect(screen.queryByRole('row', { name: /Fix checkout edge cases/ })).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /^Running\b/ }))
		expect(runRow(/Refactor authentication flow/)).toBeVisible()
		expect(screen.queryByRole('row', { name: /Add dashboard analytics/ })).not.toBeInTheDocument()

		await user.clear(search)
		await user.type(search, 'checkout')
		expect(screen.getByRole('heading', { name: 'No runs found' })).toBeVisible()

		await user.click(screen.getByRole('button', { name: 'Reset filters' }))
		expect(search).toHaveValue('')
		expect(runRow(/Fix checkout edge cases/)).toBeVisible()
		expect(runRow(/Add dashboard analytics/)).toBeVisible()
	})

	it('restores search and status from the URL and preserves unrelated parameters on reset', async () => {
		window.history.replaceState(null, '', '/?q=checkout&status=failed&source=demo')
		const user = userEvent.setup()
		render(<App />)

		expect(await screen.findByRole('heading', { name: 'No runs found' })).toBeVisible()
		expect(screen.getByRole('searchbox')).toHaveValue('checkout')

		await user.click(screen.getByRole('button', { name: /^Succeeded\b/ }))
		expect(runRow(/Fix checkout edge cases/)).toBeVisible()
		expect(
			screen.queryByRole('row', { name: /Improve keyboard navigation/ }),
		).not.toBeInTheDocument()
		expect(new URLSearchParams(window.location.search).get('status')).toBe('succeeded')

		const search = screen.getByRole('searchbox')
		await user.clear(search)
		await user.type(search, 'no matching run')
		expect(new URLSearchParams(window.location.search).get('q')).toBe('no matching run')

		await user.click(screen.getByRole('button', { name: 'Reset filters' }))
		expect(window.location.search).toBe('?source=demo')
	})
})

it('sorts newest first or longest first, with unknown durations last', async () => {
	const user = await openRuns()
	const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)

	expect(rows()[0]).toHaveTextContent('Refactor authentication flow')

	const sort = screen.getByRole('combobox', { name: 'Sort by' })
	await user.selectOptions(sort, 'duration')
	expect(rows()[0]).toHaveTextContent('Improve keyboard navigation')
	expect(
		rows()
			.slice(-3)
			.map((row) => within(row).getAllByRole('cell')[0].textContent),
	).toEqual([
		expect.stringContaining('Generate API documentation'),
		expect.stringContaining('Update project dependencies'),
		expect.stringContaining('Optimize image delivery'),
	])

	await user.selectOptions(sort, 'date')
	expect(rows()[0]).toHaveTextContent('Refactor authentication flow')
})

describe('Run details', () => {
	it('opens details from a status cell and preserves the filter after closing', async () => {
		const user = await openRuns()
		await user.click(screen.getByRole('button', { name: /^Succeeded\b/ }))

		await user.click(
			within(runRow(/Fix checkout edge cases/)).getByRole('cell', { name: 'Succeeded' }),
		)
		const details = within(screen.getByRole('article'))
		expect(details.getByRole('heading', { name: 'Fix checkout edge cases' })).toBeVisible()
		expect(details.getByText(/All 24 tests passed/)).toBeVisible()
		expect(details.getByText(/Fixed checkout validation/)).toBeVisible()

		await user.click(details.getByRole('button', { name: '\u00d7' }))
		expect(screen.queryByRole('article')).not.toBeInTheDocument()
		expect(runRow(/Fix checkout edge cases/)).toBeVisible()
		expect(screen.queryByRole('row', { name: /Add dashboard analytics/ })).not.toBeInTheDocument()
	})

	it('closes on the overlay while clicks inside keep the details open', async () => {
		const user = await openRuns()
		await user.click(runRow(/Fix checkout edge cases/))
		const details = screen.getByRole('article')

		await user.click(within(details).getByRole('heading', { name: 'Execution logs' }))
		expect(details).toBeVisible()
		await user.click(screen.getByTestId('run-details-overlay'))
		expect(screen.queryByRole('article')).not.toBeInTheDocument()
	})

	it('opens with Enter, shows missing optional values and closes with Escape', async () => {
		const user = await openRuns()
		runRow(/Update project dependencies/).focus()

		await user.keyboard('{Enter}')
		const details = within(screen.getByRole('article'))
		expect(details.getByText('No result available for this run.')).toBeVisible()
		expect(details.getByText('\u2014')).toBeVisible()

		await user.keyboard('{Escape}')
		expect(screen.queryByRole('article')).not.toBeInTheDocument()
	})
})

it('shows loading, reports a failed request and restores the list on retry', async () => {
	mockFetchRuns.mockRejectedValueOnce(new Error('Temporary connection error'))
	const user = userEvent.setup()
	render(<App />)

	expect(screen.getByRole('heading', { name: 'Loading your runs' })).toBeVisible()
	expect(await screen.findByText('Temporary connection error')).toBeVisible()

	await user.click(screen.getByRole('button', { name: 'Try again' }))
	expect(await screen.findByRole('table')).toBeVisible()
	expect(screen.queryByText('Temporary connection error')).not.toBeInTheDocument()
})
