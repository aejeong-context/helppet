import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';

import type { HealthRecord } from '@/types';

interface UpcomingScheduleProps {
  records: HealthRecord[];
}

const TYPE_LABELS: Record<string, string> = {
  checkup: '정기검진',
  vaccination: '예방접종',
  medication: '투약',
  surgery: '수술',
  emergency: '응급',
};

export function UpcomingSchedule({ records }: UpcomingScheduleProps) {
  const upcoming = records.filter((r) => r.nextDate);

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">다가오는 일정</h3>
      <div className="space-y-2">
        {upcoming.map((record) => (
          <div key={record._id} className="flex items-center gap-3 text-sm">
            <span className="text-primary-600 font-medium min-w-[3rem]">
              {formatShortDate(record.nextDate!)}
            </span>
            <span className="text-gray-500">
              {TYPE_LABELS[record.type] || record.type}
            </span>
            {record.hospital && (
              <span className="text-gray-400">— {record.hospital}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
