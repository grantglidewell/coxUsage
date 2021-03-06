#!/usr/bin/env node

const puppeteer = require('puppeteer')
const chalk = require('chalk')

const config = require('./config')

const pullTheStrings = async url => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  await page.click('#username')
  await page.keyboard.type(config.userName)
  await page.click('#password')
  await page.keyboard.type(config.pass)
  await page.click('#consolidated-signin > div:nth-child(11) > input')
  await page.waitForNavigation()

  const data = await page.evaluate(() => {
    // these selectors are delicate and likely to break
    const plan = document
      .querySelector('.plan-gb')
      .innerText.match(/\d/g)
      .join('')
    const used = document
      .querySelectorAll('.data-used')[1]
      .innerText.match(/\d/g)
      .join('')
    const pct = document.querySelectorAll('.data-used-per')[1].innerText
    const last = document.querySelectorAll('.last-data-refreshed')[1].innerText
    const period = document.querySelectorAll('.usage-period-desktop')[1]
      .innerText

    return { plan, used, pct, last, period }
  })
  await browser.close()

  return data
}
const makeGraph = pct => {
  const graph = Array(33)
    .fill('-')
    .map((el, i) => {
      if (i * 3 < parseInt(pct)) {
        return '='
      }
      return '-'
    })
  graph.splice(graph.indexOf('-'), 1, `[${pct}]`)
  return graph.join('')
}
;(() => {
  if (!config.pass || !config.userName || !config.url) {
    return console.log(
      chalk.red('Cannot fetch your data, there was a problem with your config')
    )
  }
  console.log('\n', chalk.yellow.inverse('Fetching Your Cox Usage Data'))

  return pullTheStrings(config.url).then(data => {
    console.log(
      '\n',
      chalk.cyan(
        `You have used ${chalk.green(
          data.used
        )} GB of your monthly ${chalk.green(data.plan)} GB as of ${data.last}`
      )
    )
    console.log(
      '\n',
      chalk.yellow(
        `${chalk.green(data.period.split('-')[0])}(${makeGraph(
          data.pct
        )})${chalk.green(data.period.split('-')[1])}`
      ),
      '\n'
    )
  })
})()
