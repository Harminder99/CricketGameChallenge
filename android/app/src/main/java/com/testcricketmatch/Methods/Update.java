package com.testcricketmatch.Methods;

/**
 * Created by Harminder Singh on 07,October,2022
 */


import com.testcricketmatch.beans.Player;
import com.testcricketmatch.beans.Required;

import java.util.List;

public class Update {


    public static List<Player> overCompleted(List<Player> players){
        Player temp = players.get(0);
        players.set(0,players.get(1));
        players.set(1,temp);
        return players;
    }

    /*update the required score and balls*/
    public static Required updateRequiredScore(Required required, int runsScored){
        int prevReqScore = required.getNumberOfRunsRequired();
        required.setNumberOfRunsRequired(prevReqScore-runsScored);

        return required;
    }

    /*update the score of the individual player and balls played*/
    public static List<Player> updatePlayerScore(List<Player> players,int playerPosition,int runsScored){
        Player playertobeUpdated = players.get(playerPosition);
        int prevPlayerScore = playertobeUpdated.getNumberOfRunsScored();
        int prevPlayedBalls = playertobeUpdated.getNumberofBallsPlayed();
        playertobeUpdated.setNumberofBallsPlayed(prevPlayedBalls+1);
        playertobeUpdated.setNumberOfRunsScored(prevPlayerScore+runsScored);
        players.set(playerPosition,playertobeUpdated);
        return players;
    }

    //update wickets in required
    public static Required updateWickets(Required required){
        int prevWickets = required.getWicketsLeft();
        required.setWicketsLeft(prevWickets-1);
        return required;
    }

}
