import { ElementHandle, Page } from "puppeteer";
import { getBrowser } from "../../store/puInfo";
import { filterTableResult, getHandleInnerText, sleep, waitGetTableHeaders, waitGetTableList } from "../../util";

export class HezuodarenStep {
    constructor() {

    }
    page!: Page
    initPage = async () => {
        const browser = getBrowser();
        this.page = await browser.newPage();
        await this.page.goto('https://compass.jinritemai.com/shop/talent-analysis');

    }
    $search = async (keyword: string) => {
        const input = await this.page.waitForSelector('#rc_select_0');
        const page = this.page;
        await input?.click({ clickCount: 3 })
        await page.keyboard.press('Backspace')
        await input?.tap()
        await input?.type(keyword, { delay: 100 })
        await input?.press('Enter');
        await sleep(1000)
    }
    $getOuterTable = async () => {
        let list = await waitGetTableList(this.page, '#root table')
        if (list.length === 0) {
            return []
        }
        const infoTr = list[0];
        const infoTds = await infoTr.$$('td');
        let outTableItem = await getHandleInnerText(this.page, infoTds);

        return outTableItem
    }
    $getProductions = async (productionIndex: number) => {
        let prod!: ElementHandle<Element> | null
        try {
            prod = await this.page.waitForSelector(`#root table tbody>tr.ecom-table-row td:nth-child(${productionIndex + 1}) a`,{timeout:5000})

            await prod?.tap();
            // 确认有该table
            await this.page.waitForSelector('.ecom-drawer-content-wrapper table>tbody>tr', { timeout: 5000 })
            await sleep(1000)
            let eachLines = await this.page.$$('.ecom-drawer-content-wrapper table>tbody>tr');
            const allP = eachLines.map(line => new Promise<string[]>((reslove) => {
                line.$$('td').then(tds => {
                    getHandleInnerText(this.page, tds || []).then(arr => {
                        reslove(arr)
                    })
                })
            }))
            const res = await Promise.all(allP)
            return filterTableResult({ headers: ['排名', '商品信息', '成交金额', '操作'], list: res })
        } catch (error) {
            return { headers: ['排名', '商品信息', '成交金额', '操作'], list: [] }
        }
    }
    $getHeaders = async () => {
        await this.page.waitForSelector('#root table');
        let headers = await waitGetTableHeaders(this.page, '#root table')
        let headerContent = await getHandleInnerText(this.page, headers);
        return headerContent
    }
}
