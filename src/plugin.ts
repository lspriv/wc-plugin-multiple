/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-06-08 00:46:33
 */
import {
  type Plugin,
  type PluginService,
  type CalendarDay,
  type CalendarEventDetail,
  timestamp,
  Nullable,
  TrackDateResult,
  CalendarData,
  DateStyle,
  DateRange,
  addLayoutHideCls,
  OnceEmiter
} from '@lspriv/wx-calendar/lib';

interface MultiSelOpts {
  type: 'range' | 'multi';
  bgColor: string;
  textColor: string;
  borderRadius: string;
}

export interface ChangeEventDtail {
  checked: Array<CalendarDay>;
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

  private baseStyle: Record<string, string>;

  private service: PluginService;

  constructor(options?: Partial<MultiSelOpts>) {
    this.options = this.formOptions(options);
    this.checked = new Set();
    this.formBaseStyle();
  }

  private formOptions(options?: Partial<MultiSelOpts>): MultiSelOpts {
    return {
      type: options?.type || 'range',
      bgColor: options?.bgColor || 'var(--wc-checked-today-bg)',
      textColor: options?.textColor || 'var(--wc-bg)',
      borderRadius: options?.borderRadius || '50%'
    };
  }

  private formBaseStyle() {
    const textColor = this.options.textColor;
    this.baseStyle = {
      '--wc-date-color': textColor,
      '--wc-solar-color': textColor,
      '--wc-mark-color': textColor,
      '--wc-dot-color': textColor,
      '--wc-today-color': textColor,
      backgroundColor: this.options.bgColor,
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
          (result.style as DateStyle).borderRadius = `${borderRadius} 0 0 ${borderRadius}`;
        } else if (currstamp === this._range_[1]) {
          (result.style as DateStyle).borderRadius = `0 ${borderRadius} ${borderRadius} 0`;
        } else {
          (result.style as DateStyle).borderRadius = '0';
        }
      }
    }

    return result;
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
    this.service.component.triggerEvent<ChangeEventDtail>('change', { checked });
  }

  private updateDates(dates: CalendarDay[][]) {
    if (this.options.type === 'multi') {
      const updates = dates.flatMap(item => item);
      this.service.updateDates(updates);
    } else {
      const updates = dates.filter(item => item.length);
      this.service.updateRange(updates as DateRange);
    }
  }
}

export const MULTI_PLUGIN_KEY = MultiPlugin.KEY;
