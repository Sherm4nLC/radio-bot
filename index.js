const puppeteer = require('puppeteer')
const fs = require('fs')
const https = require('https')

const download =  async function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
}

async function main() {
    try {
        //body
        console.log("Launching")
        const browser = await puppeteer.launch({headless:false})
        const page = await browser.newPage()
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36')
        const keyboard = await page.keyboard
        page.setViewport({width:1920, height:1080})
        

        // await page.goto('https://radiocut.fm/radiostation/city/listen/', {timeout:60000})
        // await page.waitForSelector('i[class="fa fa-4x fa-play"]')
        // //await page.$eval('i[class="fa fa-4x fa-play"]', i => i.click())
        // await page.click('i[class="fa fa-4x fa-play"]', {delay:1000})


        // page.setRequestInterception(true)
        // page.on('request', request => {
        //         console.log(request.url())
        //         console.log(request.resourceType())
        // })



        // const http = require('http');
        // const fs = require('fs');

        // const file = fs.createWriteStream("file.jpg");
        // const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
        // response.pipe(file);
        // })

        // instructions
        await page.goto("https://radiocut.fm/radiostation/city/listen/")
        await page.waitForSelector('button[class="btn btn-default play fa"]')
        const btn = await page.$('button[class="btn btn-default play fa"]')
        await page.evaluate(btn => btn.click(), btn)
        await page.click('#play_mobile')

        page.on('request', request => {

                let fileExtension = request.url().slice(-3, request.url().length)
                if (fileExtension === 'mp3') {

                  let url = request.url()
                  let ts = new Date().toISOString().replace(/:/g,"_")
                  let filename = `${ts}_cut.mp3`
                  
                  console.log("MP3 FOUND!")
                  console.log(`This is the URL: ${url}`)
                  console.log(`This is the filename: ${filename}`)
                  console.log(`This is the resource type: ${request.resourceType()}`)
                  
                  download(request.url(), filename, console.log("Downloaded."))


                    // let ts = new Date().toISOString().replace(":","_")
                    // let file = fs.createWriteStream(`${ts}_cut.mp3`)
                    // https.get(url, function(response) {
                    // response.pipe(file)
                    //})
                }
        })

        
        // await page.goto('https://radiocut.fm/search/?type=cut&created=1&sort=-created')
        // //await page.waitForSelector('.list-unstyled search_results')
        // //await page.waitForNavigation()
        // const aTags = await page.$$('.list-unstyled.search_results > li.row > div.col-sm-10.col-xs-8 > div.row > div.col-sm-12 > a')
        // const aTagsArray = new Array
        // for (let i = 0; i < aTags.length; i++) {
        //     let aTag = aTags[i]
        //     let href = await page.evaluate(aTag => aTag.href, aTag)
        //     aTagsArray.push(href)
        // }

        // const tempPage = await browser.newPage()
        // await tempPage.goto(aTagsArray[0])
        // await tempPage.waitForSelector('a[class="btn btn-default download"]')
        // const downloadBtn = await tempPage.$('a[class="btn btn-default download"]')
        // await tempPage.evaluate(btn => btn.click(), downloadBtn)

        //await page.goto('https://radioarg.com/#fm-89-9')
        //await page.goto('https://www.radioconvos.com.ar', {timeout:60000})


        // await page.waitForSelector('li[class="boton-play"] > a.notMargin > div.content-img > img')
        // await page.$eval('li[class="boton-play"] > a.notMargin > div.content-img > img', btn => btn.click())


    }
    catch(error) {
        console.log(error)
    }
}
main()



// download('https://cdn-gs-rg.radiocut.com.ar/city/156/423/1564236113.11-120.0.mp3', 'test.mp3',
// console.log("Done."))