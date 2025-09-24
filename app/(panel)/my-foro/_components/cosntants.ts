export interface ForumOption {
  option: string;
}

export interface ForumPoll {
  question: string;
  options: ForumOption[];
}

export interface ForumPayload {
  title: string;
  content: string;
  createdBy: string;
  polls: ForumPoll[];
  nameUnit: string;
  conjunto_id: string;
}
