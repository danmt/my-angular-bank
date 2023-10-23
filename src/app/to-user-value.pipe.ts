import { Pipe, PipeTransform } from '@angular/core';
import { toUserValue } from './to-user-value';

@Pipe({
  name: 'hdToUserValue',
  standalone: true,
})
export class ToUserValuePipe implements PipeTransform {
  transform(value: number, decimals: number): number {
    return toUserValue(value, decimals);
  }
}
