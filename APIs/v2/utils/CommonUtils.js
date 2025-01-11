function formatDate(timestamp){
    const date = new Date(timestamp * 1000)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;
    // console.log(formattedDate);
    return formattedDate;
}

module.exports = {
    formatDate
}