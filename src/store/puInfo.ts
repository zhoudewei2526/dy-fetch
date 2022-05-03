import { Browser } from "puppeteer";

let browser!: Browser
export const setBrowser = (b: Browser) => {
    browser = b
}
export const getBrowser = () => browser
export default browser