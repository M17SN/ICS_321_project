// import the required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// to connect to MySQL database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Qq100100Qq@%', // My SQL password
    database: 'soccerdb'
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Successfully connected to MySQL database ✅');
  connection.release();
});


app.get('/tournaments', (req, res) => {
  db.query('SELECT * FROM TOURNAMENT', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
});
});

// ==================Admin Functions ================== //

// Add a new tournament
app.post('/admin/add-tournament', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body' });
  }
  const { tr_name, start_date, end_date } = req.body;

  if (!tr_name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Please provide tournament name, start date, and end date.' });
  }

  // Check for duplicate tournament name
  const checkQuery = 'SELECT * FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)';
  db.query(checkQuery, [tr_name], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      return res.status(400).json({ error: 'A tournament with this name already exists.' });
    }

    // Check that start_date is today or later
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(start_date);
    start.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ error: 'Start date must be today or later.' });
    }

    // Insert tournament (tr_id auto-generated)
    const insertQuery = `
      INSERT INTO TOURNAMENT (tr_name, start_date, end_date)
      VALUES (?, ?, ?)
    `;

    db.query(insertQuery, [tr_name, start_date, end_date], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Tournament added successfully!' });
    });
  });
});

// Add a team to a tournament
app.post('/admin/add-team-to-tournament', (req, res) => {
  const { team_name, tournament_name, team_group } = req.body;

  // Basic input validation
  if (!team_name || !tournament_name || !team_group) {
    return res.status(400).json({ error: 'Team name, tournament name, and team group are required.' });
  }

  // Step 1: Find the team_id
  const teamQuery = `SELECT team_id FROM TEAM WHERE LOWER(team_name) = LOWER(?)`;

  db.query(teamQuery, [team_name], (err, teamResult) => {
    if (err) return res.status(500).json({ error: err });
    if (teamResult.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    const team_id = teamResult[0].team_id;

    // Step 2: Find the tr_id
    const tournamentQuery = `SELECT tr_id FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)`;

    db.query(tournamentQuery, [tournament_name], (err, tournamentResult) => {
      if (err) return res.status(500).json({ error: err });
      if (tournamentResult.length === 0) {
        return res.status(404).json({ error: 'Tournament not found.' });
      }

      const tr_id = tournamentResult[0].tr_id;

      // Step 3: Check if already registered
      const checkQuery = `SELECT * FROM TOURNAMENT_TEAM WHERE team_id = ? AND tr_id = ?`;

      db.query(checkQuery, [team_id, tr_id], (err, existing) => {
        if (err) return res.status(500).json({ error: err });
        if (existing.length > 0) {
          return res.status(400).json({ error: 'This team is already registered in this tournament.' });
        }

        // Step 4: Insert the team
        const insertQuery = `
          INSERT INTO TOURNAMENT_TEAM 
          (team_id, tr_id, team_group, match_played, won, draw, lost, goal_for, goal_against, goal_diff, points, group_position)
          VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        `;

        db.query(insertQuery, [team_id, tr_id, team_group], (err, result) => {
          if (err) return res.status(500).json({ error: err });

          res.status(201).json({ message: 'Team successfully added to the tournament!' });
        });
      });
    });
  });
});

// Select a captain for a team
app.post('/admin/select-captain', (req, res) => {
  const { team_name, tournament_name, player_name } = req.body;

  // Basic validation
  if (!team_name || !tournament_name || !player_name) {
    return res.status(400).json({ error: 'Team name, tournament name, and player name are required.' });
  }

  // Step 1: Get team_id
  const getTeamIdQuery = `SELECT team_id FROM TEAM WHERE LOWER(team_name) = LOWER(?)`;

  db.query(getTeamIdQuery, [team_name], (err, teamResult) => {
    if (err) return res.status(500).json({ error: err });
    if (teamResult.length === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    const team_id = teamResult[0].team_id;

    // Step 2: Get tr_id
    const getTournamentIdQuery = `SELECT tr_id FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)`;

    db.query(getTournamentIdQuery, [tournament_name], (err, tournamentResult) => {
      if (err) return res.status(500).json({ error: err });
      if (tournamentResult.length === 0) {
        return res.status(404).json({ error: 'Tournament not found.' });
      }
      const tr_id = tournamentResult[0].tr_id;

      // Step 3: Get player_id
      const getPlayerIdQuery = `SELECT kfupm_id FROM PERSON WHERE LOWER(name) = LOWER(?)`;

      db.query(getPlayerIdQuery, [player_name], (err, playerResult) => {
        if (err) return res.status(500).json({ error: err });
        if (playerResult.length === 0) {
          return res.status(404).json({ error: 'Player not found.' });
        }
        const player_id = playerResult[0].kfupm_id;

        // Step 4: Validate if player belongs to the team in this tournament
        const validatePlayerQuery = `
          SELECT * 
          FROM TEAM_PLAYER
          WHERE player_id = ? AND team_id = ? AND tr_id = ?
        `;

        db.query(validatePlayerQuery, [player_id, team_id, tr_id], (err, validationResult) => {
          if (err) return res.status(500).json({ error: err });
          if (validationResult.length === 0) {
            return res.status(400).json({ error: 'This player is not part of this team in this tournament.' });
          }

          // Step 5: Insert captain (match_no = 1 by default if you don't have specific match)
          const insertCaptainQuery = `
            INSERT INTO MATCH_CAPTAIN (match_no, team_id, player_captain)
            VALUES (?, ?, ?)
          `;

          const defaultMatchNo = 1; 

          db.query(insertCaptainQuery, [defaultMatchNo, team_id, player_id], (err, insertResult) => {
            if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Captain already assigned for this team.' });
              }
              return res.status(500).json({ error: err });
            }

            res.status(201).json({ message: 'Captain assigned successfully!' });
          });
        });
      });
    });
  });
});


