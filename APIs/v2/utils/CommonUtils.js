function formatDate(timestamp) {
    const date = new Date(timestamp * 1000)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const formattedDate = `${day}-${month}-${year}`;
    // console.log(formattedDate);
    return formattedDate;
}

function convertDate(date) {
    console.log('date: ', date);
    const parts = date.split("-");
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    let formattedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return formattedDate;
}


module.exports = {
    formatDate,
    convertDate
}