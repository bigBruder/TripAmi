export const getDateToDisplay = (date: string | number | Date) => {
  const newDate = new Date(date)
    .toLocaleDateString(undefined, {
      month: 'numeric',
      year: 'numeric',
      day: 'numeric',
    })
    .split('/');
  return `${newDate[1]}/${newDate[0]}/${newDate[2]}`;
};
