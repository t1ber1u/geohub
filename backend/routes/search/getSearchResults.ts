import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getQueryLimit } from '@backend/utils'

// Word-prefix search that works on any MongoDB (Atlas Search `$search` isn't available self-hosted).
// Matches names where any word starts with the query, like Atlas autocomplete did; names that start
// with the query rank first, then shorter names.

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const searchStages = (query: string, limit: number, extraMatch: object, project: object) => {
  const escaped = escapeRegex(query)

  return [
    { $match: { name: { $regex: `(^|\\s)${escaped}`, $options: 'i' }, ...extraMatch } },
    {
      $addFields: {
        score: { $cond: [{ $regexMatch: { input: '$name', regex: `^${escaped}`, options: 'i' } }, 2, 1] },
        nameLength: { $strLenCP: '$name' },
      },
    },
    { $sort: { score: -1, nameLength: 1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 1, ...project, score: 1 } },
  ]
}

const getSearchResults = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = ((req.query.q as string) || '').trim().slice(0, 100)
  const limit = getQueryLimit(req.query.count as string, 3)

  if (!query) {
    return res.status(200).send({ all: [], users: [], maps: [] })
  }

  const userResults = await collections.users
    ?.aggregate(searchStages(query, limit, {}, { name: 1, avatar: 1 }))
    .toArray()

  const mapResults = await collections.maps
    ?.aggregate(
      searchStages(query, limit, { isPublished: true, isDeleted: { $exists: false } }, { name: 1, previewImg: 1 })
    )
    .toArray()

  const users = userResults || []
  const maps = mapResults || []

  const all = [...users, ...maps]
  all.sort((a, b) => b?.score - a?.score)

  res.status(200).send({ all, users, maps })
}

export default getSearchResults
