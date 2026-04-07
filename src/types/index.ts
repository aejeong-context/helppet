// File upload result
export interface UploadedFile {
  id: string;
  key: string;
  url: string;
  filename: string;
  contentType: string;
}

// Base document (bkend.ai auto-generated fields)
export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// User
export interface User extends BaseDocument {
  email: string;
  nickname: string;
  profileImage?: string;
}

// Pet (반려동물 - 노견/환견 특화)
export interface Pet extends BaseDocument {
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  profileImage?: string;
  conditions: string[];       // 질병/상태 태그 (e.g., '관절염', '심장병', '신장질환')
  isSenior: boolean;          // 노견 여부 (7세 이상)
  specialNotes?: string;      // 특이사항
}

// Medication Schedule (투약 스케줄)
export interface Medication extends BaseDocument {
  petId: string;
  name: string;               // 약물명
  dosage: string;             // 용량 (e.g., '1정', '5ml')
  frequency: string;          // 복용 주기 (e.g., '하루 2회', '12시간 간격')
  startDate: string;
  endDate?: string;
  timeSlots: string[];        // 복용 시간 (e.g., ['09:00', '21:00'])
  notes?: string;
  isActive: boolean;
}

// Health Record (건강 기록)
export interface HealthRecord extends BaseDocument {
  petId: string;
  type: 'checkup' | 'vaccination' | 'medication' | 'surgery' | 'emergency';
  date: string;
  description: string;
  hospital?: string;
  doctor?: string;
  cost?: number;
  nextDate?: string;
  attachments?: string[];     // 진료 기록 사진/파일
}

// Daily Condition Log (일일 컨디션 일지)
export interface ConditionLog extends BaseDocument {
  petId: string;
  date: string;
  appetite: 1 | 2 | 3 | 4 | 5;        // 식욕 (1=매우나쁨 ~ 5=매우좋음)
  activity: 1 | 2 | 3 | 4 | 5;        // 활동량
  pain: 1 | 2 | 3 | 4 | 5;            // 통증 (1=심함 ~ 5=없음)
  mood: 1 | 2 | 3 | 4 | 5;            // 기분/컨디션
  weight?: number;
  symptoms?: string[];                  // 오늘의 증상 태그
  notes?: string;
}

// Medication Log (투약 체크 기록)
export interface MedicationLog extends BaseDocument {
  petId: string;
  medicationId: string;
  date: string;              // YYYY-MM-DD
  timeSlot: string;          // 체크한 복용 시간 (e.g., '09:00')
  takenAt: string;           // 실제 체크한 시각 (ISO 8601)
}

// Community Post (커뮤니티 게시글)
export interface Post extends BaseDocument {
  userId: string;
  category: 'joint' | 'heart' | 'kidney' | 'tumor' | 'senior-care' | 'hospital-review' | 'general';
  title: string;
  content: string;
  images?: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
}

// Comment (댓글)
export interface Comment extends BaseDocument {
  postId: string;
  userId: string;
  content: string;
}

// Adoption/Foster (입양/임시보호 공고)
export interface Adoption extends BaseDocument {
  userId: string;
  type: 'adoption' | 'foster';          // 입양 또는 임시보호
  petName: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  conditions: string[];                  // 질병/상태
  description: string;
  images: string[];
  location: string;
  status: 'available' | 'pending' | 'completed';
  contactInfo: string;
  medicalHistory?: string;               // 의료 이력 요약
}
