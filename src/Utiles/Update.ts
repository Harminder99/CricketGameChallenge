import {Player, Required} from '../types/MatchType';

export function overCompleted(players: Player[]) {
  var tempPlayers = players;
  var temp = players[0];
  tempPlayers[0] = players[1];
  tempPlayers[1] = temp;
  return tempPlayers;
}

/*update the required score and balls*/
export function updateRequiredScore(required: Required, runsScored: number) {
  var tempReq = required;
  let prevReqScore = required.numberOfRunsRequired;
  tempReq.numberOfRunsRequired = prevReqScore - runsScored;
  return tempReq;
}

/*update the score of the individual player and balls played*/
export function updatePlayerScore(
  players: Player[],
  playerPosition: number,
  runsScored: number,
) {
  var tempPlayers = players;
  var playertobeUpdated = tempPlayers[playerPosition];
  let prevPlayerScore = playertobeUpdated.numberOfRunsScored;
  let prevPlayedBalls = playertobeUpdated.numberofBallsPlayed;
  playertobeUpdated.numberOfRunsScored = prevPlayerScore + runsScored;
  playertobeUpdated.numberofBallsPlayed = prevPlayedBalls + 1;
  tempPlayers[playerPosition] = playertobeUpdated;
  return tempPlayers;
}

//update wickets in required
export function updateWickets(required: Required) {
  var temprequired = required;
  let prevWickets = temprequired.wicketsLeft;
  temprequired.wicketsLeft = prevWickets - 1;
  return temprequired;
}
