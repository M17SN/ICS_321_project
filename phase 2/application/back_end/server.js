// import the required packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// to connect to MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Qq100100Qq@%', // My SQL password
    database: 'soccerdb'
});

db.connect(err => {
if (err) {
    console.error('Database connection error:', err);
    return;
}
console.log('Successfully connected to MySQL database ✅');
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
  const { tr_id, tr_name, start_date, end_date } = req.body;

  if (!tr_id || !tr_name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Please provide all tournament fields' });
  }

  // Check if tr_id already exists
  const checkQuery = 'SELECT * FROM TOURNAMENT WHERE tr_id = ?';
  db.query(checkQuery, [tr_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      return res.status(400).json({ error: 'Tournament ID already exists' });
    }

    // Insert tournament
    const insertQuery = `
      INSERT INTO TOURNAMENT (tr_id, tr_name, start_date, end_date)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [tr_id, tr_name, start_date, end_date], (err, result) => {
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

          const defaultMatchNo = 1; // ⚡ later we can improve by asking user for match_no if needed

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
            return res.status(400).json({ error: 'Player is already approved for this team in this tournament.' });
          }

          // Step 2: Check if player already playing for another team in the same tournament
          const checkTournamentQuery = `
            SELECT * FROM TEAM_PLAYER
            WHERE player_id = ? AND tr_id = ?
          `;

          db.query(checkTournamentQuery, [player_id, tr_id], (err, tournamentResult) => {
            if (err) return res.status(500).json({ error: err });
            if (tournamentResult.length > 0) {
              return res.status(400).json({ error: 'Player is already registered with another team in this tournament.' });
            }

            // Step 3: Insert player into TEAM_PLAYER
            const insertQuery = `
              INSERT INTO TEAM_PLAYER (player_id, team_id, tr_id)
              VALUES (?, ?, ?)
            `;

            db.query(insertQuery, [player_id, team_id, tr_id], (err, insertResult) => {
              if (err) return res.status(500).json({ error: err });

              res.status(201).json({ message: 'Player approved and added to team successfully!' });
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
  

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
