export type Patient = {
  id: string;
  fullName: string;
  age: number;
  diagnosis: string;
  note?: string;
};

export type HeartPartInfo = {
  title: string;
  description: string;
};

export type HeartInfoMap = Record<string, HeartPartInfo>;
