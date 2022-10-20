export type Required = {
  numberOfRunsRequired: number;
  wicketsLeft: number;
  ballsLeft: number;
};

export type Player = {
  name: string;
  playerProbability: number[];
  numberOfRunsScored: number;
  numberofBallsPlayed: number;
  isOut: boolean;
  isPlaying: boolean;
};
