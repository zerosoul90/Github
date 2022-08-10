import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { hasValue } from '../../shared/empty.util';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Pipe({
  name: 'dsDate'
})
export class DsDatePipe implements PipeTransform, OnDestroy {

  private asyncPipe: AsyncPipe;

  seperator = '-';

  months: Map<number, string>;

  constructor(private translateService: TranslateService, private cdr: ChangeDetectorRef) {
    this.asyncPipe = new AsyncPipe(cdr);
    this.months = new Map();
    this.months.set( 1, 'browse.startsWith.months.january');
    this.months.set( 2, 'browse.startsWith.months.february');
    this.months.set( 3, 'browse.startsWith.months.march');
    this.months.set( 4, 'browse.startsWith.months.april');
    this.months.set( 5, 'browse.startsWith.months.may');
    this.months.set( 6, 'browse.startsWith.months.june');
    this.months.set( 7, 'browse.startsWith.months.july');
    this.months.set( 8, 'browse.startsWith.months.august');
    this.months.set( 9, 'browse.startsWith.months.september');
    this.months.set(10, 'browse.startsWith.months.october');
    this.months.set(11, 'browse.startsWith.months.november');
    this.months.set(12, 'browse.startsWith.months.december');
  }

  transform(value: string, ...params: any[]): string {
    let result: Observable<string>;
    if (hasValue(value)) {
      if ( !isNaN(Date.parse(value))) {
        const tks = value.split(this.seperator);
        if (hasValue(tks) && tks.length > 1) {
          result = this.translateService.get(
            this.months.get( parseInt(tks[1], 10) )
          ).pipe(
            map( (month) => {
              let date = '';
              if (tks[2]) {
                date += tks[2] + ' ';
              }
              date += month + ' ' + tks[0];
              return date;
            } )
          );
        } else {
          result = of(value);
        }
      } else {
        result = of(value);
      }
    }
    return this.asyncPipe.transform(result);
  }

  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }
}
