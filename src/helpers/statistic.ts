import moment = require('moment')


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
      $group: { _id: '$time', count: { $sum: 1 }  },
    },
    { $sort: { _id: -1 } },
  ]
}

export function fixAggregation(array: any) {
  const result = []
  let previousId = 0
  if (!array.length) {
      return []
  }
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

export function statisticChart(array: any) {
    const max = Math.max.apply(Math, array.map(function(o) { return o.count; }))
    let text = ''
    let chart = '◆'
    let whitespace = '  '
    if (!array.length) {
        return 'No data provided'
    }
    else {
        array = array.reverse().slice(array.length - 5)
        let maxlength = 0

        array.forEach((v) => {
            const day = daysAgo(v._id)
            let check = `${day} (${v.count}): `.length
            if (check > maxlength) {
                maxlength = check
            }
        })
        const result = []
        array.forEach((v) => {
            const n = Math.round(v.count / max * 10)
            const day = daysAgo(v._id)
            let subtext = `${day} (${v.count}): `

            if (text.length === maxlength) {
                subtext = subtext + `${chart.repeat(n)}\n`
            } else {
                subtext = subtext + `${whitespace.repeat(Math.round(maxlength - subtext.length))}${chart.repeat(n)}\n`
            }
            result.push(subtext)
        })
        
        if (!result.length) {
            return 'No data provided'
        }

        result.forEach(v => {
            text = text + v
        })
        return text
    }
}

export function daysAgo(numberOfDays: number) {
    const d = new Date()
    d.setDate(d.getDate() - numberOfDays)
    return moment(d).format('DD.MM')
  }