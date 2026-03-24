import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

import type { HealthRecord } from '@/types';

interface HealthRecordCardProps {
  record: HealthRecord;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  checkup: { label: '정기검진', icon: '🩺' },
  vaccination: { label: '예방접종', icon: '💉' },
  medication: { label: '투약', icon: '💊' },
  surgery: { label: '수술', icon: '🏥' },
  emergency: { label: '응급', icon: '🚨' },
};

export function HealthRecordCard({ record, onEdit, onDelete }: HealthRecordCardProps) {
  const typeInfo = TYPE_LABELS[record.type] || { label: record.type, icon: '📋' };

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span>{typeInfo.icon}</span>
            <span className="text-xs font-medium text-primary-600">{typeInfo.label}</span>
            <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
          </div>
          <p className="text-sm mt-1">{record.description}</p>
          {record.hospital && (
            <p className="text-xs text-gray-500 mt-1">🏥 {record.hospital}{record.doctor ? ` · ${record.doctor}` : ''}</p>
          )}
          {record.cost != null && (
            <p className="text-xs text-gray-500 mt-0.5">💰 {record.cost.toLocaleString()}원</p>
          )}
          {record.nextDate && (
            <p className="text-xs text-primary-600 mt-1">📅 다음 예정: {formatDate(record.nextDate)}</p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 shrink-0">
            {onEdit && (
              <button onClick={onEdit} className="text-xs text-gray-500 hover:text-gray-700">수정</button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">삭제</button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
