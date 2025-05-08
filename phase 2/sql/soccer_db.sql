-- CREATE DATABASE soccerdb;
USE soccerdb;
CREATE TABLE TOURNAMENT (
tr_id numeric NOT NULL,
tr_name character varying(40) NOT NULL,
start_date date NOT NULL,
end_date date NOT NULL,
PRIMARY KEY (tr_id) );
INSERT INTO TOURNAMENT VALUES (1, 'Faculty Tournament', '2023-03-10', '2023-03-25');
INSERT INTO TOURNAMENT VALUES (2, 'Open Tournament', '2023-03-15', '2023-03-30');
INSERT INTO TOURNAMENT VALUES (3, 'Student Tournament', '2022-12-10', '2022-12-02');
INSERT INTO TOURNAMENT VALUES (4, 'Staff Tournament', '2023-02-15', '2023-02-25');
INSERT INTO TOURNAMENT VALUES (5, 'Annual Tournament', '2023-01-01', '2023-01-15');
CREATE TABLE VENUE (
venue_id numeric NOT NULL,
venue_name character varying(30) NOT NULL,
venue_status character(1) NOT NULL,
venue_capacity numeric NOT NULL,
PRIMARY KEY (venue_id) );
INSERT INTO VENUE VALUES (11, 'Main Stadium', 'Y', 20000);
INSERT INTO VENUE VALUES (22, 'Indoor Stadium', 'Y', 1000);
INSERT INTO VENUE VALUES (33, 'Jabal Field', 'N', 500);
INSERT INTO VENUE VALUES (44, 'Student Field', 'Y', 2000);
CREATE TABLE TEAM (
team_id numeric NOT NULL,
team_name character varying(30) NOT NULL,
PRIMARY KEY (team_id));
INSERT INTO TEAM VALUES (1214,'CCM');
INSERT INTO TEAM VALUES (1215,'KBS');
INSERT INTO TEAM VALUES (1216,'CEP');
INSERT INTO TEAM VALUES (1217,'CPG');
INSERT INTO TEAM VALUES (1218,'CCM');
INSERT INTO TEAM VALUES (1219,'CDB');
INSERT INTO TEAM VALUES (1220,'CGS');
CREATE TABLE TOURNAMENT_TEAM (
team_id numeric NOT NULL,
tr_id numeric NOT NULL,
team_group character(1) NOT NULL,
match_played numeric NOT NULL,
won numeric NOT NULL,
draw numeric NOT NULL,
lost numeric NOT NULL,
goal_for numeric NOT NULL,
goal_against numeric NOT NULL,
goal_diff numeric NOT NULL,
points numeric NOT NULL,
group_position numeric NOT NULL,
PRIMARY KEY (team_id, tr_id),
FOREIGN KEY (tr_id) REFERENCES TOURNAMENT (tr_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id));
INSERT INTO TOURNAMENT_TEAM VALUES (1214,1,'A',3,0,3,0,4,4,0,3,1);
INSERT INTO TOURNAMENT_TEAM VALUES (1215,1,'B',3,1,1,1,3,4,-1,4,2);
INSERT INTO TOURNAMENT_TEAM VALUES (1216,2,'C',3,1,1,1,0,0,0,4,2);
INSERT INTO TOURNAMENT_TEAM VALUES (1217,2,'A',3,1,1,1,1,4,-3,4,1);
INSERT INTO TOURNAMENT_TEAM VALUES (1218,3,'A',3,1,1,1,2,4,-2,4,3);
INSERT INTO TOURNAMENT_TEAM VALUES (1219,3,'B',3,1,1,1,4,2,2,4,1);
INSERT INTO TOURNAMENT_TEAM VALUES (1220,3,'C',3,1,1,1,1,2,-1,4,2);
INSERT INTO TOURNAMENT_TEAM VALUES (1214,3,'C',3,1,1,1,1,2,-1,4,2);
CREATE TABLE PERSON (
kfupm_id numeric NOT NULL,
name character varying(40) NOT NULL,
date_of_birth date,
PRIMARY KEY (kfupm_id));
INSERT INTO PERSON VALUES (1001, 'Ahmed', '1999-03-10');
INSERT INTO PERSON VALUES (1003, 'Saeed', '2005-03-10');
INSERT INTO PERSON VALUES (1005, 'Majid', '1996-03-10');
INSERT INTO PERSON VALUES (1007, 'Ahmed', '2001-03-10');
INSERT INTO PERSON VALUES (1009, 'Fahd', '2008-03-10');
INSERT INTO PERSON VALUES (1011, 'Mohammed', '1998-03-10');
INSERT INTO PERSON VALUES (1013, 'Raed', '1999-07-10');
INSERT INTO PERSON VALUES (1015, 'Mousa', '2009-03-10');
INSERT INTO PERSON VALUES (1017, 'Ali', '2009-03-10');
INSERT INTO PERSON VALUES (1019, 'Yasir', '2007-03-10');
INSERT INTO PERSON VALUES (1021, 'Ashraf', '2010-03-10');
INSERT INTO PERSON VALUES (1023, 'Hassan', '2004-03-10');
INSERT INTO PERSON VALUES (1025, 'Abdullah', '2003-03-10');
INSERT INTO PERSON VALUES (1027, 'Bassam', '2005-03-10');
INSERT INTO PERSON VALUES (1029, 'Ashraf', '2004-03-10');
INSERT INTO PERSON VALUES (9001,'Carlos', '2004-03-10');
INSERT INTO PERSON VALUES (9003,'Farhan', '2004-03-10');
INSERT INTO PERSON VALUES (9002,'Jameel', '2004-03-10');
INSERT INTO PERSON VALUES (7001,'Hassan', '2004-03-10');
INSERT INTO PERSON VALUES (7002,'Robert', '2004-03-10');
INSERT INTO PERSON VALUES (7003,'Fayez', '2004-03-10');
INSERT INTO PERSON VALUES (7004, 'Mark', '2004-03-10');
INSERT INTO PERSON VALUES (7005,'Ahmad', '2004-03-10');
INSERT INTO PERSON VALUES (7006,'Faisal', '2004-03-10');
INSERT INTO PERSON VALUES (7007,'Noman', '2004-03-10');
INSERT INTO PERSON VALUES (3001,'Ahmed', '2004-03-10');
INSERT INTO PERSON VALUES (3003,'Saied', '2004-03-10');
INSERT INTO PERSON VALUES (3002,'Fadhel', '2004-03-10');
INSERT INTO PERSON VALUES (3004,'Morad', '2004-03-10');
INSERT INTO PERSON VALUES (3005,'Farid', '2004-03-10');
CREATE TABLE PLAYING_POSITION (
position_id character(2) NOT NULL,
position_desc character varying(15) NOT NULL,
PRIMARY KEY (position_id) );
INSERT INTO PLAYING_POSITION VALUES ('GK', 'Goalkeepers');
INSERT INTO PLAYING_POSITION VALUES ('DF', 'Defenders');
INSERT INTO PLAYING_POSITION VALUES ('MF', 'Midfielders');
INSERT INTO PLAYING_POSITION VALUES ('FD', 'Forwards');
CREATE TABLE PLAYER (
player_id numeric NOT NULL,
jersey_no numeric NOT NULL,
position_to_play character(2) NOT NULL,
PRIMARY KEY (player_id),
FOREIGN KEY (player_id) REFERENCES PERSON (kfupm_id),
FOREIGN KEY (position_to_play) REFERENCES PLAYING_POSITION (position_id));
INSERT INTO PLAYER VALUES (1001,1, 'GK');
INSERT INTO PLAYER VALUES (1003,2, 'DF');
INSERT INTO PLAYER VALUES (1005,3, 'DF');
INSERT INTO PLAYER VALUES (1007,4, 'MF');
INSERT INTO PLAYER VALUES (1009,5, 'FD');
INSERT INTO PLAYER VALUES (1011,6, 'FD');
CREATE TABLE TEAM_PLAYER (
player_id numeric NOT NULL,
team_id numeric NOT NULL,
tr_id numeric NOT NULL,
PRIMARY KEY (player_id, team_id, tr_id),
FOREIGN KEY (player_id) REFERENCES PLAYER (player_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (tr_id) REFERENCES TOURNAMENT (tr_id));
INSERT INTO TEAM_PLAYER VALUES (1001,1214,1);
INSERT INTO TEAM_PLAYER VALUES (1003,1216,2);
INSERT INTO TEAM_PLAYER VALUES (1001,1215,2);
INSERT INTO TEAM_PLAYER VALUES (1003,1216,1);
INSERT INTO TEAM_PLAYER VALUES (1005,1216,1);
INSERT INTO TEAM_PLAYER VALUES (1005,1218,2);
INSERT INTO TEAM_PLAYER VALUES (1007,1217,1);
INSERT INTO TEAM_PLAYER VALUES (1009,1218,1);
INSERT INTO TEAM_PLAYER VALUES (1011,1219,3);
CREATE TABLE SUPPORT (
support_type character(2) NOT NULL,
support_desc character varying(15) NOT NULL,
PRIMARY KEY (support_type));
INSERT INTO SUPPORT VALUES ('RF', 'REFEREE');
INSERT INTO SUPPORT VALUES ('AR', 'ASST REFEREE');
INSERT INTO SUPPORT VALUES ('CH', 'COACH');
INSERT INTO SUPPORT VALUES ('AC', 'ASST COACH');
CREATE TABLE TEAM_SUPPORT (
support_id numeric NOT NULL,
team_id numeric NOT NULL,
tr_id numeric NOT NULL,
support_type character(2) NOT NULL,
PRIMARY KEY (support_id, team_id, tr_id),
FOREIGN KEY (support_id) REFERENCES PERSON (kfupm_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (tr_id) REFERENCES TOURNAMENT (tr_id),
FOREIGN KEY (support_type) REFERENCES SUPPORT (support_type));
INSERT INTO TEAM_SUPPORT VALUES (9001,1214,1,'CH');
INSERT INTO TEAM_SUPPORT VALUES (9002,1216,1,'CH');
INSERT INTO TEAM_SUPPORT VALUES (7001,1214,1,'AC');
INSERT INTO TEAM_SUPPORT VALUES (7002,1216,1,'AC');
CREATE TABLE MATCH_PLAYED (
match_no numeric NOT NULL,
play_stage character(1) NOT NULL,
play_date date NOT NULL,
team_id1 numeric NOT NULL,
team_id2 numeric NOT NULL,
results character(5) NOT NULL,
decided_by character(1) NOT NULL,
goal_score character(5) NOT NULL,
venue_id numeric NOT NULL,
audience numeric NOT NULL,
player_of_match numeric NOT NULL,
stop1_sec numeric NOT NULL,
stop2_sec numeric NOT NULL,
PRIMARY KEY (match_no),
FOREIGN KEY (team_id1) REFERENCES TEAM (team_id),
FOREIGN KEY (team_id2) REFERENCES TEAM (team_id),
FOREIGN KEY (venue_id) REFERENCES VENUE (venue_id),
FOREIGN KEY (player_of_match) REFERENCES PLAYER (player_id));
INSERT INTO MATCH_PLAYED VALUES (1, 'G', '2020-03-11', 1214, 1215, 'WIN', 'N', '2-1',11,5113,1007,131,242);
INSERT INTO MATCH_PLAYED VALUES (2, 'G', '2020-03-11', 1215,1216,'DRAW', 'N', '1-1',22,510,1009,111,272);
INSERT INTO MATCH_PLAYED VALUES (3, 'F', '2020-03-12', 1214, 1215,'LOSS', 'N', '1-3',33,2510,1003,111,172);
INSERT INTO MATCH_PLAYED VALUES (4, 'G', '2020-03-13', 1214, 1215,'WIN', 'N', '5-1',11,1510,1011,111,372);
CREATE TABLE match_details (
match_no numeric NOT NULL,
team_id numeric NOT NULL,
win_lose character(1) NOT NULL,
decided_by character(1) NOT NULL,
goal_score numeric NOT NULL,
penalty_score numeric,
player_gk numeric NOT NULL,
PRIMARY KEY (match_no, team_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_gk) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO match_details VALUES (1, 1214, 'W', 'N', 1, 0,1001);
INSERT INTO match_details VALUES (2, 1215, 'W', 'N', 2, 0,1003);
INSERT INTO match_details VALUES (2, 1217, 'L', 'N', 2, 0,1003);
INSERT INTO match_details VALUES (1, 1216, 'L', 'N', 1, 0,1001);
INSERT INTO match_details VALUES (3, 1215, 'W', 'N', 2, 0,1003);
INSERT INTO match_details VALUES (3, 1214, 'W', 'N', 2, 0,1005);
CREATE TABLE MATCH_SUPPORT (
match_no numeric NOT NULL,
support_id numeric NOT NULL,
support_type character(2) NOT NULL,
PRIMARY KEY (match_no, support_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no),
FOREIGN KEY (support_id) REFERENCES PERSON (kfupm_id));
INSERT INTO MATCH_SUPPORT VALUES (1,3002,'RF');
INSERT INTO MATCH_SUPPORT VALUES (1,3003,'AR');
INSERT INTO MATCH_SUPPORT VALUES (2,3001,'RF');
INSERT INTO MATCH_SUPPORT VALUES (2,3003,'AR');
CREATE TABLE GOAL_DETAILS (
goal_id numeric NOT NULL,
match_no numeric NOT NULL,
player_id numeric NOT NULL,
team_id numeric NOT NULL,
goal_time numeric NOT NULL,
goal_type character(1) NOT NULL,
play_stage character(1) NOT NULL,
goal_schedule character(2) NOT NULL,
goal_half numeric,
PRIMARY KEY (goal_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_id) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO GOAL_DETAILS VALUES (1, 1, 1003, 1214, 72, 'N', 'G', 'NT',2);
INSERT INTO GOAL_DETAILS VALUES (2, 1, 1005, 1214, 82, 'N', 'G', 'NT',2);
INSERT INTO GOAL_DETAILS VALUES (3, 1, 1003, 1214, 77, 'N', 'G', 'NT',2);
INSERT INTO GOAL_DETAILS VALUES (4, 1, 1005, 1214, 92, 'N', 'G', 'NT',1);
CREATE TABLE PENALTY_SHOOTOUT (
kick_id numeric NOT NULL,
match_no numeric NOT NULL,
team_id numeric NOT NULL,
player_id numeric NOT NULL,
score_goal character(1) NOT NULL,
kick_no numeric NOT NULL,
PRIMARY KEY (kick_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_id) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO PENALTY_SHOOTOUT VALUES (1, 1, 1215, 1003, 'N', 1);
INSERT INTO PENALTY_SHOOTOUT VALUES (2, 2, 1217, 1007, 'Y', 2);
CREATE TABLE PLAYER_BOOKED (
match_no numeric NOT NULL,
team_id numeric NOT NULL,
player_id numeric NOT NULL,
booking_time numeric NOT NULL,
sent_off character(1),
play_schedule character(2) NOT NULL,
play_half numeric NOT NULL,
PRIMARY KEY (match_no, team_id, player_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_id) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO PLAYER_BOOKED VALUES (1, 1215, 1003, 36, 'N','NT', 1);
INSERT INTO PLAYER_BOOKED VALUES (1, 1217, 1005, 76, 'Y','NT', 2);
CREATE TABLE PLAYER_IN_OUT (
match_no numeric NOT NULL,
team_id numeric NOT NULL,
player_id numeric NOT NULL,
in_out character(1) NOT NULL,
time_in_out numeric NOT NULL,
play_schedule character(2) NOT NULL,
play_half numeric NOT NULL,
PRIMARY KEY (match_no, team_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_id) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO PLAYER_IN_OUT VALUES (1, 1214, 1003, 'I',73,'NT', 2);
INSERT INTO PLAYER_IN_OUT VALUES (2, 1215, 1007, 'O',33,'NT', 1);
CREATE TABLE MATCH_CAPTAIN (
match_no numeric NOT NULL,
team_id numeric NOT NULL,
player_captain numeric NOT NULL,
PRIMARY KEY (match_no, team_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_captain) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO MATCH_CAPTAIN VALUES (1, 1214, 1005);
INSERT INTO MATCH_CAPTAIN VALUES (2, 1215, 1003);
CREATE TABLE PENALTY_GK (
match_no numeric NOT NULL,
team_id numeric NOT NULL,
player_gk numeric NOT NULL,
PRIMARY KEY (match_no, team_id),
FOREIGN KEY (team_id) REFERENCES TEAM (team_id),
FOREIGN KEY (player_gk) REFERENCES PLAYER (player_id),
FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED (match_no));
INSERT INTO PENALTY_GK VALUES (1, 1214, 1003);
INSERT INTO PENALTY_GK VALUES (1, 1215, 1007);
ALTER TABLE MATCH_PLAYED 
ADD COLUMN tr_id numeric NULL;
UPDATE MATCH_PLAYED SET tr_id = 1 WHERE match_no IN (1,3,4);  -- Faculty Tournament
UPDATE MATCH_PLAYED SET tr_id = 2 WHERE match_no = 2;         -- Open Tournament
ALTER TABLE MATCH_PLAYED 
MODIFY tr_id numeric NOT NULL,
ADD FOREIGN KEY (tr_id) REFERENCES TOURNAMENT(tr_id);
CREATE TABLE SYSTEM_USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    role CHAR(1) NOT NULL CHECK (role IN ('a', 'g', 'p')) -- a = admin, g = guest, p = player
);
ALTER TABLE SYSTEM_USER
ADD COLUMN email VARCHAR(50) NOT NULL;
CREATE TABLE PLAYER_REQUEST (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id numeric NOT NULL,
    team_id numeric NOT NULL,
    tr_id numeric NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) DEFAULT 'pending',
    FOREIGN KEY (player_id) REFERENCES PLAYER(player_id),
    FOREIGN KEY (team_id) REFERENCES TEAM(team_id),
    FOREIGN KEY (tr_id) REFERENCES TOURNAMENT(tr_id)
);
CREATE TABLE EMAIL_NOTIFICATION (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    match_no numeric NOT NULL,
    team_id numeric NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no),
    FOREIGN KEY (team_id) REFERENCES TEAM(team_id)
);
ALTER TABLE match_played DROP FOREIGN KEY match_played_ibfk_5;
ALTER TABLE player_request DROP FOREIGN KEY player_request_ibfk_3;
ALTER TABLE team_player DROP FOREIGN KEY team_player_ibfk_3;
ALTER TABLE team_support DROP FOREIGN KEY team_support_ibfk_3;
ALTER TABLE tournament_team DROP FOREIGN KEY tournament_team_ibfk_1;
ALTER TABLE match_played MODIFY tr_id INT NOT NULL;
ALTER TABLE player_request MODIFY tr_id INT NOT NULL;
ALTER TABLE team_player MODIFY tr_id INT NOT NULL;
ALTER TABLE team_support MODIFY tr_id INT NOT NULL;
ALTER TABLE tournament_team MODIFY tr_id INT NOT NULL;
ALTER TABLE tournament DROP PRIMARY KEY;
ALTER TABLE tournament MODIFY tr_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE match_played
  ADD CONSTRAINT match_played_ibfk_5 FOREIGN KEY (tr_id) REFERENCES tournament(tr_id);

ALTER TABLE player_request
  ADD CONSTRAINT player_request_ibfk_3 FOREIGN KEY (tr_id) REFERENCES tournament(tr_id);

ALTER TABLE team_player
  ADD CONSTRAINT team_player_ibfk_3 FOREIGN KEY (tr_id) REFERENCES tournament(tr_id);

ALTER TABLE team_support
  ADD CONSTRAINT team_support_ibfk_3 FOREIGN KEY (tr_id) REFERENCES tournament(tr_id);

ALTER TABLE tournament_team
  ADD CONSTRAINT tournament_team_ibfk_1 FOREIGN KEY (tr_id) REFERENCES tournament(tr_id);
UPDATE TOURNAMENT SET start_date = '2023-03-10', end_date = '2023-03-25' WHERE tr_id = 1;
UPDATE TOURNAMENT SET start_date = '2023-03-15', end_date = '2023-03-30' WHERE tr_id = 2;
UPDATE TOURNAMENT SET start_date = '2022-12-01', end_date = '2022-12-09' WHERE tr_id = 3;
UPDATE TOURNAMENT SET start_date = '2023-02-15', end_date = '2023-02-25' WHERE tr_id = 4;
UPDATE TOURNAMENT SET start_date = '2023-01-01', end_date = '2023-01-15' WHERE tr_id = 5;
ALTER TABLE MATCH_PLAYED MODIFY play_stage VARCHAR(30);
ALTER TABLE MATCH_PLAYED MODIFY results VARCHAR(5) NULL;
-- 1. Drop the existing foreign key constraint (if it exists)
ALTER TABLE MATCH_PLAYED DROP FOREIGN KEY match_played_ibfk_4;

-- 2. Alter columns (adjust player_of_match type as needed)
ALTER TABLE MATCH_PLAYED 
  MODIFY results VARCHAR(5) NULL,
  MODIFY decided_by CHAR(1) NULL,
  MODIFY goal_score VARCHAR(5) NULL,
  MODIFY audience INT NULL,
  MODIFY player_of_match decimal(10,0) NULL,
  MODIFY stop1_sec INT NULL,
  MODIFY stop2_sec INT NULL;

-- 3. Re-add the foreign key constraint
ALTER TABLE MATCH_PLAYED
  ADD CONSTRAINT match_played_ibfk_4
  FOREIGN KEY (player_of_match) REFERENCES PLAYER(player_id);
ALTER TABLE email_notification DROP FOREIGN KEY email_notification_ibfk_1;
ALTER TABLE goal_details DROP FOREIGN KEY goal_details_ibfk_3;
ALTER TABLE match_captain DROP FOREIGN KEY match_captain_ibfk_3;
ALTER TABLE match_details DROP FOREIGN KEY match_details_ibfk_3;
ALTER TABLE match_support DROP FOREIGN KEY match_support_ibfk_1;
ALTER TABLE penalty_gk DROP FOREIGN KEY penalty_gk_ibfk_3;
ALTER TABLE penalty_shootout DROP FOREIGN KEY penalty_shootout_ibfk_3;
ALTER TABLE player_booked DROP FOREIGN KEY player_booked_ibfk_3;
ALTER TABLE player_in_out DROP FOREIGN KEY player_in_out_ibfk_3;
ALTER TABLE MATCH_PLAYED DROP PRIMARY KEY;
ALTER TABLE MATCH_PLAYED
MODIFY match_no INT AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE email_notification MODIFY match_no INT;
ALTER TABLE goal_details MODIFY match_no INT;
ALTER TABLE match_captain MODIFY match_no INT;
ALTER TABLE match_details MODIFY match_no INT;
ALTER TABLE match_support MODIFY match_no INT;
ALTER TABLE penalty_gk MODIFY match_no INT;
ALTER TABLE penalty_shootout MODIFY match_no INT;
ALTER TABLE player_booked MODIFY match_no INT;
ALTER TABLE player_in_out MODIFY match_no INT;
ALTER TABLE email_notification
  ADD CONSTRAINT email_notification_ibfk_1 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE goal_details
  ADD CONSTRAINT goal_details_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE match_captain
  ADD CONSTRAINT match_captain_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE match_details
  ADD CONSTRAINT match_details_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE match_support
  ADD CONSTRAINT match_support_ibfk_1 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE penalty_gk
  ADD CONSTRAINT penalty_gk_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE penalty_shootout
  ADD CONSTRAINT penalty_shootout_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE player_booked
  ADD CONSTRAINT player_booked_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);

ALTER TABLE player_in_out
  ADD CONSTRAINT player_in_out_ibfk_3 FOREIGN KEY (match_no) REFERENCES MATCH_PLAYED(match_no);
ALTER TABLE email_notification DROP FOREIGN KEY email_notification_ibfk_2;
ALTER TABLE goal_details DROP FOREIGN KEY goal_details_ibfk_1;
ALTER TABLE match_captain DROP FOREIGN KEY match_captain_ibfk_1;
ALTER TABLE match_details DROP FOREIGN KEY match_details_ibfk_1;
ALTER TABLE match_played DROP FOREIGN KEY match_played_ibfk_1;
ALTER TABLE match_played DROP FOREIGN KEY match_played_ibfk_2;
ALTER TABLE penalty_gk DROP FOREIGN KEY penalty_gk_ibfk_1;
ALTER TABLE penalty_shootout DROP FOREIGN KEY penalty_shootout_ibfk_1;
ALTER TABLE player_booked DROP FOREIGN KEY player_booked_ibfk_1;
ALTER TABLE player_in_out DROP FOREIGN KEY player_in_out_ibfk_1;
ALTER TABLE player_request DROP FOREIGN KEY player_request_ibfk_1;
ALTER TABLE team_player DROP FOREIGN KEY team_player_ibfk_2;
ALTER TABLE team_support DROP FOREIGN KEY team_support_ibfk_2;
ALTER TABLE tournament_team DROP FOREIGN KEY tournament_team_ibfk_2;
ALTER TABLE player_request DROP FOREIGN KEY player_request_ibfk_2;
ALTER TABLE player_request MODIFY team_id INT;
ALTER TABLE email_notification MODIFY team_id INT;
ALTER TABLE goal_details MODIFY team_id INT;
ALTER TABLE match_captain MODIFY team_id INT;
ALTER TABLE match_details MODIFY team_id INT;
ALTER TABLE match_played MODIFY team_id1 INT;
ALTER TABLE match_played MODIFY team_id2 INT;
ALTER TABLE penalty_gk MODIFY team_id INT;
ALTER TABLE penalty_shootout MODIFY team_id INT;
ALTER TABLE player_booked MODIFY team_id INT;
ALTER TABLE player_in_out MODIFY team_id INT;
ALTER TABLE player_request MODIFY team_id INT;
ALTER TABLE team_player MODIFY team_id INT;
ALTER TABLE team_support MODIFY team_id INT;
ALTER TABLE tournament_team MODIFY team_id INT;
ALTER TABLE TEAM MODIFY team_id INT NOT NULL AUTO_INCREMENT;
ALTER TABLE email_notification
  ADD CONSTRAINT email_notification_ibfk_2 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE goal_details
  ADD CONSTRAINT goal_details_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE match_captain
  ADD CONSTRAINT match_captain_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE match_details
  ADD CONSTRAINT match_details_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE match_played
  ADD CONSTRAINT match_played_ibfk_1 FOREIGN KEY (team_id1) REFERENCES TEAM(team_id);

ALTER TABLE match_played
  ADD CONSTRAINT match_played_ibfk_2 FOREIGN KEY (team_id2) REFERENCES TEAM(team_id);

ALTER TABLE penalty_gk
  ADD CONSTRAINT penalty_gk_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE penalty_shootout
  ADD CONSTRAINT penalty_shootout_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE player_booked
  ADD CONSTRAINT player_booked_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE player_in_out
  ADD CONSTRAINT player_in_out_ibfk_1 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE player_request
  ADD CONSTRAINT player_request_ibfk_2 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE team_player
  ADD CONSTRAINT team_player_ibfk_2 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE team_support
  ADD CONSTRAINT team_support_ibfk_2 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE tournament_team
  ADD CONSTRAINT tournament_team_ibfk_2 FOREIGN KEY (team_id) REFERENCES TEAM(team_id);
SELECT * FROM TOURNAMENT_TEAM WHERE team_id = 1221;
SELECT * FROM TOURNAMENT WHERE tr_id = 10;
DESCRIBE  PLAYER;
ALTER TABLE PLAYER_REQUEST ADD COLUMN username VARCHAR(40) AFTER player_id;
SELECT email, COUNT(*) as count
FROM SYSTEM_USER
GROUP BY email
HAVING count > 1;
SELECT * FROM SYSTEM_USER WHERE email = 'guest@gmail.com';
DELETE FROM SYSTEM_USER WHERE user_id = 1;
DELETE FROM SYSTEM_USER WHERE user_id = 8;
DELETE FROM SYSTEM_USER WHERE user_id = 9;
DELETE FROM SYSTEM_USER WHERE user_id = 5;
DELETE FROM SYSTEM_USER WHERE user_id = 6;
ALTER TABLE SYSTEM_USER ADD UNIQUE (email);
SELECT *
FROM person;
SELECT *
FROM system_user;
SELECT *
FROM player;
INSERT INTO PLAYER (player_id, jersey_no, position_to_play)
VALUES (10, 0, 'NA');
ALTER TABLE SYSTEM_USER ADD COLUMN kfupm_id INT NULL;