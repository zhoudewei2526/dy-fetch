import * as fs from "fs"
import { resolve } from "path"
import xlsx from 'node-xlsx';
import * as exceljs from 'exceljs';

export const readFileBySource = (templatePath: string) => {
    const abspath = resolve(process.cwd(), 'source', templatePath);
    return fs.readFileSync(abspath)
}
export const getCsv = (templatePath: string) => {
    const data = readFileBySource(templatePath).toString();
    const arr = data.split(/\r\n?/);
    const headers = arr.shift()?.split(',');
    return { headers, list: (arr || []) }
}

export const writeCsv = (path2: string, content: string) => {
    let path3 = resolve(process.cwd(), 'dist', path2);
    fs.writeFileSync(path3, content, 'utf8')
}
export const writeExcel = (content: string[][], path2: string) => {
    const data = content;
    if (!path2.endsWith('.xlsx')) path2 += '.xlsx'
    let path3 = resolve(process.cwd(), 'dist', path2);
    var buffer = xlsx.build([{ name: 'sheet1', data: data, options: {} }]); // Returns a buffer
    fs.writeFileSync(path3, buffer, { 'flag': 'w' });
}
// export const writeExcel2 = (content: unknown[][], path2: string) => {
//     const data = content;
//     const headers = data.splice(0)[0] as string[] 
//     if (!path2.endsWith('.xlsx')) path2 += '.xlsx'
//     let path3 = resolve(process.cwd(), 'dist', path2);

//     var workbook = new exceljs.Workbook();
//     const sheet1 = workbook.addWorksheet('sheet1');
//     sheet1.columns = headers.map((h, index) => ({
//         header: h, key: index.toString()
//     }))
//     data.forEach(d => {
//         sheet1.addRow(d)
//     })

//     fs.writeFileSync(path3, buffer, { 'flag': 'w' });
// }