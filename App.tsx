/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {NativeModules, NativeEventEmitter} from 'react-native';
import {Player, Required} from './src/types/MatchType';
import {
  overCompleted,
  updatePlayerScore,
  updateRequiredScore,
  updateWickets,
} from './src/Utiles/Update';
const {MatchCalculations} = NativeModules;

//players
const getAllPlayers = () => {
  var players: Player[] = [];
  players.push({
    name: 'Kirat Boli',
    playerProbability: [5, 30, 25, 10, 15, 1, 9, 5],
    numberOfRunsScored: 0,
    numberofBallsPlayed: 0,
    isOut: false,
    isPlaying: true,
  });
  players.push({
    name: 'N.S Nodhi',
    playerProbability: [10, 40, 20, 5, 10, 1, 4, 10],
    numberOfRunsScored: 0,
    numberofBallsPlayed: 0,
    isOut: false,
    isPlaying: true,
  });
  players.push({
    name: 'R Rumrah',
    playerProbability: [20, 30, 15, 5, 5, 1, 4, 20],
    numberOfRunsScored: 0,
    numberofBallsPlayed: 0,
    isOut: false,
    isPlaying: false,
  });
  players.push({
    name: 'Shashi Henra',
    playerProbability: [30, 25, 5, 0, 5, 1, 4, 30],
    numberOfRunsScored: 0,
    numberofBallsPlayed: 0,
    isOut: false,
    isPlaying: false,
  });
  return players;
};

