export interface PollOption {
  id: string;
  option: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface Assembly {
  id: string;
  title: string;
  typeAssembly: string;
  mode: string;
  startDate: string;
  endDate?: string;
  polls: Poll[];
}

export interface VotePayload {
  pollId: string;
  optionId: string;
  userId: string;
}
