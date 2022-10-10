
package com.testcricketmatch;

/**
 * Created by Harminder Singh on 07,October,2022
 */


import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.testcricketmatch.Initializer.MatchIntializer;
import com.testcricketmatch.Methods.PlayBall;
import com.testcricketmatch.Methods.Update;
import com.testcricketmatch.beans.Player;
import com.testcricketmatch.beans.Required;

public class MatchCalculations extends ReactContextBaseJavaModule {
    //to ttrack who has to come next if one gets out
    private int index = 2;

    /* to track no of balls completed so that we can swich batsmen when over got completed */
    private int ballsCompleted = 0;

    /* to track players*/
    private int playerPosition = 0;

    // Match init
    private MatchIntializer matchIntializer;

    // setPlayers
    private List<Player> players;

    // onCrease players
    private List<Player> onCrease;
    private Required required;
    private int totalScores = 0;

    //events
    private final static String CHANGE_PALYER =  "change-player";
    private final static String SCORE =  "score";
    private final static String MATCH_SUMMARY =  "match-summary";
    private final static String ALLOUT =  "all-out";
    private final static String BALL_BY_BALL =  "ball-by-ball";
    private final static String COMMENTRY =  "commentry";

    MatchCalculations(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "MatchCalculations";
    }


    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void setUpMatch() {

        /* initializing match stats */
        matchIntializer = MatchIntializer.getInitializerInstance();
        players = matchIntializer.getAllPlayers();

        onCrease = new ArrayList<Player>();

        onCrease.add(players.get(0));
        onCrease.add(players.get(1));

        index = 2;
        ballsCompleted = 0;
        playerPosition = 0;
        totalScores = 0;
        required = matchIntializer.getMatchTarget();
        ballbyballcommentary(ballsCompleted, onCrease.get(0), 0);
        updatePlayer();
    }

    @ReactMethod
    public void spinBall() {


            /* playBall function returns integer based on player probability of hitting */
            int run = PlayBall.playBall(onCrease.get(playerPosition));
            ballsCompleted++;

            if (run == 1 || run == 3 || run == 5) {

                /* updating score of indvidual player */
                onCrease = Update.updatePlayerScore(onCrease, playerPosition, run);
                /* updating required score */
                required = Update.updateRequiredScore(required, run);
                /* we need to switch the batsmen when he scored odd number
                 * as we already wrote for switching batsmen when over completed so we can use it */
                onCrease = Update.overCompleted(onCrease);

                updatePlayer();
            } else if (run == 7) {
                required = Update.updateWickets(required);

                if (required.getWicketsLeft() > 1) {
                    for (int k = 0; k < players.size(); k++) {
                        if ((onCrease.get(0).getName().equals(players.get(k).getName()))) {
                            Player temp = onCrease.get(0);
                            temp.setOut(true);
                            temp.setPlaying(false);
                            int prevBalls = temp.getNumberofBallsPlayed();
                            temp.setNumberofBallsPlayed(prevBalls + 1);
                            players.set(k, temp);
                            onCrease.set(0, players.get(index));
                            onCrease.get(0).setPlaying(true);
                            index++;
                            break;
                        }
                    }
                } else {
                    for (int k = 0; k < players.size(); k++) {
                        if ((onCrease.get(0).getName().equals(players.get(k).getName()))) {
                            Player temp = onCrease.get(0);
                            temp.setOut(true);
                            temp.setPlaying(false);
                            int prevBalls = temp.getNumberofBallsPlayed();
                            temp.setNumberofBallsPlayed(prevBalls + 1);
                            players.set(k, temp);
                            if (players.size() > index){
                                players.get(index).setPlaying(true);
                            }

                          break;
                        }
                    }
                    alloutMatchSummary(required);
                    printPlayerScores(players);
                    // finish

                }
            } else {
                onCrease = Update.updatePlayerScore(onCrease, playerPosition, run);

                required = Update.updateRequiredScore(required, run);
            }
        if (ballsCompleted % 6 == 0) {
            /* switch players of postitions of 0 and 1 when over got completed */
            onCrease = Update.overCompleted(onCrease);
            writeOverCommentary(required, ballsCompleted);

        }

        ballbyballcommentary(ballsCompleted, onCrease.get(0), run);



            //if target is chased down printing match summary
            if (required.getNumberOfRunsRequired() <= 0) {
                matchSummary(required, ballsCompleted);
                printPlayerScores(players);
               // finish
                System.out.println("\tfinish:");
            }


        //if balls got over then printing match summary
        if (ballsCompleted == (required.getBallsLeft() - 1)) {
            matchSummary(required, ballsCompleted);
            printPlayerScores(players);
        }
    }


    //listners