const App = () => {
  //to ttrack who has to come next if one gets out
  var index = 2;

  // local states

  const [onCrease, setOnCrease] = useState<Player[]>([]);
  const [matchPlayer, setPlayers] = useState<Player[]>(getAllPlayers());
  const [required, setRequired] = useState<Required>({
    numberOfRunsRequired: 40,
    wicketsLeft: 4,
    ballsLeft: 24,
  });
  const [scoreBoard, setScoreBoard] = useState<{
    totalScore: number;
    isOut: boolean;
    run: number;
    lost_text?: string;
    winner_text?: string;
    /* to track no of balls completed so that we can swich batsmen when over got completed */
    ballsCompleted: number;
    /* to track players*/
    playerPosition: number;
  }>({
    totalScore: 0,
    isOut: false,
    run: 0,
    ballsCompleted: 0,
    playerPosition: 0,
  });

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    setupMatch();
  }, []);

  const setupMatch = () => {
    index = 2;
    setScoreBoard({
      totalScore: 0,
      isOut: false,
      run: 0,
      lost_text: '',
      winner_text: '',
      ballsCompleted: 0,
      playerPosition: 0,
    });
    let players = getAllPlayers();
    setPlayers(players);
    setOnCrease([players[0], players[1]]);
    setRequired({
      numberOfRunsRequired: 40,
      wicketsLeft: 4,
      ballsLeft: 24,
    });
  };

  const ballbyballcommentary = (
    name: string,
    runs: number,
    ballsCompleted: number,
    playerPosition: number,
  ) => {
    let overs = ballsCompleted / 6;
    let balls = ballsCompleted % 6;

    if (runs === 7) {
      setScoreBoard({
        totalScore: scoreBoard.totalScore,
        isOut: true,
        run: scoreBoard.run,
        ballsCompleted: ballsCompleted,
        playerPosition: playerPosition,
      });
      console.log(' ', overs, '.', balls, ':\t', name, ' "OUT"');
    } else {
      setScoreBoard({
        totalScore: scoreBoard.totalScore + runs,
        isOut: false,
        run: runs,
        ballsCompleted: ballsCompleted,
        playerPosition: playerPosition,
      });
      console.log(
        ' ',
        overs,
        '.',
        balls,
        ':\t',
        name,
        ' scores ',
        runs,
        ' runs',
      );
    }
  };

  const spinBall = async () => {
    /* playBall function returns integer based on player probability of hitting */

    try {
      const run = await MatchCalculations.probabilityRandomNumber(
        onCrease[scoreBoard.playerPosition].playerProbability,
      );
      let ballsCompleted = scoreBoard.ballsCompleted + 1;
      let firstPlayerName = onCrease[0].name;

      // temp variable foor state

      var tempRequired = required;
      var tempMatchPlayer = matchPlayer;
      var tempOnCrease = onCrease;

      if (run === 1 || run === 3 || run === 5) {
        /* updating score of indvidual player */
        tempOnCrease = updatePlayerScore(
          tempOnCrease,
          scoreBoard.playerPosition,
          run,
        );

        /* updating required score */

        tempRequired = updateRequiredScore(tempRequired, run);
        /* we need to switch the batsmen when he scored odd number
         * as we already wrote for switching batsmen when over completed so we can use it */
        tempOnCrease = overCompleted(tempOnCrease);
        firstPlayerName = tempOnCrease[0].name;
        // update player here
      } else if (run === 7) {
        tempRequired = updateWickets(tempRequired);
        if (tempRequired.wicketsLeft > 2) {
          for (let k = 0; k < tempMatchPlayer.length; k++) {
            if (tempOnCrease[0].name === tempMatchPlayer[k].name) {
              var temp = tempOnCrease[0];
              temp.isOut = true;
              temp.isPlaying = false;
              let prevBalls = temp.numberofBallsPlayed;
              temp.numberofBallsPlayed = prevBalls + 1;
              tempMatchPlayer[k] = temp;
              tempOnCrease[0] = tempMatchPlayer[index];
              tempOnCrease[0].isPlaying = true;
              index++;
              break;
            }
          }
        } else {
          for (let k = 0; k < tempMatchPlayer.length; k++) {
            if (tempOnCrease[0].name === tempMatchPlayer[k].name) {
              var temp = tempOnCrease[0];
              temp.isOut = true;
              temp.isPlaying = false;
              let prevBalls = temp.numberofBallsPlayed;
              temp.numberofBallsPlayed = prevBalls + 1;
              tempMatchPlayer[k] = temp;
              if (tempMatchPlayer.length > index) {
                tempMatchPlayer[index].isPlaying = true;
              }

              break;
            }
          }

          alloutMatchSummary(tempRequired);
          printPlayerScores(tempMatchPlayer);
          return;
          // finish
        }
      } else {
        tempOnCrease = updatePlayerScore(
          tempOnCrease,
          scoreBoard.playerPosition,
          run,
        );

        tempRequired = updateRequiredScore(tempRequired, run);
      }
      ballbyballcommentary(
        firstPlayerName,
        run,
        ballsCompleted,
        scoreBoard.playerPosition,
      );
      if (ballsCompleted % 6 === 0) {
        /* switch players of postitions of 0 and 1 when over got completed */
        tempOnCrease = overCompleted(tempOnCrease);
        writeOverCommentary(tempRequired, ballsCompleted);
      }
      setOnCrease(tempOnCrease);
      setRequired(tempRequired);
      setPlayers(tempMatchPlayer);

      //if target is chased down printing match summary
      if (tempRequired.numberOfRunsRequired <= 0) {
        matchSummary(
          tempRequired,
          ballsCompleted,
          scoreBoard.playerPosition,
          run,
        );
        printPlayerScores(tempMatchPlayer);
        // finish
        console.log('\tfinish:');
      }

      //if balls got over then printing match summary
      if (ballsCompleted === tempRequired.ballsLeft - 1) {
        matchSummary(
          tempRequired,
          ballsCompleted,
          scoreBoard.playerPosition,
          run,
        );
        printPlayerScores(tempMatchPlayer);
      }
    } catch (e) {
      console.error(e);
    }
  };

  function writeOverCommentary(
    requiredForMatch: Required,
    ballsCompleted: number,
  ) {
    console.log();
    let oversleft = 4 - ballsCompleted / 6;

    // sendEvent(getReactApplicationContext(),COMMENTRY, map);
    console.log(
      oversleft +
        ' overs left. ' +
        requiredForMatch.numberOfRunsRequired +
        ' runs to win',
    );
  }

  function printPlayerScores(players: Player[]) {
    for (let i = 0; i < players.length; i++) {
      if (!players[0].isPlaying) {
        console.log(
          '\t' +
            players[i].name +
            ' - ' +
            players[i].numberOfRunsScored +
            '(' +
            players[i].numberofBallsPlayed +
            ')',
        );
      } else {
        //sendEvent(getReactApplicationContext(),SCORE, map);
        console.log(
          '\t' +
            players[i].name +
            ' - ' +
            players[i].numberOfRunsScored +
            '*' +
            ' (' +
            players[i].numberofBallsPlayed +
            ')',
        );
      }
    }
  }

  function alloutMatchSummary(requiredForMatch: Required) {
    console.log();
    console.log('*******************************');
    console.log('\tMatch Summary:');
    console.log('Bengaluru lost the match');
    console.log(
      'Chennai won by ' + requiredForMatch.numberOfRunsRequired + ' runs',
    );
    setScoreBoard({
      totalScore: scoreBoard.totalScore,
      isOut: true,
      run: scoreBoard.run,
      lost_text: 'Bengaluru lost the match',
      winner_text:
        'Chennai won by ' + requiredForMatch.numberOfRunsRequired + ' runs',
      ballsCompleted: scoreBoard.ballsCompleted,
      playerPosition: scoreBoard.playerPosition,
    });
  }

  function matchSummary(
    requiredForMatch: Required,
    ballsCompleted: number,
    playerPosition: number,
    run: number,
  ) {
    console.log();
    console.log('*******************************');
    console.log('\tMatch Summary:');
    console.log('\tBengaluru won the match');
    let wickets = requiredForMatch.wicketsLeft;
    let ballsleft = requiredForMatch.ballsLeft - ballsCompleted;
    console.log(
      'Bengaluru won by ' +
        wickets +
        ' wickets and ' +
        ballsleft +
        ' balls remaining',
    );
    setScoreBoard({
      totalScore: scoreBoard.isOut
        ? scoreBoard.totalScore
        : scoreBoard.totalScore + run,
      isOut: scoreBoard.isOut,
      run: run,
      lost_text: 'Chennai lost the match',
      winner_text:
        'Bengaluru won by ' +
        wickets +
        ' wickets and ' +
        ballsleft +
        ' balls remaining',
      ballsCompleted: ballsCompleted,
      playerPosition: playerPosition,
    });
  }

  const resetMatch = async () => {
    setupMatch();
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <View style={styles.subContainer}>
        <View style={styles.scoreContainer}>
          <View style={styles.overContainer}>
            <Text style={styles.scoreStaticTxt}>
              Score:
              <Text style={styles.scoreTxt}>
                {' '}
                {`${scoreBoard.totalScore} - ${
                  matchPlayer.length - required.wicketsLeft
                }`}
              </Text>
            </Text>
            <Text style={styles.overStaticTxt}>
              Overs:{' '}
              <Text style={styles.overTxt}>
                {' '}
                {`${Math.floor(scoreBoard.ballsCompleted / 6)} - ${
                  scoreBoard.ballsCompleted % 6
                }`}
              </Text>
            </Text>
          </View>
          <View style={styles.runsContainer}>
            <Text style={styles.runsTxt}>
              {scoreBoard.isOut ? 'Out' : scoreBoard.run}
            </Text>
            <Text style={styles.staticRunsTxt}>Runs</Text>
          </View>
        </View>

        <View style={styles.matchContainer}>
          <View style={styles.fieldContainer}>
            <View style={styles.playerContainer}>
              <Text style={styles.playerTxt} numberOfLines={1}>
                {onCrease.length > 0
                  ? `${onCrease[0].numberOfRunsScored} - ${onCrease[0].name}`
                  : 10}
              </Text>
            </View>

            {scoreBoard?.lost_text && scoreBoard?.winner_text && (
              <View style={styles.playerContainer}>
                <Text style={styles.winnerTxt}>
                  {scoreBoard?.lost_text ?? ''}
                </Text>
                <Text style={styles.winnerTxt}>{''}</Text>
                <Text style={styles.winnerTxt}>
                  {scoreBoard?.winner_text ?? ''}
                </Text>
              </View>
            )}
            <View style={styles.playerContainer}>
              <Text style={styles.playerTxt} numberOfLines={1}>
                {onCrease.length > 1
                  ? `${onCrease[1].numberOfRunsScored} - ${onCrease[1].name}`
                  : 0}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.btnContainer}>
          {scoreBoard?.lost_text && scoreBoard?.winner_text ? (
            <View style={styles.bowlBtn}>
              <Button
                //color={'white'}
                title={'Start Again'}
                onPress={resetMatch}
              />
            </View>
          ) : (
            <View style={styles.bowlBtn}>
              <Button
                //color={'white'}
                title={'Bowl!'}
                onPress={spinBall}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  playerTxt: {
    color: 'black',
  },
  winnerTxt: {
    color: 'black',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  matchContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    borderColor: 'black',
    borderWidth: 2,
    width: '60%',
    height: '80%',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  playerContainer: {
    minWidth: '40%',
    maxWidth: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  subContainer: {flex: 1},
  scoreContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 0.2,
  },
  bowlBtn: {
    backgroundColor: 'rgba(0,256,256,1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  btnContainer: {flex: 0.1, justifyContent: 'center', marginHorizontal: 20},
  overContainer: {},
  scoreStaticTxt: {color: 'black', fontWeight: '400', fontSize: 14},
  overStaticTxt: {
    color: 'black',
    fontWeight: '400',
    fontSize: 14,
    marginTop: 8,
  },
  scoreTxt: {color: 'black', fontWeight: '500', fontSize: 14},
  overTxt: {
    color: 'black',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 8,
  },
  runsContainer: {
    alignItems: 'center',
  },
  staticRunsTxt: {
    color: 'black',
    fontWeight: '400',
    fontSize: 16,
  },
  runsTxt: {
    color: 'black',
    fontWeight: '400',
    fontSize: 80,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '500',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