// Approve a player to join a team manually (admin)
app.post('/admin/approve-player', (req, res) => {
  const { player_name, team_name, tournament_name } = req.body;

  if (!player_name || !team_name || !tournament_name) {
    return res.status(400).json({ error: 'Player name, team name, and tournament name are required.' });
  }

  const getPlayerIdQuery = `SELECT kfupm_id FROM PERSON WHERE LOWER(name) = LOWER(?)`;

  db.query(getPlayerIdQuery, [player_name], (err, playerResult) => {
    if (err) return res.status(500).json({ error: err });
    if (playerResult.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    const player_id = playerResult[0].kfupm_id;

    const getTeamIdQuery = `SELECT team_id FROM TEAM WHERE LOWER(team_name) = LOWER(?)`;

    db.query(getTeamIdQuery, [team_name], (err, teamResult) => {
      if (err) return res.status(500).json({ error: err });
      if (teamResult.length === 0) {
        return res.status(404).json({ error: 'Team not found.' });
      }
      const team_id = teamResult[0].team_id;

      const getTournamentIdQuery = `SELECT tr_id FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)`;

      db.query(getTournamentIdQuery, [tournament_name], (err, tournamentResult) => {
        if (err) return res.status(500).json({ error: err });
        if (tournamentResult.length === 0) {
          return res.status(404).json({ error: 'Tournament not found.' });
        }
        const tr_id = tournamentResult[0].tr_id;

        // Step 1: Check if player is already approved for THIS TEAM in THIS TOURNAMENT
        const checkExactTeamQuery = `
          SELECT * FROM TEAM_PLAYER
          WHERE player_id = ? AND team_id = ? AND tr_id = ?
        `;

        db.query(checkExactTeamQuery, [player_id, team_id, tr_id], (err, exactResult) => {
          if (err) return res.status(500).json({ error: err });
          if (exactResult.length > 0) {
            // Player already approved, just update the request status
            const updateRequestQuery = `UPDATE PLAYER_REQUEST SET status = 'approved' WHERE player_id = ? AND team_id = ? AND tr_id = ?`;
            db.query(updateRequestQuery, [player_id, team_id, tr_id], (err) => {
              if (err) return res.status(500).json({ error: err });
              return res.status(400).json({ error: 'Player is already approved for this team in this tournament.' });
            });
            return;
          }

          // Step 2: Check if player already playing for another team in the same tournament
          const checkTournamentQuery = `
            SELECT * FROM TEAM_PLAYER
            WHERE player_id = ? AND tr_id = ?
          `;

          db.query(checkTournamentQuery, [player_id, tr_id], (err, tournamentResult) => {
            if (err) return res.status(500).json({ error: err });
            if (tournamentResult.length > 0) {
              // Player already registered with another team, update request to rejected
              const updateRequestQuery = `UPDATE PLAYER_REQUEST SET status = 'rejected' WHERE player_id = ? AND tr_id = ?`;
              db.query(updateRequestQuery, [player_id, tr_id], (err) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(400).json({ error: 'Player is already registered with another team in this tournament.' });
              });
              return;
            }

            // Step 3: Insert player into TEAM_PLAYER
            const insertQuery = `
              INSERT INTO TEAM_PLAYER (player_id, team_id, tr_id)
              VALUES (?, ?, ?)
            `;

            db.query(insertQuery, [player_id, team_id, tr_id], (err, insertResult) => {
              if (err) return res.status(500).json({ error: err });

              // Update the request status to approved
              const updateRequestQuery = `UPDATE PLAYER_REQUEST SET status = 'approved' WHERE player_id = ? AND team_id = ? AND tr_id = ?`;
              db.query(updateRequestQuery, [player_id, team_id, tr_id], (err) => {
                if (err) return res.status(500).json({ error: err });
                res.status(201).json({ message: 'Player approved and added to team successfully!' });
              });
            });
          });
        });
      });
    });
  });
});


// Delete a tournament ensuring referential integrity
app.delete('/admin/delete-tournament', (req, res) => {
  const { tournament_name } = req.body;

  // Step 1: Basic validation
  if (!tournament_name) {
    return res.status(400).json({ error: 'Tournament name is required.' });
  }

  // Step 2: Get tr_id
  const getTournamentIdQuery = `SELECT tr_id FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)`;

  db.query(getTournamentIdQuery, [tournament_name], (err, tournamentResult) => {
    if (err) return res.status(500).json({ error: err });
    if (tournamentResult.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }

    const tr_id = tournamentResult[0].tr_id;

    // Step 3: Delete related records in correct order
    const deleteTeamPlayerQuery = `DELETE FROM TEAM_PLAYER WHERE tr_id = ?`;
    const deleteTeamSupportQuery = `DELETE FROM TEAM_SUPPORT WHERE tr_id = ?`;
    const deleteTournamentTeamQuery = `DELETE FROM TOURNAMENT_TEAM WHERE tr_id = ?`;
    const deleteMatchesQuery = `
      DELETE FROM MATCH_PLAYED 
      WHERE team_id1 IN (SELECT team_id FROM TOURNAMENT_TEAM WHERE tr_id = ?)
      OR team_id2 IN (SELECT team_id FROM TOURNAMENT_TEAM WHERE tr_id = ?)
    `;

    // Execute deletions step-by-step
    db.query(deleteTeamPlayerQuery, [tr_id], (err) => {
      if (err) return res.status(500).json({ error: err });

      db.query(deleteTeamSupportQuery, [tr_id], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(deleteMatchesQuery, [tr_id, tr_id], (err) => {
          if (err) return res.status(500).json({ error: err });

          db.query(deleteTournamentTeamQuery, [tr_id], (err) => {
            if (err) return res.status(500).json({ error: err });

            // Finally delete tournament itself
            const deleteTournamentQuery = `DELETE FROM TOURNAMENT WHERE tr_id = ?`;
            db.query(deleteTournamentQuery, [tr_id], (err) => {
              if (err) return res.status(500).json({ error: err });

              res.status(200).json({ message: 'Tournament and related records deleted successfully!' });
            });
          });
        });
      });
    });
  });
});

