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
    const pct = document.querySelectorAll('.data-used-per')[1].innerText

    return { plan, used, pct }
  })
  await browser.close()

  return data
}
;(() => {
  console.log('\n', chalk.yellow.inverse.underline('Fetching Your Cox Usage Data'), '\n')

  return openPage(config.url).then(data => {
    console.log(
      '\n',
      chalk.cyan(
        `You have used ${chalk.green(
          data.used
        )}GB of your monthly ${chalk.green(data.plan)}GB`
      ),
      '\n'
    )
    // make a percentage graph
    console.log(
      '\n',
      chalk.cyan(`That is ${chalk.green(data.pct)} of your allowance`)
    )
    console.log('\n')
  })
})()
