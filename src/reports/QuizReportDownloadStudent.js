import * as XLSX from 'xlsx';

export function downloadExcel(quizData, fileName) {
    console.log("4::", quizData);
    const rows = [];
    quizData.forEach(q => {
        let row = {
            "Student Name": `${q.firstName} ${q.lastName}`,
            "Email": q.email,
        };
        q.questions.forEach((que, i) => {
            row = {
                ...row,
                [`Question ${i + 1}`]: que.question,
                [`Correct Option Id of Question ${i + 1}`]: que?.options
                    .filter(item => item?.correctOption)
                    .map(item => item.id)
                    .join(", "),
                [`User Selected Id of Question ${i + 1}`]: que?.options
                    .filter(item => item?.user_selected)
                    .map(item => item.id)
                    .join(", ")
            }
        });
        rows.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Report");

    const filename = `${fileName}_reports.xlsx`;
    XLSX.writeFile(workbook, filename);
}