const puppeteer = require('puppeteer')
const fs = require('fs')
const child_process = require('child_process')
const https = require('https')
const bunyan = require('bunyan');
const {LoggingBunyan} = require('@google-cloud/logging-bunyan');


let date = new Date()
date = date.toISOString()
date = date.slice(0,19).replace('T', ' ')
const PRIVATE_KEY = 'glc-01-b24bd302c74d.json'


class RadioBot {
    constructor(){
        console.log("Instanciating.")
        this.date = date
        this.name = "I'm radio bot"
        this.storageLocation = "gs://glc-01/radio-bot-exports/"
        this.processedUrls = []
        this.storageFiles = ''
    }

    // Simple function for our downloads
    async download(url, dest, cb) {
        var file = fs.createWriteStream(dest);
        var request = https.get(url, function(response) {
          response.pipe(file);
          file.on('finish', function() {
            file.close(cb);
          });
        });
      }

    async uploadToStorage(filename) {
      const cmd = 'gsutil cp '+filename+" "+this.storageLocation+filename
      await child_process.exec(cmd, (err, stdout, stderr) => {
          if (err) {console.log(err)}
          console.log(stdout)
          console.log(`Uploaded to storage: ${filename}`)
      })
    }

    createLogger() {
      // Creates a Bunyan Stackdriver Logging client
      const loggingBunyan = new LoggingBunyan();

      // Create a Bunyan logger that streams to Stackdriver Logging
      // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
      const logger = bunyan.createLogger({
        // The JSON payload of the log as it appears in Stackdriver Logging
        // will contain "name": "my-service"
        name: 'radio-bot',
        streams: [
          // Log to the console at 'info' and above
          {stream: process.stdout, level: 'info'},
          // And log to Stackdriver Logging, logging at 'info' and above
          loggingBunyan.stream('info'),
        ],
      });

      this.logger = logger
    }

    checkBucketFiles() {
      // download file list from g storage
      const cmd = 'gsutil ls '+this.storageLocation+'* > check_radio_exports.txt'
      // child_process.exec(cmd, (err, stdout, stderr) => {
      //     if (err) {console.log(err)}
      //     console.log(stdout)
      // })
      child_process.execSync(cmd)

      // read file, parse and assign to class property
      let fileList  = fs.readFileSync("check_radio_exports.txt").toString();
      fileList = fileList.split("\n")
      fileList = fileList.map(s => s.replace("\r","").replace(this.storageLocation, ""))
      fileList = fileList.filter(s => s !== "")
      this.storageFiles = fileList
      console.log("Current files on storage: ", fileList)
    }

    // Main function listening to media
    async listen(url, timeout = 10) {
        try {
            // Prepare
            console.log("Launching")
            const browser = await puppeteer.launch({headless:true})
            const page = await browser.newPage()
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36')
            const keyboard = await page.keyboard
            page.setViewport({width:1920, height:1080})

            // SetTimeout
            setTimeout(timeout => browser.close(), timeout*60*1000)

            // Instructions
            await page.goto(url)
            await page.waitForSelector('button[class="btn btn-default play fa"]')
            const btn = await page.$('button[class="btn btn-default play fa"]')
            await page.evaluate(btn => btn.click(), btn)
            await page.click('#play_mobile')

            page.on('request', request => {

                let fileExtension = request.url().slice(-3, request.url().length)
                if (this.processedUrls.includes(request.url())) {console.log("Resource Already Processed.")}
                if (this.storageFiles.includes(request.url())) {console.log("Resource Already in Storage.")}
                if (fileExtension === 'mp3'
                && ! this.processedUrls.includes(request.url())
                && ! this.storageFiles.includes(request.url())
                ) {

                  let url = request.url()
                  let ts = new Date().toISOString().replace(/:/g,"_")
                  let filename = url.replace(/\/|:/g,"_")
                  //let filename = `${ts}_cut.mp3`
                  
                  console.log("MP3 FOUND!")
                  console.log(`This is the URL: ${url}`)
                  console.log(`This is the filename: ${filename}`)
                  console.log(`This is the resource type: ${request.resourceType()}`)
                  
                  this.download(request.url(), filename, console.log("Downloaded."))
                  this.uploadToStorage(filename)

                  this.processedUrls.push(url)
                }
            })
        }
        catch(e) {
           console.log(e.toString())
           //cmd = `echo \"${e.toString()}\" > error.txt`
           //child_process.execSync(cmd)
	         process.exit()
        }
    }
}

const rb = new RadioBot()
//rb.listen("https://radiocut.fm/radiostation/city/listen/")
//rb.listen("https://radiocut.fm/radiostation/cnn-argentina/listen/")
//rb.listen("http://radiocut.fm/audiocut/macri-gato/")

rb.checkBucketFiles()
rb.listen("https://radiocut.fm/radiostation/city/listen/")
setInterval(x => rb.listen("https://radiocut.fm/radiostation/city/listen/"), 10*60*1000)

// rb.checkBucketFiles()
// rb.listen("https://radiocut.fm/radiostation/city/listen/")

//rb.createLogger()
//rb.logger.info("some status")