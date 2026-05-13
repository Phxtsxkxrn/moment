export const calculateDuration = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();

  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();

  let totalMonths = years * 12 + months;
  const finalYears = Math.floor(totalMonths / 12);
  const finalMonths = totalMonths % 12;

  return {
    years: finalYears,
    months: finalMonths,
  };
};

export const calculateNextAnnual = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const nextAnnual = new Date(start);
  nextAnnual.setFullYear(now.getFullYear());

  if (nextAnnual < now) {
    nextAnnual.setFullYear(now.getFullYear() + 1);
  }

  return Math.ceil((nextAnnual - now) / (1000 * 60 * 60 * 24));
};

export const calculateNextMonthly = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const nextMonthly = new Date(start);
  nextMonthly.setMonth(now.getMonth());
  nextMonthly.setFullYear(now.getFullYear());

  if (nextMonthly < now) {
    nextMonthly.setMonth(now.getMonth() + 1);
  }

  return Math.ceil((nextMonthly - now) / (1000 * 60 * 60 * 24));
};
