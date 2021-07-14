export const setNumericFormat = (num) => {
    return Number(num).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};