    public void matchSummary(Required required, int ballsCompleted) {
        System.out.println();
        System.out.println("*******************************");
        System.out.println("\tMatch Summary:");
        System.out.println("\tBengaluru won the match");
        int wickets = required.getWicketsLeft();
        int ballsleft = required.getBallsLeft() - ballsCompleted;
        System.out.println("Bengaluru won by" + wickets + " wickets and " + ballsleft + " balls remaining");

        WritableMap map = Arguments.createMap();
        map.putInt("runs_required" , required.getNumberOfRunsRequired());
        map.putString("lost_text" , "Chennai lost the match");
        map.putString("winner_text" , "Bengaluru won by " + wickets + " wickets and " + ballsleft + " balls remaining");
        sendEvent(getReactApplicationContext(),MATCH_SUMMARY, map);
    }

    public void writeOverCommentary(Required required, int ballsCompleted) {
        System.out.println();
        int oversleft = 4 - (ballsCompleted / 6);
        WritableMap map = Arguments.createMap();
        map.putInt("runs_required" , required.getNumberOfRunsRequired());
        map.putInt("overs_left" , oversleft);
       // sendEvent(getReactApplicationContext(),COMMENTRY, map);
        System.out.println(oversleft + " overs left. " + required.getNumberOfRunsRequired() + " runs to win");
    }

    public void printPlayerScores(List<Player> players) {
        System.out.println();
        for (int i = 0; i < players.size(); i++) {
            WritableMap map = Arguments.createMap();
            map.putString("player_name" , players.get(i).getName());
            map.putInt("score" , players.get(i).getNumberOfRunsScored());
            map.putInt("balls_played" , players.get(i).getNumberofBallsPlayed());
            if (!players.get(i).isPlaying) {
                map.putBoolean("isPlaying",true);
                //sendEvent(getReactApplicationContext(),SCORE, map);
                System.out.println("\t" + players.get(i).getName() + " - " + players.get(i).getNumberOfRunsScored() + "(" + players.get(i).getNumberofBallsPlayed() + ")");
            }
            else{
                map.putBoolean("isPlaying",false);
                //sendEvent(getReactApplicationContext(),SCORE, map);
                System.out.println("\t" + players.get(i).getName() + " - " + players.get(i).getNumberOfRunsScored()+ "*" + " (" + players.get(i).getNumberofBallsPlayed() + ")");
            }
        }
    }

    public void alloutMatchSummary(Required required) {
        System.out.println();
        System.out.println("*******************************");
        System.out.println("\tMatch Summary:");
        System.out.println("Bengaluru lost the match");
        System.out.println("Chennai won by" + required.getNumberOfRunsRequired()+" runs");
        WritableMap map = Arguments.createMap();
        map.putInt("runs_required" , required.getNumberOfRunsRequired());
        map.putString("lost_text" , "Bengaluru lost the match");
        map.putString("winner_text" , "Chennai won by " + required.getNumberOfRunsRequired()+" runs");
        sendEvent(getReactApplicationContext(),ALLOUT, map);
    }

    public  void ballbyballcommentary(int ballsCompleted, Player player, int runs) {
        int overs = ballsCompleted / 6;
        int balls = ballsCompleted % 6;
        String name = player.getName();
        WritableMap map = Arguments.createMap();
        map.putString("name" , name);
        map.putInt("overs" , overs);
        map.putInt("balls" , balls);

        map.putInt("balls_left",required.getBallsLeft());
        map.putInt("total_out", players.size() - required.getWicketsLeft());
        map.putInt("total_score_required",required.getNumberOfRunsRequired());

        if (runs == 7) {
            System.out.println(" " + overs + "." + balls + ":\t" + name + " \"OUT\"");
            map.putInt("total_score",totalScores);
            map.putInt("runs" , totalScores - runs < 0 ? 0 : totalScores - runs);
            map.putBoolean("isOut" , true);

        } else {
            System.out.println(" " + overs + "." + balls + ":\t" + name + " scores " + runs + " runs");
            totalScores = totalScores + runs;
            map.putInt("runs" , runs);
            map.putInt("total_score",totalScores);
            map.putBoolean("isOut" , false);
        }
        updatePlayer();
        sendEvent(getReactApplicationContext(),BALL_BY_BALL, map);
    }
    public  void playerScore(Player player){
        System.out.println(player.getName()+"score ="+player.getNumberOfRunsScored());
    }

    private  void updatePlayer(){
        if (onCrease.size() >= 2) {
            WritableMap map = Arguments.createMap();
            WritableMap player1 = Arguments.createMap();
            WritableMap player2 = Arguments.createMap();

            //player 1
            player1.putString("name", onCrease.get(0).getName() + "*");
            player1.putInt("numberofBallsPlayed", onCrease.get(0).getNumberofBallsPlayed());
            player1.putInt("numberOfRunsScored", onCrease.get(0).getNumberOfRunsScored());
            player1.putInt("position", 1);

            //player 2
            player2.putString("name", onCrease.get(1).getName());
            player2.putInt("numberofBallsPlayed", onCrease.get(1).getNumberofBallsPlayed());
            player2.putInt("numberOfRunsScored", onCrease.get(1).getNumberOfRunsScored());
            player2.putInt("position", 2);


            map.putMap("player1", player1);
            map.putMap("player2", player2);

            sendEvent(getReactApplicationContext(), CHANGE_PALYER, map);
        }
    }
}

