
package com.testcricketmatch;

/**
 * Created by Harminder Singh on 07,October,2022
 */


import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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

    MatchCalculations(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "MatchCalculations";
    }

    @ReactMethod
    public void createMatchLogs(Callback callback) {
        Log.d("createMatchLogs", "logs created");
        callback.invoke("data return");
    }

    // with promise

    @ReactMethod
    public void createMatchLogsWithPromise(Promise promise) {
        Log.d("createMatchLogs", "logs created");
        try {
            promise.resolve("data return from promise");
        } catch (Exception e) {
            promise.reject("Error return from promise", e);
        }
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

        onCrease.add(players.get(1));
        onCrease.add(players.get(0));
        index = 2;
        ballsCompleted = 0;
        playerPosition = 0;
        required = matchIntializer.getMatchTarget();
    }

    @ReactMethod
    public void spinBall() {


            /* playBall function returns integer based on player probability of hitting */
            int run = PlayBall.playBall(onCrease.get(playerPosition));
            ballsCompleted++;
            ballbyballcommentary(ballsCompleted, onCrease.get(0), run);
            if (run == 1 || run == 3 || run == 5) {

                /* updating score of indvidual player */
                onCrease = Update.updatePlayerScore(onCrease, playerPosition, run);
                /* updating required score */
                required = Update.updateRequiredScore(required, run);
                /* we need to switch the batsmen when he scored odd number
                 * as we already wrote for switching batsmen when over completed so we can use it */
                onCrease = Update.overCompleted(onCrease);

            } else if (run == 7) {
                required = Update.updateWickets(required);

                if (required.getWicketsLeft() > 2) {
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
                            players.get(index).setPlaying(true);
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

            //if target is chased down printing match summary
            if (required.getNumberOfRunsRequired() <= 0) {
                matchSummary(required, ballsCompleted);
                printPlayerScores(players);
               // finish
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
        int wickets = required.getWicketsLeft() - 2;
        int ballsleft = required.getBallsLeft() - ballsCompleted;
        System.out.println("Bengaluru won by" + wickets + " wickets and " + ballsleft + " balls remaining");
    }

    public void writeOverCommentary(Required required, int ballsCompleted) {
        System.out.println();
        int oversleft = 4 - (ballsCompleted / 6);
        System.out.println(oversleft + " overs left. " + required.getNumberOfRunsRequired() + " runs to win");
    }

    public void printPlayerScores(List<Player> players) {
        System.out.println();
        Player currentPlayer;
        for (int i = 0; i < players.size(); i++) {
            if (!players.get(i).isPlaying) {
                System.out.println("\t" + players.get(i).getName() + " - " + players.get(i).getNumberOfRunsScored() + "(" + players.get(i).getNumberofBallsPlayed() + ")");
            }
            else{
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
    }

    public  void ballbyballcommentary(int ballsCompleted, Player player, int runs) {
        int overs = ballsCompleted / 6;
        int balls = ballsCompleted % 6;
        String name = player.getName();
        if (runs == 7) {
            System.out.println(" " + overs + "." + balls + ":\t" + name + " \"OUT\"");
        } else System.out.println(" " + overs + "." + balls + ":\t" + name + " scores " + runs + " runs");
    }
    public  void playerScore(Player player){
        System.out.println(player.getName()+"score ="+player.getNumberOfRunsScored());
    }
}