// Admin views all pending player join requests
app.get('/admin/player-requests', (req, res) => {
  const query = `
    SELECT 
      pr.request_id,
      pe.name AS player_name,
      t.team_name,
      tr.tr_name AS tournament_name,
      DATE_FORMAT(pr.request_date, '%Y-%m-%d %H:%i:%s') AS request_date,
      pr.status
    FROM PLAYER_REQUEST pr
    JOIN PLAYER p ON pr.player_id = p.player_id
    JOIN PERSON pe ON p.player_id = pe.kfupm_id
    JOIN TEAM t ON pr.team_id = t.team_id
    JOIN TOURNAMENT tr ON pr.tr_id = tr.tr_id
    WHERE pr.status = 'pending'
    ORDER BY pr.request_date ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching player requests:', err);
      return res.status(500).json({ status: "fail", message: 'Server error.' });
    }

    res.status(200).json({
      status: "success",
      pending_requests: results
    });
  });
});

// Reject a player join request (admin)
app.delete('/admin/reject-player', (req, res) => {
  const { player_name, team_name, tournament_name } = req.body;

  if (!player_name || !team_name || !tournament_name) {
    return res.status(400).json({ error: 'Player name, team name, and tournament name are required.' });
  }

  // Get player_id
  const getPlayerIdQuery = `SELECT kfupm_id FROM PERSON WHERE LOWER(name) = LOWER(?)`;
  db.query(getPlayerIdQuery, [player_name], (err, playerResult) => {
    if (err) return res.status(500).json({ error: err });
    if (playerResult.length === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    const player_id = playerResult[0].kfupm_id;

    // Get team_id
    const getTeamIdQuery = `SELECT team_id FROM TEAM WHERE LOWER(team_name) = LOWER(?)`;
    db.query(getTeamIdQuery, [team_name], (err, teamResult) => {
      if (err) return res.status(500).json({ error: err });
      if (teamResult.length === 0) {
        return res.status(404).json({ error: 'Team not found.' });
      }
      const team_id = teamResult[0].team_id;

      // Get tr_id
      const getTournamentIdQuery = `SELECT tr_id FROM TOURNAMENT WHERE LOWER(tr_name) = LOWER(?)`;
      db.query(getTournamentIdQuery, [tournament_name], (err, tournamentResult) => {
        if (err) return res.status(500).json({ error: err });
        if (tournamentResult.length === 0) {
          return res.status(404).json({ error: 'Tournament not found.' });
        }
        const tr_id = tournamentResult[0].tr_id;

        // Update the request status to rejected
        const updateRequestQuery = `UPDATE PLAYER_REQUEST SET status = 'rejected' WHERE player_id = ? AND team_id = ? AND tr_id = ?`;
        db.query(updateRequestQuery, [player_id, team_id, tr_id], (err, result) => {
          if (err) return res.status(500).json({ error: err });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request not found.' });
          }
          res.status(200).json({ message: 'Player join request rejected.' });
        });
      });
    });
  });
});


// ==================Guest Functions ================== //

// Browse all match results of a given tournament sorted by date.
app.get('/tournament-matches/:tournament_name', (req, res) => {
  const tournamentName = req.params.tournament_name;

  // 1. Get tournament ID by case-insensitive search
  const tournamentQuery = `
    SELECT tr_id, tr_name
    FROM TOURNAMENT
    WHERE LOWER(tr_name) = LOWER(?)
  `;

  db.query(tournamentQuery, [tournamentName], (err, tournamentResults) => {
    if (err) return res.status(500).json({ error: err });
    if (tournamentResults.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const { tr_id, tr_name } = tournamentResults[0];

    // 2. Get all matches for that tournament
    const matchesQuery = `
      SELECT 
        mp.match_no,
        DATE_FORMAT(mp.play_date, '%Y-%m-%d') AS play_date,
        t1.team_name AS team1,
        t2.team_name AS team2,
        mp.results,
        mp.goal_score,
        v.venue_name,
        CONCAT(p.name, ' (#', pl.jersey_no, ')') AS player_of_match,
        mp.audience,
        CASE mp.play_stage
          WHEN 'G' THEN 'Group Stage'
          WHEN 'F' THEN 'Final'
          ELSE 'Other'
        END AS stage
      FROM MATCH_PLAYED mp
      JOIN TEAM t1 ON mp.team_id1 = t1.team_id
      JOIN TEAM t2 ON mp.team_id2 = t2.team_id
      JOIN VENUE v ON mp.venue_id = v.venue_id
      JOIN PLAYER pl ON mp.player_of_match = pl.player_id
      JOIN PERSON p ON pl.player_id = p.kfupm_id
      WHERE mp.tr_id = ?
      ORDER BY mp.play_date ASC
    `;

    db.query(matchesQuery, [tr_id], (err, matches) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        tournament_id: tr_id,
        tournament_name: tr_name,
        total_matches: matches.length,
        matches: matches
      });
    });
  });
});


// Browse the player with the highest goal scored in all the tournaments.
app.get('/topscorer', (req, res) => {
    const query = `
        SELECT 
        p.kfupm_id,
        p.name,
        pl.jersey_no,
        pl.position_to_play,
        COUNT(g.goal_id) AS total_goals
        FROM GOAL_DETAILS g
        JOIN PLAYER pl ON g.player_id = pl.player_id
        JOIN PERSON p ON pl.player_id = p.kfupm_id
        GROUP BY g.player_id
        ORDER BY total_goals DESC
        LIMIT 1
        `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err });
      res.json(results[0]); // this is because we want to return only the top player
    });
});

// Browse the players who received red cards in each team.
app.get('/redcards', (req, res) => {
    const query = `
        SELECT 
            pb.team_id,
            t.team_name,
            p.kfupm_id,
            p.name,
            pl.position_to_play,
            pb.booking_time,
            pb.play_schedule,
            pb.play_half
        FROM PLAYER_BOOKED pb
        JOIN PLAYER pl ON pb.player_id = pl.player_id
        JOIN PERSON p ON pb.player_id = p.kfupm_id
        JOIN TEAM t ON pb.team_id = t.team_id
        WHERE pb.sent_off = 'Y'
        ORDER BY pb.team_id;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Browse all members of a selected team including manager, coach, captain and players
app.get('/team-members/by-name/:team_name', (req, res) => {
    const teamName = req.params.team_name;
  
    // 1. Get team ID first
    const getTeamIdQuery = `
      SELECT team_id, team_name
      FROM TEAM
      WHERE LOWER(team_name) = LOWER(?)
    `;
  
    db.query(getTeamIdQuery, [teamName], (err, teamResults) => {
      if (err) return res.status(500).json({ error: err });
      if (teamResults.length === 0) return res.status(404).json({ error: 'Team not found' });
  
      const teamId = teamResults[0].team_id;
  
      // 2. Prepare the three queries
      const playersQuery = `
        SELECT 
          pl.player_id,
          pe.name,
          pl.position_to_play
        FROM TEAM_PLAYER tp
        JOIN PLAYER pl ON tp.player_id = pl.player_id
        JOIN PERSON pe ON pl.player_id = pe.kfupm_id
        WHERE tp.team_id = ?
      `;
  
      const captainQuery = `
        SELECT 
          mc.player_captain AS player_id,
          pe.name,
          pl.position_to_play
        FROM MATCH_CAPTAIN mc
        JOIN PLAYER pl ON mc.player_captain = pl.player_id
        JOIN PERSON pe ON mc.player_captain = pe.kfupm_id
        WHERE mc.team_id = ?
        LIMIT 1
      `;
  
      const supportQuery = `
        SELECT 
          pe.name,
          CASE 
            WHEN ts.support_type = 'CH' THEN 'Coach'
            WHEN ts.support_type = 'AC' THEN 'Assistant Coach'
            WHEN ts.support_type = 'RF' THEN 'Referee'
            WHEN ts.support_type = 'AR' THEN 'Assistant Referee'
            ELSE 'Staff'
          END AS role
        FROM TEAM_SUPPORT ts
        JOIN PERSON pe ON ts.support_id = pe.kfupm_id
        WHERE ts.team_id = ?
      `;
  
      // 3. Run queries
      db.query(playersQuery, [teamId], (err, players) => {
        if (err) return res.status(500).json({ error: err });
  
        db.query(captainQuery, [teamId], (err, captainResult) => {
          if (err) return res.status(500).json({ error: err });
  
          db.query(supportQuery, [teamId], (err, support) => {
            if (err) return res.status(500).json({ error: err });
  
            let finalPlayers = [...players];
            let captain = captainResult.length > 0 ? captainResult[0] : null;
  
            // 4. If captain not in players list, add him manually
            if (captain) {
              const isCaptainInPlayers = finalPlayers.some(p => p.player_id == captain.player_id);
              if (!isCaptainInPlayers) {
                finalPlayers.push(captain);
              }
            }
  
            // 5. respond
            res.json({
              team_id: teamId,
              team_name: teamResults[0].team_name,
              players: finalPlayers,
              captain: captain,
              support: support
            });
          });
        });
      });
    });
  });
  
// ==================Player Functions ================== //

// Player views his current team and tournament
app.get('/player/my-team/:username', (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const userQuery = `SELECT * FROM SYSTEM_USER WHERE username = ? AND role = 'p'`;

  db.query(userQuery, [username], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'Player not found. Please register first.' });
    }

    const playerId = userResults[0].kfupm_id;

    // Then continue to find the team...
    const findTeamQuery = `
      SELECT t.team_name
      FROM TEAM_PLAYER tp
      JOIN TEAM t ON tp.team_id = t.team_id
      WHERE tp.player_id = ?
    `;

    db.query(findTeamQuery, [playerId], (err, teamResults) => {
      if (err) return res.status(500).json({ error: err });

      if (teamResults.length === 0) {
        return res.status(404).json({ error: 'Player is not registered with any team.' });
      }

      res.json({ team: teamResults });
    });
  });
});

