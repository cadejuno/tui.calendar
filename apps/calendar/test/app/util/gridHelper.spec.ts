import { createScheduleCollection } from '@src/controller/base';
import { DataStore } from '@src/model';
import Schedule from '@src/model/schedule';
import ScheduleViewModel from '@src/model/scheduleViewModel';
import TZDate from '@src/time/date';
import {
  getExceedCount,
  getGridWidthAndLeftPercentValues,
  getRenderedEventViewModels,
  getWidth,
  isWithinHeight,
} from '@src/util/gridHelper';
import { Cells } from '@t/panel';
import { createDate } from '@test/helper';

const data = [
  { start: createDate(2021, 4, 30), end: createDate(2021, 5, 2) }, // Fri ~ Sun
  { start: createDate(2021, 5, 2), end: createDate(2021, 5, 4) }, // Sun ~ Tue
  { start: createDate(2021, 5, 4), end: createDate(2021, 5, 6) }, // Tue ~ Thu
];

describe('gridHelper', () => {
  describe('isWithinHeight', () => {
    it('should return a callback function that checks whether do not exceed height of container', () => {
      expect(isWithinHeight(100, 20)({ top: 1 } as ScheduleViewModel)).toBeTruthy();
      expect(isWithinHeight(100, 20)({ top: 5 } as ScheduleViewModel)).toBeFalsy();
    });
  });

  describe('getExceedCount', () => {
    it('should calculate the number of events that exceed height of container', () => {
      const viewModels = data.map((e) => {
        const event = Schedule.create(e);
        event.isAllDay = true;

        return ScheduleViewModel.create(event);
      });

      expect(getExceedCount(viewModels, 200, 30, new TZDate(2021, 5, 2))).toBe(0);
    });
  });

  it('getRenderedEventViewModels', () => {
    const narrowWeekend = false;
    const cells: Cells = [
      new TZDate(2021, 5, 2),
      new TZDate(2021, 5, 3),
      new TZDate(2021, 5, 4),
      new TZDate(2021, 5, 5),
    ];
    const dataStore: DataStore = {
      calendars: [],
      schedules: createScheduleCollection(),
      idsOfDay: {},
    };

    expect(getRenderedEventViewModels(cells, dataStore, narrowWeekend)).toEqual({
      viewModels: [],
      gridDateEventModelMap: {},
    });
  });

  describe('getGridWidthAndLeftPercentValues', () => {
    const totalWidth = 100;
    let narrowWeekend: boolean;
    let cells: Cells;

    describe('narrowWeekend is true', () => {
      beforeAll(() => {
        narrowWeekend = true;
      });

      it('should return single PanelEventInfo', () => {
        cells = [createDate(2021, 4, 16)];

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(1);
        expect(widthList).toEqual([100]);
        expect(leftList).toHaveLength(1);
        expect(leftList).toEqual([0]);
      });

      it('should return PanelEventInfo list (only weekday)', () => {
        // Mon, Tue, Wed, Thu, Fri
        cells = [12, 13, 14, 15, 16].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(5);
        expect(widthList).toEqual([20, 20, 20, 20, 20]);
        expect(leftList).toHaveLength(5);
        expect(leftList).toEqual([0, 20, 40, 60, 80]);
      });

      it('should return PanelEventInfo list (only weekend)', () => {
        // Sat, Sun
        cells = [17, 18].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(2);
        expect(widthList).toEqual([50, 50]);
        expect(leftList).toHaveLength(2);
        expect(leftList).toEqual([0, 50]);
      });

      it('should return PanelEventInfo list', () => {
        // Thu, Fri, Sat
        cells = [15, 16, 17].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(3);
        expect(widthList).toEqual([40, 40, 20]);
        expect(leftList).toHaveLength(3);
        expect(leftList).toEqual([0, 40, 80]);
      });
    });

    describe('narrowWeekend is false', () => {
      beforeAll(() => {
        narrowWeekend = false;
      });

      it('should return single grid width and left percent value', () => {
        cells = [createDate(2021, 4, 16)];

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(1);
        expect(widthList).toEqual([100]);
        expect(leftList).toHaveLength(1);
        expect(leftList).toEqual([0]);
      });

      it('should return list for grid width and left percent values (only weekday)', () => {
        // Mon, Tue, Wed, Thu, Fri
        cells = [12, 13, 14, 15, 16].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(5);
        expect(widthList).toEqual([20, 20, 20, 20, 20]);
        expect(leftList).toHaveLength(5);
        expect(leftList).toEqual([0, 20, 40, 60, 80]);
      });

      it('should return list for grid width and left percent values (only weekend)', () => {
        // Sat, Sun
        cells = [17, 18].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(2);
        expect(widthList).toEqual([50, 50]);
        expect(leftList).toHaveLength(2);
        expect(leftList).toEqual([0, 50]);
      });

      it('should return list for grid width and left percent values', () => {
        // Thu, Fri, Sat, Sun
        cells = [15, 16, 17, 18].map((d) => createDate(2021, 4, d));

        const { widthList, leftList } = getGridWidthAndLeftPercentValues(
          cells,
          narrowWeekend,
          totalWidth
        );

        expect(widthList).toHaveLength(4);
        expect(widthList).toEqual([25, 25, 25, 25]);
        expect(leftList).toHaveLength(4);
        expect(leftList).toEqual([0, 25, 50, 75]);
      });
    });
  });

  describe('getWidth', () => {
    it('should return sum of width', () => {
      const widthList = [1, 2, 3, 4, 5];
      const { length } = widthList;

      for (let start = 0; start < length; start += 1) {
        for (let end = start; end < length; end += 1) {
          const result = getWidth(widthList, start, end);
          let sum = 0;

          for (let i = start; i <= end; i += 1) {
            sum += widthList[i];
          }

          expect(result).toBe(sum);
        }
      }
    });
  });
});
