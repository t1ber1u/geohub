import { FC } from 'react'
import { MapRankingsType } from '@types'
import { formatLargeNumber } from '@utils/helpers'

const MAX_POINTS = 25000
const AXIS_TICKS = [0, 5000, 10000, 15000, 20000, 25000]

type Props = {
  distribution: MapRankingsType['distribution']
  myPoints?: number
  isFirstAttempt: boolean
}

const playersLabel = (count: number) => `${count} ${count === 1 ? 'player' : 'players'}`

// Histogram of the ranked players' scores: gray bars, the viewer's bin highlighted and labelled
const ScoreDistribution: FC<Props> = ({ distribution, myPoints, isFirstAttempt }) => {
  const { binSize, counts, average } = distribution
  const maxCount = Math.max(...counts, 1)
  const myBin = typeof myPoints === 'number' ? Math.min(counts.length - 1, Math.floor(myPoints / binSize)) : -1
  const binRange = (idx: number) =>
    `${formatLargeNumber(idx * binSize)}–${formatLargeNumber(Math.min(MAX_POINTS, (idx + 1) * binSize - 1))}`

  return (
    <div className="distribution">
      <div className="distribution-header">
        <span className="section-title">Score distribution</span>
        <span className="distribution-caption">
          {`${isFirstAttempt ? "Each player's first game" : "Each player's best game"} · average ${formatLargeNumber(
            average
          )}`}
        </span>
      </div>

      <div className="histogram" aria-hidden="true">
        <div className="plot">
          {counts.map((count, idx) => (
            <div key={idx} className={`bin ${idx === myBin ? 'mine' : ''}`}>
              {count > 0 && <div className="bar" style={{ height: `${Math.max(6, (count / maxCount) * 100)}%` }} />}
              {idx === myBin && <span className="you-label">You</span>}
              <span className="bin-tooltip">
                <strong>{playersLabel(count)}</strong>
                {`${binRange(idx)} points`}
              </span>
            </div>
          ))}

          <div className="average-line" style={{ left: `${(average / MAX_POINTS) * 100}%` }}>
            <span>Avg</span>
          </div>
        </div>

        <div className="axis">
          {AXIS_TICKS.map((tick) => (
            <span key={tick} style={{ left: `${(tick / MAX_POINTS) * 100}%` }}>
              {tick === 0 ? '0' : `${tick / 1000}k`}
            </span>
          ))}
        </div>
      </div>

      {/* the same data for screen readers */}
      <table className="visually-hidden">
        <caption>Number of players per score range</caption>
        <tbody>
          {counts.map(
            (count, idx) =>
              count > 0 && (
                <tr key={idx}>
                  <th scope="row">{`${binRange(idx)} points${idx === myBin ? ' (your score)' : ''}`}</th>
                  <td>{playersLabel(count)}</td>
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ScoreDistribution
