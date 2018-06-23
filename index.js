const puppeteer = require('puppeteer')
const path = require('path')
const credentials = require('credentials')

const openPage = async url => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  // login using credentials
  // wait for page to redirect
  // scrape data
  await browser.close()
}

const scrapeData = async selector => {
  // scrape the data using the selector and return it
}