// Player sends a request to join a team
app.post('/player/send-request', (req, res) => {
  const { username, team_name, tournament_name } = req.body;

  // Basic validation
  if (!username || !team_name || !tournament_name) {
      return res.status(400).json({ error: 'Username, team name, and tournament name are required.' });
  }

  // Step 1: Find kfupm_id for the username (must be a player)
  const findKfupmIdQuery = `SELECT kfupm_id FROM SYSTEM_USER WHERE username = ? AND role = 'p'`;
  db.query(findKfupmIdQuery, [username], (err, userResults) => {
      if (err) return res.status(500).json({ error: err });
      if (userResults.length === 0 || !userResults[0].kfupm_id) {
          return res.status(404).json({ error: 'Player not found.' });
      }
      const player_id = userResults[0].kfupm_id;
      // Step 2: Find team_id
      const findTeamQuery = `
          SELECT team_id
          FROM TEAM
          WHERE LOWER(team_name) = LOWER(?)
          LIMIT 1
      `;
      db.query(findTeamQuery, [team_name], (err, teamResults) => {
          if (err) return res.status(500).json({ error: err });
          if (teamResults.length === 0) {
              return res.status(404).json({ error: 'Team not found.' });
          }
          const team_id = teamResults[0].team_id;
          // Step 3: Find tournament_id
          const findTournamentQuery = `
              SELECT tr_id
              FROM TOURNAMENT
              WHERE LOWER(tr_name) = LOWER(?)
              LIMIT 1
          `;
          db.query(findTournamentQuery, [tournament_name], (err, tournamentResults) => {
              if (err) return res.status(500).json({ error: err });
              if (tournamentResults.length === 0) {
                  return res.status(404).json({ error: 'Tournament not found.' });
              }
              const tr_id = tournamentResults[0].tr_id;
              // Step 4: Check if already requested
              const checkExistingRequest = `
                  SELECT *
                  FROM PLAYER_REQUEST
                  WHERE player_id = ? AND team_id = ? AND tr_id = ?
              `;
              db.query(checkExistingRequest, [player_id, team_id, tr_id], (err, existingResults) => {
                  if (err) return res.status(500).json({ error: err });
                  if (existingResults.length > 0) {
                      return res.status(400).json({ error: 'You already sent a request to this team.' });
                  }
                  // Step 5: Insert the new request (including username)
                  const insertRequest = `
                      INSERT INTO PLAYER_REQUEST (player_id, username, team_id, tr_id)
                      VALUES (?, ?, ?, ?)
                  `;
                  db.query(insertRequest, [player_id, username, team_id, tr_id], (err, insertResult) => {
                      if (err) return res.status(500).json({ error: err });
                      res.status(201).json({ message: 'Join request sent successfully!' });
                  });
              });
          });
      });
  });
});

