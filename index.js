const puppeteer = require('puppeteer')
const path = require('path')
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

  await page.screenshot({ path: 'example.png' })

  const data = await page.evaluate(() => {
    const plan = document.querySelector('.plan-gb').innerText
    const used = document.querySelector('.data-used').innerText

    return { plan, used }
  })
  await browser.close()

  return data
}

;(() => {
  console.log('Fetching your cox usage data')
  return openPage(config.url).then(console.log)
})()
