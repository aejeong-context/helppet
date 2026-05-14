import type {
  Adoption,
  Comment,
  ConditionLog,
  HealthRecord,
  Medication,
  MedicationLog,
  Pet,
  Post,
  User,
} from '@/types';

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type MockAccount = {
  userId: string;
  password: string;
};

type MockDatabase = {
  users: User[];
  accounts: MockAccount[];
  Pets: Pet[];
  Medications: Medication[];
  HealthRecords: HealthRecord[];
  ConditionLogs: ConditionLog[];
  Posts: Post[];
  Comments: Comment[];
  Adoptions: Adoption[];
  MedicationLogs: MedicationLog[];
};

type TableName = keyof Pick<
  MockDatabase,
  'Pets' | 'Medications' | 'HealthRecords' | 'ConditionLogs' | 'Posts' | 'Comments' | 'Adoptions' | 'MedicationLogs'
>;

const DB_STORAGE_KEY = 'helppet.mock.db.v1';
const SESSION_STORAGE_KEY = 'helppet.mock.session.v1';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function hasWindow() {
  return typeof window !== 'undefined';
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const MOCK_KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function isoDate(offsetDays = 0) {
  const todayKST = MOCK_KST_FORMATTER.format(new Date());
  const [y, m, d] = todayKST.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return MOCK_KST_FORMATTER.format(date);
}

function isoDateTime(offsetDays = 0, hour = 9, minute = 0) {
  const todayKST = MOCK_KST_FORMATTER.format(new Date());
  const [y, m, d] = todayKST.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offsetDays, hour - 9, minute, 0));
  return date.toISOString();
}

