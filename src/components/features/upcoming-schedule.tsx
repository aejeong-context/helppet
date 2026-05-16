import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';

import type { HealthRecord, Pet } from '@/types';

interface UpcomingScheduleProps {
  records: HealthRecord[];
  pets?: Pet[];
}

const TYPE_LABELS: Record<string, string> = {
  checkup: '정기검진',
  vaccination: '예방접종',
  medication: '투약',
  surgery: '수술',
  emergency: '응급',
};

export function UpcomingSchedule({ records, pets }: UpcomingScheduleProps) {
  const upcoming = records.filter((r) => r.nextDate);

  if (upcoming.length === 0) {
    return null;
  }

  const petName = (petId: string) =>
    pets?.find((p) => p._id === petId)?.name;

  return (
    <Card>
      <div className="space-y-2">
        {upcoming.map((record) => {
          const name = petName(record.petId);
          return (
            <div key={record._id} className="flex items-center gap-2 text-sm">
              <span className="text-primary-600 font-medium min-w-[3rem]">
                {formatShortDate(record.nextDate!)}
              </span>
              {name && (
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                  {name}
                </span>
              )}
              <span className="text-gray-500">
                {TYPE_LABELS[record.type] || record.type}
              </span>
              {record.hospital && (
                <span className="text-gray-400 truncate min-w-0">
                  — {record.hospital}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
