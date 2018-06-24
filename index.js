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
    // these selectors are delicate and likely to break
    const plan = document
      .querySelector('.plan-gb')
      .innerText.match(/\d/g)
      .join('')
    const used = document
      .querySelectorAll('.data-used')[1]
      .innerText.match(/\d/g)
      .join('')

    return { plan, used }
  })
  await browser.close()

  return data
}
;(() => {
  console.log(chalk.white.underline('Fetching your cox usage data'))
  console.log('')
  
  return openPage(config.url).then(data => {
    console.log(
      chalk.yellow(
        `You have used ${chalk.green(
          data.used
        )}gb of your monthly ${chalk.green(data.plan)}gb`
      )
    )
    console.log('')
  })
})()