function petArt(label: string, colors: [string, string], accent = '#fffaf0') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="540" viewBox="0 0 720 540">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="720" height="540" rx="36" fill="url(#bg)" />
      <circle cx="150" cy="120" r="72" fill="${accent}" fill-opacity="0.18" />
      <circle cx="620" cy="400" r="90" fill="${accent}" fill-opacity="0.14" />
      <path d="M275 170c24-52 70-78 126-78s102 26 126 78c29 11 49 40 49 76 0 47-31 80-76 80H220c-45 0-76-33-76-80 0-36 20-65 49-76 22 17 43 19 62 0Z" fill="${accent}" fill-opacity="0.94" />
      <circle cx="308" cy="212" r="10" fill="#5c4636" />
      <circle cx="412" cy="212" r="10" fill="#5c4636" />
      <path d="M344 248c12 12 32 12 44 0" stroke="#5c4636" stroke-width="8" stroke-linecap="round" />
      <text x="50%" y="82%" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-size="64" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildInitialDatabase(): MockDatabase {
  const demoUser: User = {
    _id: 'user-demo',
    email: 'demo@helppet.app',
    nickname: '해피보호자',
    createdAt: isoDateTime(-90, 10, 0),
    updatedAt: isoDateTime(-1, 18, 30),
  };

  const friendUser: User = {
    _id: 'user-friend',
    email: 'friend@helppet.app',
    nickname: '콩이엄마',
    createdAt: isoDateTime(-70, 15, 0),
    updatedAt: isoDateTime(-2, 12, 10),
  };

  const pets: Pet[] = [
    {
      _id: 'pet-bori',
      userId: demoUser._id,
      name: '보리',
      species: 'dog',
      breed: '시츄',
      birthDate: isoDate(-365 * 13),
      weight: 6.1,
      profileImage: petArt('Bori', ['#d29f6a', '#8b5e3c']),
      conditions: ['심장병', '관절염'],
      isSenior: true,
      specialNotes: '아침 산책은 짧게, 밤에는 관절약 복용 후 충분히 휴식이 필요해요.',
      createdAt: isoDateTime(-50, 11, 0),
      updatedAt: isoDateTime(-1, 8, 30),
    },
    {
      _id: 'pet-maru',
      userId: demoUser._id,
      name: '마루',
      species: 'cat',
      breed: '코리안숏헤어',
      birthDate: isoDate(-365 * 9),
      weight: 4.3,
      profileImage: petArt('Maru', ['#7db3a1', '#446c63']),
      conditions: ['신장질환'],
      isSenior: true,
      specialNotes: '음수량 체크가 중요해서 물그릇을 여러 곳에 두고 있어요.',
      createdAt: isoDateTime(-42, 14, 20),
      updatedAt: isoDateTime(-2, 19, 5),
    },
  ];

  const medications: Medication[] = [
    {
      _id: 'med-bori-heart',
      petId: 'pet-bori',
      name: '피모벤단',
      dosage: '1정',
      frequency: '하루 2회',
      startDate: isoDate(-40),
      timeSlots: ['08:00', '20:00'],
      notes: '식전 30분 복용',
      isActive: true,
      createdAt: isoDateTime(-40, 8, 0),
      updatedAt: isoDateTime(-1, 8, 0),
    },
    {
      _id: 'med-bori-joint',
      petId: 'pet-bori',
      name: '글루코사민',
      dosage: '1포',
      frequency: '하루 1회',
      startDate: isoDate(-25),
      timeSlots: ['21:00'],
      notes: '저녁 식사 후 급여',
      isActive: true,
      createdAt: isoDateTime(-25, 21, 0),
      updatedAt: isoDateTime(-1, 21, 0),
    },
    {
      _id: 'med-maru-kidney',
      petId: 'pet-maru',
      name: '신장 보조제',
      dosage: '5ml',
      frequency: '하루 2회',
      startDate: isoDate(-18),
      timeSlots: ['09:00', '19:00'],
      notes: '급수 직후 복용하면 덜 거부해요.',
      isActive: true,
      createdAt: isoDateTime(-18, 9, 0),
      updatedAt: isoDateTime(-1, 19, 0),
    },
  ];

  const healthRecords: HealthRecord[] = [
    {
      _id: 'record-bori-checkup',
      petId: 'pet-bori',
      type: 'checkup',
      date: isoDate(-3),
      description: '심장 초음파 추적 검사, 상태 안정적이라 기존 약 유지.',
      hospital: '늘봄동물의료센터',
      doctor: '김수의사',
      cost: 128000,
      nextDate: isoDate(12),
      createdAt: isoDateTime(-3, 15, 10),
      updatedAt: isoDateTime(-3, 15, 10),
    },
    {
      _id: 'record-bori-medication',
      petId: 'pet-bori',
      type: 'medication',
      date: isoDate(-12),
      description: '관절 보조제 처방 연장.',
      hospital: '늘봄동물의료센터',
      cost: 42000,
      nextDate: isoDate(18),
      createdAt: isoDateTime(-12, 11, 40),
      updatedAt: isoDateTime(-12, 11, 40),
    },
    {
      _id: 'record-maru-checkup',
      petId: 'pet-maru',
      type: 'checkup',
      date: isoDate(-6),
      description: '신장 수치 재검. 수분 섭취 유지 권장.',
      hospital: '고양이전문 24시',
      doctor: '박수의사',
      cost: 98000,
      nextDate: isoDate(9),
      createdAt: isoDateTime(-6, 13, 0),
      updatedAt: isoDateTime(-6, 13, 0),
    },
  ];

  const conditionLogs: ConditionLog[] = [
    {
      _id: 'cond-bori-6',
      petId: 'pet-bori',
      date: isoDate(-6),
      appetite: 3,
      activity: 2,
      pain: 3,
      mood: 3,
      weight: 6.1,
      symptoms: ['기침', '무기력'],
      notes: '새벽에 기침이 길어져 산책은 생략했어요.',
      stoolCount: 2,
      stoolType: 'soft',
      waterIntake: 3,
      createdAt: isoDateTime(-6, 22, 0),
      updatedAt: isoDateTime(-6, 22, 0),
    },
    {
      _id: 'cond-bori-5',
      petId: 'pet-bori',
      date: isoDate(-5),
      appetite: 3,
      activity: 3,
      pain: 3,
      mood: 3,
      weight: 6.1,
      symptoms: ['기침'],
      notes: '약 복용 후 오후에는 비교적 안정적이었어요.',
      stoolCount: 2,
      stoolType: 'normal',
      waterIntake: 3,
      createdAt: isoDateTime(-5, 22, 0),
      updatedAt: isoDateTime(-5, 22, 0),
    },
    {
      _id: 'cond-bori-4',
      petId: 'pet-bori',
      date: isoDate(-4),
      appetite: 4,
      activity: 3,
      pain: 4,
      mood: 4,
      weight: 6.0,
      symptoms: ['기침'],
      notes: '저녁 식사를 거의 다 먹었고 산책도 15분 정도 가능했어요.',
      stoolCount: 2,
      stoolType: 'normal',
      waterIntake: 4,
      createdAt: isoDateTime(-4, 21, 30),
      updatedAt: isoDateTime(-4, 21, 30),
    },
    {
      _id: 'cond-bori-3',
      petId: 'pet-bori',
      date: isoDate(-3),
      appetite: 4,
      activity: 4,
      pain: 4,
      mood: 4,
      weight: 6.0,
      symptoms: ['기침'],
      notes: '병원 다녀온 뒤 컨디션이 괜찮았어요.',
      stoolCount: 2,
      stoolType: 'normal',
      waterIntake: 4,
      createdAt: isoDateTime(-3, 21, 10),
      updatedAt: isoDateTime(-3, 21, 10),
    },
    {
      _id: 'cond-bori-2',
      petId: 'pet-bori',
      date: isoDate(-2),
      appetite: 4,
      activity: 4,
      pain: 4,
      mood: 5,
      weight: 6.0,
      symptoms: [],
      notes: '집중해서 장난감을 쫓을 정도로 기분이 좋았어요.',
      stoolCount: 2,
      stoolType: 'normal',
      waterIntake: 4,
      createdAt: isoDateTime(-2, 22, 15),
      updatedAt: isoDateTime(-2, 22, 15),
    },
    {
      _id: 'cond-bori-1',
      petId: 'pet-bori',
      date: isoDate(-1),
      appetite: 4,
      activity: 3,
      pain: 4,
      mood: 4,
      weight: 6.0,
      symptoms: ['가벼운 기침'],
      notes: '아침에는 괜찮았고 밤에만 약하게 기침했어요.',
      stoolCount: 2,
      stoolType: 'normal',
      waterIntake: 4,
      images: [petArt('Check', ['#f1d39a', '#d7a364'], '#fff')],
      createdAt: isoDateTime(-1, 21, 40),
      updatedAt: isoDateTime(-1, 21, 40),
    },
    {
      _id: 'cond-maru-2',
      petId: 'pet-maru',
      date: isoDate(-2),
      appetite: 3,
      activity: 4,
      pain: 4,
      mood: 4,
      weight: 4.3,
      symptoms: ['음수량 감소'],
      notes: '습식 사료를 늘리니 먹는 양이 나아졌어요.',
      stoolCount: 1,
      stoolType: 'normal',
      waterIntake: 2,
      createdAt: isoDateTime(-2, 22, 20),
      updatedAt: isoDateTime(-2, 22, 20),
    },
    {
      _id: 'cond-maru-1',
      petId: 'pet-maru',
      date: isoDate(-1),
      appetite: 4,
      activity: 4,
      pain: 4,
      mood: 4,
      weight: 4.3,
      symptoms: [],
      notes: '음수량이 조금 회복됐고 활동도 좋아졌어요.',
      stoolCount: 1,
      stoolType: 'normal',
      waterIntake: 3,
      createdAt: isoDateTime(-1, 22, 10),
      updatedAt: isoDateTime(-1, 22, 10),
    },
  ];

  const posts: Post[] = [
    {
      _id: 'post-heart-routine',
      userId: demoUser._id,
      category: 'heart',
      title: '심장약 거부가 심한 아이, 급여 시간을 어떻게 잡고 계세요?',
      content: '보리가 식전 약을 자꾸 뱉어서 아침 루틴을 다시 짜고 있어요. 간식에 숨기면 먹긴 하는데 효과가 떨어질까 걱정됩니다.',
      images: [petArt('Routine', ['#f7c37a', '#d98652'])],
      tags: ['심장병', '투약팁'],
      likeCount: 12,
      commentCount: 2,
      createdAt: isoDateTime(-1, 9, 30),
      updatedAt: isoDateTime(-1, 9, 30),
    },
    {
      _id: 'post-kidney-water',
      userId: friendUser._id,
      category: 'kidney',
      title: '신장 질환 냥이 음수량 늘리는 데 효과 있던 방법 공유해요',
      content: '물그릇 재질만 바꿔도 꽤 차이가 있었어요. 분수형 급수기보다 넓은 세라믹 볼을 더 선호하더라고요.',
      images: [],
      tags: ['신장질환', '음수량'],
      likeCount: 18,
      commentCount: 1,
      createdAt: isoDateTime(-2, 20, 15),
      updatedAt: isoDateTime(-2, 20, 15),
    },
    {
      _id: 'post-senior-walk',
      userId: demoUser._id,
      category: 'senior-care',
      title: '노견 산책은 짧고 자주가 확실히 낫네요',
      content: '예전처럼 한 번에 오래 걷는 대신 10분씩 세 번 나누니 훨씬 안정적입니다. 관절 부담도 덜해 보여요.',
      images: [],
      tags: ['노견케어', '산책'],
      likeCount: 9,
      commentCount: 0,
      createdAt: isoDateTime(-4, 18, 0),
      updatedAt: isoDateTime(-4, 18, 0),
    },
  ];

  const comments: Comment[] = [
    {
      _id: 'comment-heart-1',
      postId: 'post-heart-routine',
      userId: friendUser._id,
      content: '저는 약 먹이기 10분 전에 산책 먼저 하고 들어와서 바로 급여해요. 의외로 성공률이 높았어요.',
      createdAt: isoDateTime(-1, 10, 10),
      updatedAt: isoDateTime(-1, 10, 10),
    },
    {
      _id: 'comment-heart-2',
      postId: 'post-heart-routine',
      userId: demoUser._id,
      content: '산책 루틴은 아직 안 해봤는데 오늘 저녁에 바로 시도해볼게요.',
      createdAt: isoDateTime(-1, 10, 42),
      updatedAt: isoDateTime(-1, 10, 42),
    },
    {
      _id: 'comment-kidney-1',
      postId: 'post-kidney-water',
      userId: demoUser._id,
      content: '세라믹 볼 팁 좋네요. 냉장고 옆 조용한 곳에 하나 더 두려고요.',
      createdAt: isoDateTime(-2, 21, 2),
      updatedAt: isoDateTime(-2, 21, 2),
    },
  ];

  const adoptions: Adoption[] = [
    {
      _id: 'adoption-dal',
      userId: friendUser._id,
      type: 'adoption',
      petName: '달이',
      species: 'dog',
      breed: '믹스',
      age: '11세',
      conditions: ['백내장', '심장질환'],
      description: '산책은 천천히 걷는 편이고 사람을 매우 좋아해요. 꾸준한 약 복용이 필요하지만 생활 루틴은 안정적입니다.',
      images: [petArt('Dali', ['#7d8bd6', '#4d5b9b'])],
      location: '서울 마포구',
      status: 'available',
      contactInfo: '010-1234-5678 / dm@helppet.app',
      medicalHistory: '중성화 완료, 심장약 복용 중, 최근 혈액검사 이상 소견 없음.',
      createdAt: isoDateTime(-3, 16, 30),
      updatedAt: isoDateTime(-3, 16, 30),
    },
    {
      _id: 'foster-bam',
      userId: demoUser._id,
      type: 'foster',
      petName: '밤이',
      species: 'cat',
      breed: '코리안숏헤어',
      age: '8세',
      conditions: ['신장질환'],
      description: '2주 정도만 임시보호가 필요한 상황입니다. 약 복용과 습식 사료 급여 루틴이 정리되어 있어요.',
      images: [petArt('Bami', ['#84c2b1', '#4d8a76'])],
      location: '경기 성남시',
      status: 'available',
      contactInfo: 'care@helppet.app',
      medicalHistory: '수액 경험 있음, 현재는 보조제와 식이 관리 중.',
      createdAt: isoDateTime(-1, 14, 10),
      updatedAt: isoDateTime(-1, 14, 10),
    },
    {
      _id: 'adoption-sol',
      userId: friendUser._id,
      type: 'adoption',
      petName: '솔이',
      species: 'dog',
      breed: '푸들',
      age: '13세',
      conditions: ['관절염'],
      description: '계단만 조심하면 일상생활은 무난합니다. 사람 손길을 좋아하고 실내 적응이 빨라요.',
      images: [],
      location: '부산 수영구',
      status: 'available',
      contactInfo: '010-8888-1111',
      medicalHistory: '슬개골 관리 필요, 관절 보조제 복용 중.',
      createdAt: isoDateTime(-8, 11, 30),
      updatedAt: isoDateTime(-8, 11, 30),
    },
  ];

  const medicationLogs: MedicationLog[] = [];

  return {
    users: [demoUser, friendUser],
    accounts: [
      { userId: demoUser._id, password: 'helppet123!' },
      { userId: friendUser._id, password: 'helppet123!' },
    ],
    Pets: pets,
    Medications: medications,
    HealthRecords: healthRecords,
    ConditionLogs: conditionLogs,
    Posts: posts,
    Comments: comments,
    Adoptions: adoptions,
    MedicationLogs: medicationLogs,
  };
}

