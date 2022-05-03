interface Element {
    innerText: string
}
export interface TableResult<T> {
    list: (T[])[],
    headers: string[]
}