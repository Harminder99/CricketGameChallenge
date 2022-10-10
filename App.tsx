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
const {MatchCalculations} = NativeModules;

// MatchCalculations.createMatchLogs(txt => {
//   console.log(txt);
// });

const eventEmitter = new NativeEventEmitter(MatchCalculations);

type ScoreBoard = {
  total_score: number;
  balls_left: number;
  runs: number;
  total_score_required: number;
  balls: number;
  overs: number;
  name?: string;
  isOut?: false;
  total_out: number;
};

type Player = {
  name: string;
  numberOfRunsScored: number;
  numberofBallsPlayed: number;
  position: number;
};

const App = () => {
  const [scoreBoard, setScoreBoard] = useState<ScoreBoard>({
    total_score: 0,
    balls_left: 0,
    runs: 0,
    total_score_required: 0,
    balls: 0,
    overs: 0,
    total_out: 0,
  });

  const [players, setPlayers] = useState<{player1: Player; player2: Player}>({
    player1: {
      name: '',
      numberofBallsPlayed: 0,
      numberOfRunsScored: 0,
      position: 1,
    },
    player2: {
      name: '',
      numberofBallsPlayed: 0,
      numberOfRunsScored: 0,
      position: 2,
    },
  });

  const [matchSummary, setMatchSummary] = useState<
    | {
        runs_required: number;
        lost_text: string;
        winner_text: string;
      }
    | undefined
  >();

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    MatchCalculations.setUpMatch();
    eventEmitter.addListener('change-player', res => {
      console.log('change-player', res);
      setPlayers(res);
    });
    eventEmitter.addListener('match-summary', res => {
      console.log('match-summary', res);
      setMatchSummary(res);
    });
    eventEmitter.addListener('all-out', res => {
      console.log('all-out', res);
      setMatchSummary(res);
    });
    eventEmitter.addListener('ball-by-ball', (res: ScoreBoard) => {
      setScoreBoard(res);
      console.log('ball-by-ball', res);
    });

    return () => {
      eventEmitter?.removeAllListeners();
    };
  }, []);

  const spinBall = async () => {
    MatchCalculations.spinBall();
  };

  const resetMatch = async () => {
    setMatchSummary(undefined);
    MatchCalculations.setUpMatch();
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
                {`${scoreBoard.total_score} - ${scoreBoard.total_out}`}
              </Text>
            </Text>
            <Text style={styles.overStaticTxt}>
              Overs:{' '}
              <Text style={styles.overTxt}>
                {' '}
                {`${scoreBoard.overs} - ${scoreBoard.balls}`}
              </Text>
            </Text>
          </View>
          <View style={styles.runsContainer}>
            <Text style={styles.runsTxt}>
              {scoreBoard.isOut ? 'Out' : scoreBoard.runs}
            </Text>
            <Text style={styles.staticRunsTxt}>Runs</Text>
          </View>
        </View>

        <View style={styles.matchContainer}>
          <View style={styles.fieldContainer}>
            <View style={styles.playerContainer}>
              <Text style={styles.playerTxt} numberOfLines={1}>
                {`${players.player1.numberOfRunsScored} - ${players.player1.name}`}
              </Text>
            </View>
            {matchSummary && (
              <View style={styles.playerContainer}>
                <Text style={styles.winnerTxt}>{matchSummary.lost_text}</Text>
                <Text style={styles.winnerTxt}>{''}</Text>
                <Text style={styles.winnerTxt}>{matchSummary.winner_text}</Text>
              </View>
            )}
            <View style={styles.playerContainer}>
              <Text style={styles.playerTxt} numberOfLines={1}>
                {`${players.player2.numberOfRunsScored} - ${players.player2.name}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.btnContainer}>
          {matchSummary === undefined ? (
            <View style={styles.bowlBtn}>
              <Button
                //color={'white'}
                title={'Bowl!'}
                onPress={spinBall}
              />
            </View>
          ) : (
            <View style={styles.bowlBtn}>
              <Button
                //color={'white'}
                title={'Start Again'}
                onPress={resetMatch}
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
