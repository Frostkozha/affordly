const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function fmtMoney(value: number) {
  const cents = Math.sign(value)
    * Math.round((Math.abs(value) + Number.EPSILON) * 100);
  return currency.format(cents / 100);
}
export const fmtNum = (value: number) => Math.round(value).toLocaleString('en-US');
