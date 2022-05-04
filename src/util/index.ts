import { ElementHandle, Handler, Page } from "puppeteer";
import { TableResult } from "../types";
const DisabledHeaders = ['操作', '排名']
export const waitGetTableList = async (page: Page, selector: string, options: { timeout: number } = { timeout: 2000 }) => {
    let tableDom = await page.waitForSelector(selector);

    const { timeout } = options
    return new Promise<ElementHandle<Element>[]>(async (res) => {
        let tryCount = 0;
        let tryWaitTime = 200
        const tryToFind = async () => {
            if (tryWaitTime * tryCount > timeout) {
                res([])
                return
            }
            tryCount++
            let trs = await tableDom?.$$('tbody>tr.ecom-table-row');
            if (trs && trs?.length > 0) {
                res(trs)
            } else {
                setTimeout(() => tryToFind(), tryWaitTime)
            }
        }
        tryToFind()
    })
}
export const waitGetTableHeaders = async (page: Page, selector: string) => {
    return page.$$(`${selector} thead>tr>th`);
}
export function getHandleInnerText(page: Page, handle: ElementHandle<Element>): Promise<string>;
export function getHandleInnerText(page: Page, handle: ElementHandle<Element>[]): Promise<string[]>;
export function getHandleInnerText(page: Page, handle: ElementHandle<Element> | ElementHandle<Element>[]): Promise<string> | Promise<string[]> {
    if (Array.isArray(handle)) {
        return page.evaluate((...nodes) => {
            return Array.from(nodes).map(node => {
                return node.innerText
            })
        }, ...handle) as Promise<string[]>;
    } else {
        return page.evaluate((handle) => {
            return handle.innerText
        }, handle) as Promise<string>;
    }

}
export const sleep = (time: number) => new Promise((res) => setTimeout(() => res(time), time))

export function filterTableResult<T>(res: TableResult<T>): TableResult<T> {
    const newHeaders: string[] = []
    const filterIndexs: number[] = []
    res.headers.forEach((item, index) => {
        if (!DisabledHeaders.includes(item.trim())) {
            filterIndexs.push(index)
            newHeaders.push(item);
        }
    })
    return { list: res.list.map(item2 => item2.filter((item3, index3) => filterIndexs.includes(index3))), headers: newHeaders }
}