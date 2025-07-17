export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum ExamType {
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum Shift {
  MORNING = 'MORNING',
  DAY = 'DAY',
  EVENING = 'EVENING',
}
