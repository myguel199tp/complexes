export interface PollOption {
  id: string;
  option: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  createdAt: string;
  options: PollOption[];
}

export interface Reply {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  threadId: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  nameUnit: string;
  conjuntoId: string;
  createdAt: string;
  polls: Poll[];
  replies: Reply[];
}
