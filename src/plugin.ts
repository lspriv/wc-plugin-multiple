/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-06-10 08:10:51
 */
import {
  type Plugin,
  type PluginService,
  type CalendarDay,
  type CalendarEventDetail,
  type Nullable,
  type TrackDateResult,
  type CalendarData,
  type DateStyle,
  type DateRange,
  type DateRanges,
  type WcDateStyle,
  type OnceEmiter,
  type TrackYearResult,
  type WcAnnualMark,
  type WcAnnualMarks,
  type WcYear,
  isLeapYear,
  timestamp,
  themeStyle,
  addLayoutHideCls,
  getAnnualMarkKey,
  GREGORIAN_MONTH_DAYS
} from '@lspriv/wx-calendar/lib';
export interface MultiSelOpts {
  type: 'range' | 'multi';
  bgColor: WcDateStyle;
  textColor: WcDateStyle;
  borderRadius: number;
}

export interface ChangeEventDtail {
  checked: Array<CalendarDay>;
  validDates: Array<CalendarDay | DateRange>;
}

type PluginDateRange = [start: CalendarDay, end: CalendarDay];

const setToCalendarDays = (days: Set<string>): Array<CalendarDay> => {
  return [...days]
    .map(item => {
      const [year, month, day] = item.split('-');
      return { year: +year, month: +month, day: +day };
    })
    .sort((a, b) => timestamp(a) - timestamp(b));
};

export class MultiPlugin implements Plugin {
  static KEY = 'wc-plugin-multiple' as const;

  private options: MultiSelOpts;

  private checked: Set<string>;

  private _range_: Array<number> = [];

  private baseStyle: Record<string, string | number>;

  private service: PluginService;

  constructor(options?: Partial<MultiSelOpts>) {
    this.options = this.formOptions(options);
    this.checked = new Set();
    this.formBaseStyle();
  }

  private formOptions(options?: Partial<MultiSelOpts>): MultiSelOpts {
    return {
      type: options?.type || 'range',
      bgColor: options?.bgColor || { light: '#409EFF', dark: '#409EFF' },
      textColor: options?.textColor || { light: '#FFF', dark: '#E5E5E5' },
      borderRadius: options?.borderRadius || 50
    };
  }

  private formBaseStyle() {
    const textColor = themeStyle(this.options.textColor)!;
    this.baseStyle = {
      '--wc-date-color': textColor,
      '--wc-solar-color': textColor,
      '--wc-mark-color': textColor,
      '--wc-dot-color': textColor,
      '--wc-today-color': textColor,
      backgroundColor: themeStyle(this.options.bgColor)!,
      borderRadius: this.options.borderRadius,
      overflow: 'hidden',
      transition: 'background-color .3s ease'
    };
  }

  PLUGIN_INITIALIZE(service: PluginService) {
    this.service = service;
  }

  PLUGIN_ON_ATTACH(service: PluginService, sets: Partial<CalendarData>) {
    sets.pointer && (sets.pointer.show = false);
    let areaHideCls = sets.areaHideCls || '';
    areaHideCls = addLayoutHideCls(areaHideCls, 'subinfo');
    areaHideCls = addLayoutHideCls(areaHideCls, 'today');
    sets.areaHideCls = areaHideCls;
    service.component._pointer_.show = false;
    service.component._printer_.renderCheckedBg = false;
  }

  PLUGIN_CATCH_TAP(service: PluginService) {
    service.component._pointer_.show = false;
  }

  PLUGIN_ON_CLICK(_: PluginService, detail: CalendarEventDetail) {
    const { year, month, day } = detail.checked!;
    const key = `${year}-${month}-${day}`;

    const updates: Array<CalendarDay> = [];

    if (this.options.type === 'multi') {
      if (this.checked.has(key)) {
        this.dispatchSet('delete', key);
        updates.push({ year, month, day });
      } else {
        this.dispatchSet('add', key);
      }
    } else {
      if (this.checked.has(key) || this.checked.size === 2) {
        updates.push(...setToCalendarDays(this.checked));
        this.dispatchSet('clear');
        this.emitChange([]);
      }
      this.dispatchSet('add', key);
    }

    const checked = setToCalendarDays(this.checked);

    if (this.options.type === 'multi' || this.checked.size === 2) {
      this.emitChange(checked);
    }

    this.updateDates([updates, checked]);
  }

  PLUGIN_TRACK_DATE(date: CalendarDay): Nullable<TrackDateResult> {
    let result: TrackDateResult | null = null;
    if (!this.checked.size) return null;
    const key = `${date.year}-${date.month}-${date.day}`;
    if (this.options.type === 'multi') {
      if (this.checked.has(key)) {
        result = { style: { ...this.baseStyle, width: '100rpx' } };
      }
    } else {
      if (this.checked.size === 1) {
        if (this.checked.has(key)) result = { style: { ...this.baseStyle } };
      } else {
        const currstamp = timestamp(date);
        if (currstamp < this._range_[0] || currstamp > this._range_[1]) return null;
        result = { style: { ...this.baseStyle } };
        const borderRadius = this.options.borderRadius;
        if (currstamp === this._range_[0]) {
          (result.style as DateStyle).borderRadius = `${borderRadius}rpx 0 0 ${borderRadius}rpx`;
        } else if (currstamp === this._range_[1]) {
          (result.style as DateStyle).borderRadius = `0 ${borderRadius}rpx ${borderRadius}rpx 0`;
        } else {
          (result.style as DateStyle).borderRadius = '0';
        }
      }
    }

    return result;
  }

