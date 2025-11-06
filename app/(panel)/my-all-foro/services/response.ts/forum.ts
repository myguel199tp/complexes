export interface PollOption {
  id: string;
  option: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
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
  polls: Poll[];
  replies: Reply[];
  createdBy: string;
}