function readDatabase() {
  if (!hasWindow()) return clone(buildInitialDatabase());

  const raw = window.localStorage.getItem(DB_STORAGE_KEY);
  if (!raw) {
    const initial = buildInitialDatabase();
    window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
    return clone(initial);
  }

  return JSON.parse(raw) as MockDatabase;
}

function saveDatabase(db: MockDatabase) {
  if (!hasWindow()) return;
  window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

function getDefaultUser(db: MockDatabase) {
  return db.users[0];
}

function readSessionUser(db: MockDatabase) {
  if (!hasWindow()) return null;

  const sessionUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionUserId) return null;
  return db.users.find((user) => user._id === sessionUserId) || null;
}

function saveSessionUserId(userId: string | null) {
  if (!hasWindow()) return;
  if (!userId) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, userId);
}

function getActiveUser(db: MockDatabase) {
  return readSessionUser(db) || getDefaultUser(db);
}

function applyParams<T extends object>(items: T[], params?: Record<string, string>) {
  if (!params) return items;

  let result = [...items];
  let sortField: string | undefined;
  let sortAsc = true;
  let limit: number | undefined;

  for (const [key, value] of Object.entries(params)) {
    if (key === '_sort') {
      sortField = value;
      continue;
    }
    if (key === '_order') {
      sortAsc = value !== 'desc';
      continue;
    }
    if (key === '_limit') {
      limit = Number(value);
      continue;
    }

    if (key.endsWith('_gte')) {
      const field = key.slice(0, -4);
      result = result.filter((item) => {
        const itemValue = (item as Record<string, unknown>)[field];
        return itemValue != null && String(itemValue) >= value;
      });
      continue;
    }

    if (key.endsWith('_lte')) {
      const field = key.slice(0, -4);
      result = result.filter((item) => {
        const itemValue = (item as Record<string, unknown>)[field];
        return itemValue != null && String(itemValue) <= value;
      });
      continue;
    }

    result = result.filter((item) => {
      const itemValue = (item as Record<string, unknown>)[key];
      if (typeof itemValue === 'boolean') return String(itemValue) === value;
      return String(itemValue) === value;
    });
  }

  if (sortField) {
    result.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const comparison = String(av).localeCompare(String(bv), 'ko');
      return sortAsc ? comparison : -comparison;
    });
  }

  if (limit) {
    result = result.slice(0, limit);
  }

  return result;
}

