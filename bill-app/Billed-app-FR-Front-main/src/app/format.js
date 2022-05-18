// export const formatDate = (dateStr) => {
//   const date = new Date(dateStr)
//   const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
//   const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
//   const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
//   const month = mo.charAt(0).toUpperCase() + mo.slice(1)
//   return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
// }

// date: "2021-11-22";

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("fr", options);
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};