// Player views all their join requests (pending, approved, rejected)
app.get('/player/my-requests/:username', (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }
  // Get kfupm_id for the player
  const getKfupmIdQuery = `SELECT kfupm_id FROM SYSTEM_USER WHERE username = ? AND role = 'p'`;
  db.query(getKfupmIdQuery, [username], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0 || !userResults[0].kfupm_id) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    const player_id = userResults[0].kfupm_id;
    // Fetch all requests for this player
    const query = `
      SELECT 
        pr.request_id,
        t.team_name,
        tr.tr_name AS tournament_name,
        DATE_FORMAT(pr.request_date, '%Y-%m-%d %H:%i:%s') AS request_date,
        pr.status
      FROM PLAYER_REQUEST pr
      JOIN TEAM t ON pr.team_id = t.team_id
      JOIN TOURNAMENT tr ON pr.tr_id = tr.tr_id
      WHERE pr.player_id = ?
      ORDER BY pr.request_date DESC
    `;
    db.query(query, [player_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json({ requests: results });
    });
  });
});

// ==================Login and Register ================== //

// Register
app.post('/register', (req, res) => {
  console.log('Register request:', req.body);
  const { username, password, role, email, kfupm_id, name, date_of_birth, position } = req.body;

  // Basic field presence check
  if (!username || !password || !role || !email) {
    return res.status(400).json({ error: 'Username, password, role, and email are required.' });
  }

  // Validate email format (simple check)
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format. Only Gmail addresses are accepted.' });
  }

  // Normalize role input
  let normalizedRole = role.toLowerCase();

  if (['admin', 'a'].includes(normalizedRole)) normalizedRole = 'a';
  else if (['guest', 'g'].includes(normalizedRole)) normalizedRole = 'g';
  else if (['player', 'p'].includes(normalizedRole)) normalizedRole = 'p';
  else {
    return res.status(400).json({ error: 'Role must be a, g, p, or full words like admin, guest, player.' });
  }

  // Check for duplicate email
  const checkEmailQuery = 'SELECT * FROM SYSTEM_USER WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    if (normalizedRole === 'p') {
      // Validate player fields
      if (!kfupm_id || !name || !date_of_birth || !position) {
        return res.status(400).json({ error: 'KFUPM ID, name, date of birth, and position are required for players.' });
      }
      if (!/^[0-9]{4}$/.test(kfupm_id)) {
        return res.status(400).json({ error: 'KFUPM ID must be 4 digits.' });
      }
      if (!/^[A-Za-z ]+$/.test(name)) {
        return res.status(400).json({ error: 'Name must contain only letters and spaces.' });
      }
      if (!['GK', 'DF', 'CM', 'ST'].includes(position)) {
        return res.status(400).json({ error: 'Invalid position.' });
      }
      // Use a transaction for all inserts
      db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err });
        connection.beginTransaction(err => {
          if (err) { connection.release(); return res.status(500).json({ error: err }); }
          connection.query('SELECT * FROM PERSON WHERE kfupm_id = ?', [kfupm_id], (err, personRows) => {
            if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: err }); }
            if (personRows.length > 0) {
              connection.rollback(() => connection.release());
              return res.status(400).json({ error: 'KFUPM ID already exists in PERSON.' });
            }
            connection.query('INSERT INTO PERSON (kfupm_id, name, date_of_birth) VALUES (?, ?, ?)', [kfupm_id, name, date_of_birth], (err, personResult) => {
              if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: err }); }
              connection.query('INSERT INTO PLAYER (player_id, jersey_no, position_to_play) VALUES (?, 0, ?)', [kfupm_id, position], (err, playerResult) => {
                if (err) { connection.rollback(() => connection.release()); return res.status(500).json({ error: err }); }
                connection.query('INSERT INTO SYSTEM_USER (username, password, role, email, kfupm_id) VALUES (?, ?, ?, ?, ?)', [username, password, normalizedRole, email, kfupm_id], (err, userResult) => {
                  if (err) {
                    connection.rollback(() => connection.release());
                    if (err.code === 'ER_DUP_ENTRY') {
                      return res.status(400).json({ error: 'Username already exists.' });
                    }
                    return res.status(500).json({ error: err });
                  }
                  connection.commit(err => {
                    if (err) {
                      connection.rollback(() => connection.release());
                      return res.status(500).json({ error: err });
                    }
                    connection.release();
                    return res.status(201).json({ message: 'Player registered successfully!' });
                  });
                });
              });
            });
          });
        });
      });
    } else {
      // Not a player, just insert into SYSTEM_USER with kfupm_id as NULL
      const insertQuery = `
        INSERT INTO SYSTEM_USER (username, password, role, email, kfupm_id)
        VALUES (?, ?, ?, ?, NULL)
      `;
      db.query(insertQuery, [username, password, normalizedRole, email], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists.' });
          }
          return res.status(500).json({ error: err });
        }
        res.status(201).json({ message: 'User registered successfully!' });
      });
    }
  });
});

// Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const loginQuery = `
    SELECT username, role
    FROM SYSTEM_USER
    WHERE username = ? AND password = ?
  `;

  db.query(loginQuery, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Success
    const user = results[0];
    res.status(200).json({
      message: 'Login successful!',
      user: {
        username: user.username,
        role: user.role
      }
    });
  });
});


async function updateTeamStats(match_no, team_id, win_lose, goal_score) {
  return new Promise((resolve, reject) => {
      // First get the tournament ID
      db.query(
          'SELECT tr_id FROM MATCH_PLAYED WHERE match_no = ?',
          [match_no],
          (err, matchResult) => {
              if (err) return reject(err);
              if (!matchResult.length) return reject(new Error('Match not found'));

              const tr_id = matchResult[0].tr_id;

              // Prepare updates based on win/lose/draw
              let pointsUpdate = 0;
              let wonUpdate = 0;
              let drawUpdate = 0;
              let lostUpdate = 0;

              switch(win_lose) {
                  case 'W':
                      pointsUpdate = 3;
                      wonUpdate = 1;
                      break;
                  case 'D':
                      pointsUpdate = 1;
                      drawUpdate = 1;
                      break;
                  case 'L':
                      lostUpdate = 1;
                      break;
              }

              // Update team statistics
              db.query(
                  `UPDATE TOURNAMENT_TEAM 
                   SET points = points + ?,
                       won = won + ?,
                       draw = draw + ?,
                       lost = lost + ?,
                       match_played = match_played + 1,
                       goal_for = goal_for + ?
                   WHERE team_id = ? AND tr_id = ?`,
                  [pointsUpdate, wonUpdate, drawUpdate, lostUpdate, goal_score, team_id, tr_id],
                  (err, result) => {
                      if (err) return reject(err);

                      // Update goal difference
                      db.query(
                          `UPDATE TOURNAMENT_TEAM 
                           SET goal_diff = goal_for - goal_against
                           WHERE team_id = ? AND tr_id = ?`,
                          [team_id, tr_id],
                          (err, result) => {
                              if (err) return reject(err);
                              resolve(result);
                          }
                      );
                  }
              );
          }
      );
  });
}

// ==================Email Notification System================== //

// Configure email transporter (replace with your email credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mihsn7778@gmail.com',
        pass: 'Qq100100Qq'
    }
});

// Function to send match reminder emails
async function sendMatchReminder(match_no) {
    return new Promise((resolve, reject) => {
        // Get match details
        const matchQuery = `
            SELECT mp.*, t1.team_name as team1_name, t2.team_name as team2_name,
                   DATE_FORMAT(mp.play_date, '%Y-%m-%d') as formatted_date,
                   v.venue_name
            FROM MATCH_PLAYED mp
            JOIN TEAM t1 ON mp.team_id1 = t1.team_id
            JOIN TEAM t2 ON mp.team_id2 = t2.team_id
            JOIN VENUE v ON mp.venue_id = v.venue_id
            WHERE mp.match_no = ?`;
        db.query(matchQuery, [match_no], async (err, matchResults) => {
            if (err) return reject(err);
            if (!matchResults.length) return reject(new Error('Match not found'));
            const match = matchResults[0];
            // Get team members' emails (only valid Gmail)
            const membersQuery = `
                SELECT DISTINCT su.email, su.username, t.team_name
                FROM SYSTEM_USER su
                JOIN PLAYER p ON su.username = p.player_id
                JOIN TEAM_PLAYER tp ON p.player_id = tp.player_id
                JOIN TEAM t ON tp.team_id = t.team_id
                WHERE t.team_id IN (?, ?) AND su.email IS NOT NULL AND su.email LIKE '%@gmail.com'`;
            db.query(membersQuery, [match.team_id1, match.team_id2], async (err, members) => {
                if (err) return reject(err);
                try {
                    for (const member of members) {
                        const mailOptions = {
                            from: 'mihsn7778@gmail.com',
                            to: member.email,
                            subject: `Match Reminder: ${match.team1_name} vs ${match.team2_name}`,
                            html: `
                                <h2>Match Reminder</h2>
                                <p>Hello ${member.username},</p>
                                <p>This is a reminder for your upcoming match:</p>
                                <ul>
                                    <li><strong>Teams:</strong> ${match.team1_name} vs ${match.team2_name}</li>
                                    <li><strong>Date:</strong> ${match.formatted_date}</li>
                                    <li><strong>Venue:</strong> ${match.venue_name}</li>
                                </ul>
                                <p>Good luck!</p>
                            `
                        };
                        await transporter.sendMail(mailOptions);
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    });
}

// Endpoint to send match reminders
app.post('/api/send-match-reminder', async (req, res) => {
    const { match_no } = req.body;

    if (!match_no) {
        return res.status(400).json({ error: 'Match number is required' });
    }

    try {
        await sendMatchReminder(match_no);
        res.json({ message: 'Match reminders sent successfully' });
    } catch (error) {
        console.error('Error sending match reminders:', error);
        res.status(500).json({ error: 'Failed to send match reminders' });
    }
});

// ==================Group Position Updates================== //
async function updateGroupPositions(tr_id, team_group) {
    return new Promise((resolve, reject) => {
        // Get all teams in the group sorted by points and goal difference
        const teamsQuery = `
            SELECT team_id
            FROM TOURNAMENT_TEAM
            WHERE tr_id = ? AND team_group = ?
            ORDER BY points DESC, goal_diff DESC`;

        db.query(teamsQuery, [tr_id, team_group], async (err, teams) => {
            if (err) return reject(err);

            try {
                // Update positions for each team
                for (let i = 0; i < teams.length; i++) {
                    await new Promise((resolve, reject) => {
                        db.query(
                            `UPDATE TOURNAMENT_TEAM
                             SET group_position = ?
                             WHERE tr_id = ? AND team_id = ?`,
                            [i + 1, tr_id, teams[i].team_id],
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            }
                        );
                    });
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Modify the existing updateTeamStats function to include group position updates
const originalUpdateTeamStats = updateTeamStats;
updateTeamStats = async function(match_no, team_id, win_lose, goal_score) {
    try {
        // Call the original function first
        await originalUpdateTeamStats(match_no, team_id, win_lose, goal_score);

        // Then update group positions
        const teamQuery = `
            SELECT tt.tr_id, tt.team_group
            FROM TOURNAMENT_TEAM tt
            WHERE tt.team_id = ?`;

        return new Promise((resolve, reject) => {
            db.query(teamQuery, [team_id], async (err, results) => {
                if (err) return reject(err);
                if (!results.length) return reject(new Error('Team not found in tournament'));

                try {
                    await updateGroupPositions(results[0].tr_id, results[0].team_group);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error in updateTeamStats:', error);
        throw error;
    }
};

// ==================Input Validation Middleware================== //
function validateMatchInput(req, res, next) {
    const requiredFields = [
        'match_no', 'play_stage', 'play_date', 'team_id1', 'team_id2',
        'results', 'decided_by', 'goal_score', 'venue_id', 'audience',
        'player_of_match', 'stop1_sec', 'stop2_sec', 'tr_id'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            missingFields
        });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.play_date)) {
        return res.status(400).json({
            error: 'Invalid date format. Use YYYY-MM-DD'
        });
    }

    // Validate goal score format
    if (!/^\d+-\d+$/.test(req.body.goal_score)) {
        return res.status(400).json({
            error: 'Invalid goal score format. Use format like "2-1"'
        });
    }

    next();
}

// Apply validation middleware to match creation endpoint
app.post('/api/matches', validateMatchInput);


// Get all teams
app.get('/teams', (req, res) => {
  db.query('SELECT team_id, team_name FROM TEAM', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all tournaments for a given team
app.get('/team/:team_id/tournaments', (req, res) => {
  const { team_id } = req.params;
  const query = `
    SELECT t.tr_id, t.tr_name
    FROM TOURNAMENT t
    JOIN TOURNAMENT_TEAM tt ON t.tr_id = tt.tr_id
    WHERE tt.team_id = ?
  `;
  db.query(query, [team_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all groups for a given tournament
app.get('/tournament-groups/:tournament_id', (req, res) => {
  const { tournament_id } = req.params;
  db.query('SELECT DISTINCT team_group FROM TOURNAMENT_TEAM WHERE tr_id = ?', [tournament_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(r => r.team_group));
  });
});

// Get all players for a given team and tournament
app.get('/team-players', (req, res) => {
  const { team_id, tr_id } = req.query;
  if (!team_id || !tr_id) {
    return res.status(400).json({ error: 'team_id and tr_id are required.' });
  }
  const query = `
    SELECT p.name
    FROM TEAM_PLAYER tp
    JOIN PERSON p ON tp.player_id = p.kfupm_id
    WHERE tp.team_id = ? AND tp.tr_id = ?
  `;
  db.query(query, [team_id, tr_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results.map(r => r.name));
  });
});

// Get all teams and their tournaments
app.get('/tournament-teams', (req, res) => {
  const query = `
    SELECT t.team_name, tr.tr_name
    FROM TOURNAMENT_TEAM tt
    JOIN TEAM t ON tt.team_id = t.team_id
    JOIN TOURNAMENT tr ON tt.tr_id = tr.tr_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ==================Admin Match Scheduling================== //

