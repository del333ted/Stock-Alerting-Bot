export function dailyConfig() {
  return [
    {
      $project: {
        _id: '$_id',
        time: {
          $divide: [
            {
              $subtract: [
                { $subtract: [new Date(), '$createdAt'] },
                {
                  $mod: [
                    { $subtract: [new Date(), '$createdAt'] },
                    24 * 60 * 60 * 1000,
                  ],
                },
              ],
            },
            24 * 60 * 60 * 1000,
          ],
        },
      },
    },
    {
      $group: { _id: '$time', count: { $sum: 1 } },
    },
    { $sort: { _id: -1 } },
  ]
}

export function fixAggregation(array: any) {
  const result = []
  let previousId = 0
  array.forEach(element => {
    const index = element._id
    if (previousId === index) {
      result.push(element)
    } else if (index - previousId === 1) {
      result.push(element)
    } else {
      const diff = index - previousId - 1
      for (let i = 0; i < diff; i++) {
        result.push({
          _id: previousId + i + 1,
          count: 0,
        })
      }
      result.push(element)
    }
    previousId = index
  })
  if (array[0]._id < 0) {
    const diff = 0 - array[0]._id
    array = array.forEach(v => (v += diff))
  }
  return result
}
