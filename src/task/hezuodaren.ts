import * as puppeteer from "puppeteer";
import { getCsv, writeCsv, writeExcel } from "../util/file";
import { HezuodarenStep } from "../steps/gethezuodarenList";
import { setBrowser } from "../store/puInfo";
import { sleep } from "../util";
import { TableResult } from "../types";

export default async () => {
    let { list } = getCsv('darenshujv.csv');
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        userDataDir: './bdata'
    });
    setBrowser(browser)
    const page = await browser.newPage();
    await page.goto('https://compass.jinritemai.com');
    // await page.goto('https://fxg.jinritemai.com/login');
    await sleep(28000)
    let step = new HezuodarenStep()
    await step.initPage();
    let i = 0;
    let headers: string[] = [];

    const outerRes: (string[])[] = [];
    const prodRes: TableResult<string>[] = [];

    let eachOuterDataLen = 0
    while (i < list.length) {
        const dycode = list[i].trim()
        await step.$search(dycode)
        i++;
        const content = await step.$getOuterTable()
        if (content.length === 0) {
            prodRes.push({ headers: [], list: [] })
            outerRes.push([dycode, '此人没有带货记录,搜索不到。或者可能是抖音号不正确'])
            continue
        }
        // 去掉最后一列
        content.splice(-1)
        const prods = await step.$getProductions(1)
        if (headers.length === 0) {
            headers = await step.$getHeaders();
            headers.unshift('抖音号')
            // 去掉最后一列操作
            headers.splice(-1)
            eachOuterDataLen = headers.length
            headers = headers.concat(prods.headers)
            headers.push('产品编号')

        }
        let index0 = content[0].indexOf('抖音号：')
        content.unshift(`${content[0].slice(index0 + 4)}`)
        prods.list.forEach(item => {
            let item1 = item[0]
            let index1 = item1.indexOf('编号：')
            item.push(item1.slice(index1 + 3))
            // item.push({ text: item1.slice(index1 + 3), hyperlink: `${item1.slice(index1 + 3)}` })
        })
        prodRes.push(prods)
        outerRes.push(content)
        await sleep(500)
    }
    // 写入
    let excelData: string[][] = [];
    excelData.push(headers)
    outerRes.forEach((out, index) => {
        let l = out;
        l.length = headers.length;
        excelData.push(l)
        prodRes[index].list.forEach(prod => {
            let nl = (new Array(eachOuterDataLen)).concat(prod);
            excelData.push(nl)
        })
    })

    const now = new Date();
    const filename = `达人带货信息-${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}_${now.getMinutes()}.xlsx`
    writeExcel(excelData, filename)
    await sleep(8000);
    await browser.close();
    console.log('导出完成,文件名为：' + filename)
};