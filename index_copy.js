const puppeteer = require('puppeteer')
const fs = require('fs')
const child_process = require('child_process')
let date = new Date()
date = date.toISOString()
date = date.slice(0,19).replace('T', ' ')

console.log("Some Radio Stuff")

class RadioBot {
    constructor(){
        this.date = date
        this.name = "I'm radio bot"
    }

    testFoo(something) {
        console.log(something)
        console.log(date)
        return 1
    }

    // main function listening to media
    listen(url) {
        try {
            const browser = await puppeteer.launch({args: ['--no-sandbox']})
            const page = await browser.newPage()
            const keyboard = await page.keyboard

            await page.goto(url)


        }
        catch(e) {
           console.log(e)
	        process.exit()
        }
    }



}

const rb = new RadioBot()
let val = rb.testFoo("magallanes")
console.log(val)