function updatePostCommentCount(db: MockDatabase, postId: string) {
  const post = db.Posts.find((item) => item._id === postId);
  if (!post) return;
  post.commentCount = db.Comments.filter((comment) => comment.postId === postId).length;
  post.updatedAt = new Date().toISOString();
}

export const mockAuth = {
  async signup(body: AuthPayload) {
    const db = readDatabase();
    const existingUser = db.users.find((user) => user.email === body.email);
    if (existingUser) throw new Error('이미 사용 중인 이메일입니다.');

    const timestamp = new Date().toISOString();
    const user: User = {
      _id: makeId('user'),
      email: body.email,
      nickname: body.name || body.email.split('@')[0],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.users.push(user);
    db.accounts.push({ userId: user._id, password: body.password });
    saveDatabase(db);
    saveSessionUserId(user._id);

    return {
      user: clone(user),
      accessToken: `mock-access-${user._id}`,
      refreshToken: `mock-refresh-${user._id}`,
    };
  },

  async signin(body: AuthPayload) {
    const db = readDatabase();
    let user = db.users.find((item) => item.email === body.email);

    if (!user) {
      const timestamp = new Date().toISOString();
      user = {
        _id: makeId('user'),
        email: body.email,
        nickname: body.email.split('@')[0],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      db.users.push(user);
      db.accounts.push({ userId: user._id, password: body.password });
      saveDatabase(db);
    }

    saveSessionUserId(user._id);

    return {
      user: clone(user),
      accessToken: `mock-access-${user._id}`,
      refreshToken: `mock-refresh-${user._id}`,
    };
  },

  async me() {
    const db = readDatabase();
    const user = readSessionUser(db);
    if (!user) throw new Error('Not authenticated');
    return clone(user);
  },

  async refresh() {
    const db = readDatabase();
    const user = getActiveUser(db);
    return {
      session: {
        access_token: `mock-access-${user._id}`,
        refresh_token: `mock-refresh-${user._id}`,
      },
      user,
    };
  },

  async signout() {
    saveSessionUserId(null);
  },
};

export const mockData = {
  async list(table: TableName, params?: Record<string, string>) {
    const db = readDatabase();
    return clone(applyParams(db[table] as unknown as Array<Record<string, unknown>>, params));
  },

  async get(table: TableName, id: string) {
    const db = readDatabase();
    const item = db[table].find((entry) => entry._id === id);
    if (!item) throw new Error(`${table} item not found`);
    return clone(item);
  },

  async create(table: TableName, body: unknown) {
    const db = readDatabase();
    const activeUser = getActiveUser(db);
    const timestamp = new Date().toISOString();
    const payload = body as Record<string, unknown>;

    if (table === 'MedicationLogs') {
      const existing = db.MedicationLogs.find(
        (log) =>
          log.petId === payload.petId &&
          log.medicationId === payload.medicationId &&
          log.timeSlot === payload.timeSlot &&
          log.date === payload.date,
      );
      if (existing) return clone(existing);
    }

    const nextItem = {
      ...payload,
      _id: makeId(table.toLowerCase()),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as MockDatabase[TableName][number];

    if ('userId' in nextItem && !nextItem.userId) {
      nextItem.userId = activeUser._id;
    }

    if (table === 'Posts') {
      const postItem = nextItem as unknown as Record<string, unknown>;
      postItem.likeCount = Number(postItem.likeCount || 0);
      postItem.commentCount = Number(postItem.commentCount || 0);
    }

    (db[table] as unknown as Array<Record<string, unknown>>).unshift(
      nextItem as unknown as Record<string, unknown>,
    );

    if (table === 'Comments') {
      updatePostCommentCount(db, String((nextItem as unknown as Record<string, unknown>).postId));
    }

    saveDatabase(db);
    return clone(nextItem);
  },

  async update(table: TableName, id: string, body: unknown) {
    const db = readDatabase();
    const index = db[table].findIndex((entry) => entry._id === id);
    if (index === -1) throw new Error(`${table} item not found`);

    const current = db[table][index];
    const next = {
      ...current,
      ...(body as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    };

    (db[table] as unknown as Array<Record<string, unknown>>)[index] = next as Record<string, unknown>;
    saveDatabase(db);
    return clone(next);
  },

  async delete(table: TableName, id: string) {
    const db = readDatabase();
    const target = db[table].find((entry) => entry._id === id);
    const collections = db as unknown as Record<TableName, Array<Record<string, unknown>>>;
    collections[table] = collections[table].filter((entry) => entry._id !== id);

    if (table === 'Comments' && target) {
      updatePostCommentCount(db, String((target as unknown as Record<string, unknown>).postId));
    }

    saveDatabase(db);
  },
};
