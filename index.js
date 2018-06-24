const puppeteer = require('puppeteer')
const chalk = require('chalk')

const config = require('./config')

const openPage = async url => {
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
    const plan = document.querySelector('.plan-gb').innerText
    const used = document.querySelectorAll('.data-used')[1].innerText

    return { plan, used }
  })
  await browser.close()

  return data
}
;(() => {
  console.log(
    chalk.white.underline('Fetching your cox usage data')
  )
  console.log('')
  return openPage(config.url).then(data => {
    const total = data.plan.match(/\d/g).join('')
    const usage = data.used.match(/\d/g).join('')
    console.log(
      chalk.yellow(
        `You have used ${chalk.green(usage)}gb of you monthly ${chalk.green(
          total
        )}gb`
      )
    )
    console.log('')
  })
})()