// Get all tournaments (id, name, start/end dates)
app.get('/admin/tournaments', (req, res) => {
  db.query('SELECT tr_id, tr_name, start_date, end_date FROM TOURNAMENT', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all teams in a tournament (with group info)
app.get('/admin/tournament/:tr_id/teams', (req, res) => {
  const { tr_id } = req.params;
  const query = `
    SELECT tt.team_id, t.team_name, tt.team_group
    FROM TOURNAMENT_TEAM tt
    JOIN TEAM t ON tt.team_id = t.team_id
    WHERE tt.tr_id = ?
    ORDER BY t.team_name ASC
  `;
  db.query(query, [tr_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all available venues
app.get('/admin/venues', (req, res) => {
  db.query('SELECT venue_id, venue_name, venue_capacity FROM VENUE WHERE venue_status = "Y"', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Schedule a new match
app.post('/admin/schedule-match', async (req, res) => {
  try {
    const { tr_id, team_id1, team_id2, play_date, play_stage, venue_id } = req.body;
    // 1. Teams must be different
    if (!tr_id || !team_id1 || !team_id2 || !play_date || !play_stage) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (team_id1 === team_id2) {
      return res.status(400).json({ error: 'Teams must be different.' });
    }
    // 2. Both teams must be in the tournament
    const teamCountQuery = 'SELECT COUNT(*) AS count FROM TOURNAMENT_TEAM WHERE tr_id = ? AND team_id IN (?, ?)';
    const [teamCount] = await db.promise().query(teamCountQuery, [tr_id, team_id1, team_id2]);
    if (teamCount[0].count !== 2) {
      return res.status(400).json({ error: 'Both teams must be registered in the selected tournament.' });
    }
    // 3. Play date must be within tournament dates
    const [tournament] = await db.promise().query('SELECT start_date, end_date FROM TOURNAMENT WHERE tr_id = ?', [tr_id]);
    if (!tournament.length) return res.status(400).json({ error: 'Tournament not found.' });
    const start = new Date(tournament[0].start_date);
    const end = new Date(tournament[0].end_date);
    const playDate = new Date(play_date);
    if (playDate < start || playDate > end) {
      return res.status(400).json({ error: `Play date must be between ${tournament[0].start_date} and ${tournament[0].end_date}.` });
    }
    // 4. If group stage, teams must be in the same group
    if (play_stage.toLowerCase().includes('group')) {
      const [groups] = await db.promise().query(
        'SELECT team_group FROM TOURNAMENT_TEAM WHERE tr_id = ? AND team_id IN (?, ?)',
        [tr_id, team_id1, team_id2]
      );
      if (groups.length !== 2 || groups[0].team_group !== groups[1].team_group) {
        return res.status(400).json({ error: 'For group stage, both teams must be in the same group.' });
      }
    }
    // 5. Venue must be available (if provided)
    if (venue_id) {
      const [venue] = await db.promise().query('SELECT venue_status FROM VENUE WHERE venue_id = ?', [venue_id]);
      if (!venue.length || venue[0].venue_status !== 'Y') {
        return res.status(400).json({ error: 'Selected venue is not available.' });
      }
      // 6. Prevent double-booking
      const [venueConflict] = await db.promise().query(
        'SELECT COUNT(*) AS count FROM MATCH_PLAYED WHERE venue_id = ? AND play_date = ?',
        [venue_id, play_date]
      );
      if (venueConflict[0].count > 0) {
        return res.status(400).json({ error: 'Another match is already scheduled at this venue on this date.' });
      }
    }
    // 7. No duplicate match (same teams, same tournament, same date)
    const [dupMatch] = await db.promise().query(
      'SELECT COUNT(*) AS count FROM MATCH_PLAYED WHERE tr_id = ? AND ((team_id1 = ? AND team_id2 = ?) OR (team_id1 = ? AND team_id2 = ?)) AND play_date = ?',
      [tr_id, team_id1, team_id2, team_id2, team_id1, play_date]
    );
    if (dupMatch[0].count > 0) {
      return res.status(400).json({ error: 'A match between these teams is already scheduled on this date in this tournament.' });
    }
    // 8. Insert match (results, goal_score, etc. as NULL)
    const insertQuery = `
      INSERT INTO MATCH_PLAYED (play_stage, play_date, team_id1, team_id2, results, decided_by, goal_score, venue_id, audience, player_of_match, stop1_sec, stop2_sec, tr_id)
      VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, ?)
    `;
    const [insertResult] = await db.promise().query(insertQuery, [play_stage, play_date, team_id1, team_id2, venue_id || null, tr_id]);
    // Fetch the new match_no
    const [matchRows] = await db.promise().query('SELECT LAST_INSERT_ID() AS match_no');
    const match_no = matchRows[0].match_no;
    // Try to send email reminders (do not block scheduling if it fails)
    try {
      await sendMatchReminder(match_no);
    } catch (emailErr) {
      console.error('Error sending match reminder emails:', emailErr);
    }
    res.status(201).json({ message: 'Match scheduled successfully!' });
  } catch (err) {
    console.error('Error scheduling match:', err);
    res.status(500).json({ error: 'Server error scheduling match.' });
  }
});

// Create a new team (admin)
app.post('/admin/create-team', (req, res) => {
  const { team_name } = req.body;
  if (!team_name) {
    return res.status(400).json({ error: 'Team name is required.' });
  }
  // Check for duplicate team name (case-insensitive)
  const checkQuery = 'SELECT * FROM TEAM WHERE LOWER(team_name) = LOWER(?)';
  db.query(checkQuery, [team_name], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) {
      return res.status(400).json({ error: 'A team with this name already exists.' });
    }
    // Insert new team
    const insertQuery = 'INSERT INTO TEAM (team_name) VALUES (?)';
    db.query(insertQuery, [team_name], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Team created successfully!' });
    });
  });
});

// ==================Error Handling Middleware================== //
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found'
  });
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
