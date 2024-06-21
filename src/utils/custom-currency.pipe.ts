import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(
    value: number,
    currencyCode: string = 'INR',
    symbolDisplay: boolean = true,
    digitsInfo: string = '1.2-2',
    locale: string = 'en-US'
  ): string | null {
    const formattedValue = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));

    const formattedWithRs = formattedValue.replace('₹', 'Rs. ');
    const result =
      value < 0 ? `Rs. -${formattedWithRs.substring(3)}` : formattedWithRs;

    return `${result} /=`;
  }
}
