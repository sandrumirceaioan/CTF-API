
export const tableSwagger = (data: {
    Field: string,
    Data_Type: string,
    Description: string,
    isRequired: string,
} []) => {
    let res = '<h2>Notes</h2> <hr/><table> <th>Field</th><th>isRequired</th><th>Data_Type</th><th>Description</th>'

    data.forEach(it => {
        res = res + `<tr><td>${it.Field}</td><td>${it.isRequired}</td><td>${it.Data_Type}</td><td>${it.Description}</td></tr>`
    })
    return res + '</table>'
}