  PLUGIN_TRACK_YEAR(year: WcYear): Nullable<TrackYearResult> {
    const marks: WcAnnualMarks = new Map();
    for (let i = 0; i < 12; i++) {
      const days = i === 1 && isLeapYear(year.year) ? GREGORIAN_MONTH_DAYS[i] + 1 : GREGORIAN_MONTH_DAYS[i];
      for (let j = 0; j < days; j++) {
        const date = { year: year.year, month: i + 1, day: j + 1 };
        const key = `${year.year}-${date.month}-${date.day}`;
        const markkey = getAnnualMarkKey({ month: date.month, day: date.day });

        if (this.options.type === 'multi') {
          if (this.checked.has(key)) {
            const set: WcAnnualMark = {};
            const borderRadius = this.options.borderRadius;
            set.style = {
              color: { ...this.options.textColor },
              bgColor: { ...this.options.bgColor },
              bgTLRadius: { light: borderRadius, dark: borderRadius },
              bgTRRadius: { light: borderRadius, dark: borderRadius },
              bgBLRadius: { light: borderRadius, dark: borderRadius },
              bgBRRadius: { light: borderRadius, dark: borderRadius }
            };
            marks.set(markkey, set);
          }
        } else {
          const currstamp = timestamp(date);
          if (currstamp >= this._range_[0] && currstamp <= this._range_[1]) {
            const set: WcAnnualMark = {};
            const borderRadius = this.options.borderRadius;
            set.style = {
              color: { ...this.options.textColor },
              bgColor: { ...this.options.bgColor },
              bgWidth: { light: 'dateCol', dark: 'dateCol' }
            };
            if (currstamp === this._range_[0]) {
              set.style.bgTLRadius = { light: borderRadius, dark: borderRadius };
              set.style.bgBLRadius = { light: borderRadius, dark: borderRadius };
            } else if (currstamp === this._range_[1]) {
              set.style.bgTRRadius = { light: borderRadius, dark: borderRadius };
              set.style.bgBRRadius = { light: borderRadius, dark: borderRadius };
            }
            marks.set(markkey, set);
          }
        }
      }
    }

    return marks.size ? { marks } : null;
  }

  PLUGIN_ON_CHANGE(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter) {
    emiter.cancel();
  }

  public select(dates: PluginDateRange): void;
  public select(dates: Array<CalendarDay>, clear: boolean): void;
  public select(dates: PluginDateRange | Array<CalendarDay>, clear: boolean = false) {
    if (this.options.type === 'multi') {
      let updates: string[] = [];
      if (clear) {
        updates = [...this.checked];
        this.dispatchSet('clear');
      }
      const _dates = dates.map(date => `${date.year}-${date.month}-${date.day}`);
      this.checked = new Set([...this.checked, ..._dates]);

      const checked = setToCalendarDays(this.checked);
      this.emitChange(checked);
      this.updateDates([setToCalendarDays(new Set([...updates, ..._dates]))]);
    } else {
      if (dates.length === 1) throw new Error('参数[dates]数组长度不合法');
      const updates = [...setToCalendarDays(this.checked)];
      this.dispatchSet('clear');

      if (!dates.length) {
        this.emitChange([]);
        this.updateDates([updates]);
      } else {
        const start = dates[0],
          end = dates[1];
        this.dispatchSet('add', `${start.year}-${start.month}-${start.day}`);
        this.dispatchSet('add', `${end.year}-${end.month}-${end.day}`);
        const checked = setToCalendarDays(this.checked);
        this.emitChange(checked);
        this.updateDates([updates, checked]);
      }
    }
  }

  private dispatchSet(operator: 'add' | 'delete', value: string): void;
  private dispatchSet(operator: 'clear'): void;
  private dispatchSet(operator: 'add' | 'delete' | 'clear', value?: string) {
    if (operator === 'add') {
      this.checked.add(value!);
    } else if (operator === 'delete') {
      this.checked.delete(value!);
    } else if (operator === 'clear') {
      this.checked.clear();
    }

    if (this.options.type === 'range') this.updatePluginRange();
  }

  private updatePluginRange() {
    this._range_ = [...this.checked]
      .map(item => {
        const [year, month, day] = item.split('-');
        return timestamp({ year: +year, month: +month, day: +day });
      })
      .sort();
  }

  private emitChange(checked: Array<CalendarDay>) {
    this.service.component.triggerEvent<ChangeEventDtail>('change', {
      checked,
      validDates: this.filterDates(checked)
    });
  }

  private updateDates(dates: CalendarDay[][]) {
    if (this.options.type === 'multi') {
      const updates = dates.flatMap(item => item);
      const years = [...new Set(updates.map(item => item.year))];
      this.service.updateDates(updates);
      this.service.updateAnnuals(years);
    } else {
      const updates = dates.filter(item => item.length);
      const years = [
        ...new Set(
          updates.flatMap(item => {
            if (item.length > 1) {
              const arr: number[] = [];
              for (let i = item[0].year; i <= item[1].year; i++) arr.push(i);
              return arr;
            } else return item[0].year;
          })
        )
      ];
      this.service.updateRange(updates as DateRanges);
      this.service.updateAnnuals(years);
    }
  }

  private filterDates(dates: Array<CalendarDay>) {
    let _dates: Array<CalendarDay | DateRange> = this.options.type === 'multi' ? dates : [[dates[0], dates[1]]];
    this.service.traversePlugins((plugin, key) => {
      plugin.PLUGIN_DATES_FILTER && (_dates = plugin.PLUGIN_DATES_FILTER(this.service, _dates));
    });
    return _dates;
  }
}

export const MULTI_PLUGIN_KEY = MultiPlugin.KEY;
