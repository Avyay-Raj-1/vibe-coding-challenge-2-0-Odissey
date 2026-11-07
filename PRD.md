application name :academy desk
tech stack
reactjs with vite 
supabase(MCP already connected,project name:academy desk)
 Authentication:
* Secure login and registration.
* Role-based access control.
* Password hashing using bcrypt.
* Secure session management.


SPORTS ACADEMY MANAGEMENT SYSTEM

### Master Prompt: Sports Academy Management System

# PROJECT: SPORTS ACADEMY MANAGEMENT & PLAYER PERFORMANCE TRACKING SYSTEM

## ROLE
Act as a Senior Full-Stack Developer, UI/UX Designer, Database Architect, Product Manager, and Sports Technology Expert.

Build a complete, responsive, production-quality web application that solves the operational problems of a local sports academy in Dumka, Jharkhand, India.

The academy currently manages players, attendance, match scores, and player selection records using a physical notebook. The coach cannot efficiently track attendance, identify top performers, or determine which players are ready for sports trials.

Your task is to transform this manual process into a centralized digital sports academy management platform.

## 1. PRODUCT VISION

Create a platform that allows:

* Coaches to manage players.
* Coaches to create daily practice sessions.
* Coaches to mark attendance.
* Coaches to record match performances.
* The system to automatically calculate player attendance percentages.
* The system to identify players eligible for trials.
* Scouts to view only eligible players.
* Players to view only their personal performance records.

The platform must be simple enough for a local academy coach to use without technical knowledge.

## 2. TECHNOLOGY STACK

Use the following technologies:

react+vite

supabase

Authentication:
* Secure login and registration.
* Role-based access control.
* Password hashing using bcrypt.
* Secure session management.


Use environment variables for all secrets and database credentials.

## 3. USER ROLES AND PERMISSIONS

Create four roles.

### A. ADMIN / COACH

The coach controls the academy.

Permissions:
* Add new players.
* Edit player information.
* View all players.
* Create practice sessions.
* Mark attendance.
* Close and lock sessions.
* Create match records.
* Record player scores.
* View player performance.
* View attendance statistics.
* Identify Ready players.

### B. SCOUT

Scouts should have restricted access.

Permissions:
* View only players who meet the Ready criteria.
* View their sports, age, attendance percentage, match count, and performance scores.
* Search and filter Ready players.
* View eligible player profiles.

Restrictions:
* Cannot view unqualified players.
* Cannot edit player information.
* Cannot change attendance or scores.

### C. PLAYER

Each player has an individual account.

Permissions:
* View only their own profile.
* View their attendance percentage.
* View their attendance history.
* View their match history.
* View their scores.
* View their Ready status.

Restrictions:
* Cannot view other players.
* Cannot edit attendance.
* Cannot edit match scores.

### D. PUBLIC / VISITOR

Provide a basic landing page explaining the platform and allowing authorized users to log in.

Never expose private player information publicly.

## 4. PLAYER MANAGEMENT MODULE

Create a player management dashboard.

Player information:
* Unique Player ID.
* Full Name.
* Age.
* Sport.
* Joining Date.
* Login credentials.

Requirements:
* The academy is initially limited to ONE academy.
* Only the coach can add players.
* Prevent duplicate player IDs.
* Allow the coach to edit or deactivate player accounts.
* Maintain player history.

## 5. PRACTICE ATTENDANCE MODULE

Create a daily attendance management system.

STEP 1: OPEN SESSION

The coach selects:
* Date.
* Sport.

The system creates a practice session.

Prevent duplicate sessions for the same academy, date, and sport unless explicitly allowed by the application rules.

STEP 2: MARK ATTENDANCE

Display all active players belonging to the selected sport.

Each player must have two options:
* PRESENT
* ABSENT

Use clear visual indicators.

The coach should be able to mark attendance quickly.

STEP 3: CLOSE SESSION

Provide a CLOSE SESSION button.

Once closed:
* Attendance records become locked.
* The coach cannot modify the session or its attendance.
* Players cannot change attendance.
* Match records must use the finalized session attendance as their eligibility reference.

Store:
* Session ID.
* Date.
* Sport.
* Player attendance records.
* Session status.
* Created and closed timestamps.

Important: Attendance must be recorded separately for each player. An absent player must clearly show ABSENT in their personal attendance history.

## 6. MATCH PERFORMANCE MODULE

Allow coaches to record actual match performances.

Match information:
* Match Date.
* Sport.
* Opponent.
* Participating players.
* Individual player scores.

Rules:

1. The coach selects the match date and sport.
2. The system checks the attendance session for that date and sport.
3. Display only players marked PRESENT in the corresponding closed session.
4. The coach enters the score for each participating player.
5. Save the match record.

STRICT VALIDATION:
* An absent player must not appear in the match scoring sheet.
* The backend must independently validate player attendance.
* Never trust frontend filtering alone.
* Reject match records containing absent players.
* Prevent duplicate player entries in a match.

Each match should store its participating players and their individual scores.

## 7. AUTOMATIC PLAYER READINESS ENGINE

This is the most important feature.

Automatically calculate player readiness.

Formula:

Attendance Percentage = (Number of Present Sessions / Total Closed Sessions Held for That Sport) × 100

A player becomes READY only when BOTH conditions are satisfied:

Condition 1:
Attendance percentage must be greater than or equal to 75%.

Condition 2:
The player must have participated in at least 2 recorded matches.

Readiness logic:

IF attendance percentage >= 75 AND match count >= 2:
    Status = READY

ELSE:
    Status = NOT READY

Important:
* Calculate readiness dynamically from database records.
* Do not allow the coach to manually assign Ready status.
* Do not count open sessions.
* Use the player's sport when calculating attendance.
* Count unique matches in which the player actually participated.
* Recalculate when a new valid record is added.

Display:
* Attendance percentage.
* Total sessions.
* Present sessions.
* Matches played.
* Readiness status.

Use visual progress indicators.

## 8. SCOUT DASHBOARD

Create a professional scouting dashboard.

The scout should see ONLY Ready players.

Display player cards with:
* Player name.
* Age.
* Sport.
* Attendance percentage.
* Matches played.
* Individual match scores.
* Readiness status.

Add filters:
* Sport.
* Age.
* Attendance percentage.

Add search by player name.

IMPORTANT SECURITY:
The backend must enforce the Ready-only restriction.

Do not simply hide unqualified players through frontend filtering.

A scout API request must never return a Not Ready player's record.

## 9. PLAYER DASHBOARD

Create a simple personal dashboard.

Each player should see:

Welcome message with their name.

Performance overview:
* Attendance percentage.
* Present sessions.
* Absent sessions.
* Total sessions.
* Matches played.
* Match scores.
* Readiness status.

Attendance history:
Show each session date and whether the player was PRESENT or ABSENT.

Performance history:
Show match date, opponent, sport, and score.

IMPORTANT:
A player must only be able to access their own data.

Enforce this restriction on the backend using the authenticated user's player ID.

## 10. UI/UX DESIGN

Create a premium, modern sports technology dashboard.

Design inspiration:
* Professional sports analytics platforms.
* Modern SaaS dashboards.
* Clean athletic performance management systems.

Visual style:
* Dark navy or charcoal sidebar.
* White or light grey dashboard background.
* Green for Present and Ready.
* Red for Absent.
* Orange for pending or incomplete records.
* Modern typography.
* Clean cards.
* Rounded corners.
* Subtle shadows.
* Professional charts.

Dashboard layout:

Sidebar:
* Overview.
* Players.
* Attendance.
* Matches.
* Ready Players.
* Reports.
* Settings.
* Logout.

Dashboard overview:
* Total Players.
* Today's Attendance.
* Total Matches.
* Ready Players.

Add:
* Attendance charts.
* Player performance charts.
* Recent activity.
* Search and filters.
* Responsive mobile layout.

The design must work smoothly on Android phones, tablets, and laptops.

Avoid excessive animations and unnecessary decorative elements.

## 11. DATABASE DESIGN

Create properly structured MongoDB collections.

Suggested collections:

Users:
* _id
* name
* email
* passwordHash
* role
* playerId (for player accounts)

Players:
* _id
* playerId
* name
* age
* sport
* joiningDate
* active

Sessions:
* _id
* date
* sport
* status
* attendance[]
* createdBy
* closedAt

Attendance:
* playerId
* sessionId
* status

Matches:
* _id
* date
* sport
* opponent
* sessionId
* participants[]

Each participant:
* playerId
* score

Create appropriate indexes and database validation.

## 12. SECURITY AND DATA INTEGRITY

Implement:
* Password hashing.
* Authentication middleware.
* Role-based authorization.
* Backend validation.
* Protected API routes.
* Secure environment variables.
* Input sanitization.
* Error handling.

Critical restrictions:
* Only coaches can create or close sessions.
* Closed sessions cannot be edited.
* Only present players can be included in a match.
* Only scouts can access the Ready-player endpoint.
* Scouts must only receive Ready players.
* Players can only access their own information.
* Players cannot change scores or attendance.

## 13. REQUIRED TEST CASES

Implement and verify the following scenarios.

TEST 1: ATTENDANCE

Create three players:
* Player A.
* Player B.
* Player C.

Create one practice session.

Mark:
* Player A = PRESENT.
* Player B = PRESENT.
* Player C = ABSENT.

Close the session.

Expected:
Player C must see ABSENT in their attendance history.

TEST 2: MATCH VALIDATION

Create a match on the same date and sport.

Enter scores for Player A and Player B.

Try adding Player C.

Expected:
* Player A accepted.
* Player B accepted.
* Player C rejected.
* Backend refuses the absent player's participation.

TEST 3: READINESS CALCULATION

Scenario A:
Player has 2 present sessions out of 3 closed sessions.

Attendance = 66.67%.

Even with 2 matches, status must be NOT READY.

Scenario B:
Player has 3 present sessions out of 4 closed sessions.

Attendance = 75%.

With 2 matches, status must be READY.

Scenario C:
Player has 100% attendance but only 1 match.

Status must be NOT READY.

TEST 4: SCOUT ACCESS

Log in as a scout.

Expected:
Only READY players appear in the dashboard and API responses.

TEST 5: PLAYER ACCESS

Log in as Player A.

Attempt to access Player B's profile through a modified URL or API request.

Expected:
Access denied.

TEST 6: SESSION LOCKING

Close a session and attempt to change attendance.

Expected:
The system must reject the update.

## 14. PROJECT STRUCTURE AND DELIVERABLES

Create a complete working project with:

* Frontend.
* Backend.
* MongoDB connection.
* Authentication.
* Role-based dashboards.
* Database models.
* API routes.
* Validation.
* Responsive UI.
* Test cases.
* README.md.
* .env.example.
* Deployment instructions.

Provide a clear GitHub-ready project structure.

## 15. DEVELOPMENT INSTRUCTIONS

Follow this implementation order:

Phase 1: Project setup and UI structure.

Phase 2: MongoDB connection and database models.

Phase 3: Authentication and role permissions.

Phase 4: Player management.

Phase 5: Attendance sessions and locking.

Phase 6: Match recording and attendance validation.

Phase 7: Automatic readiness calculation.

Phase 8: Scout and player dashboards.

Phase 9: Testing and security validation.

Phase 10: Deployment on Vercel.

Do not stop after creating a frontend prototype.

Build real backend functionality with persistent MongoDB data.

Do not use fake data as the final implementation.

Do not leave buttons non-functional.

Do not skip the required test cases.

## 16. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

1. A coach can add and manage players.
2. A coach can open, mark, and close practice sessions.
3. Closed sessions are locked.
4. Absent players are rejected from match scoring.
5. Match scores are saved permanently.
6. Readiness is calculated automatically.
7. Scouts can see only Ready players.
8. Players can see only their own records.
9. All six test scenarios pass.
10. The website works on mobile and desktop.
11. The project can be deployed using MongoDB Atlas and Vercel.

FINAL GOAL:

Build a reliable, simple, and professional Digital Sports Academy Management System that replaces the academy's notebook with a secure, data-driven platform.

Prioritize correctness, security, usability, and compliance with every challenge requirement over unnecessary features.

Start by presenting the architecture and project structure, then implement the complete application step by step.

### My suggestions to make your project stand out

Don't build just an attendance website. Build a Sports Performance & Talent Discovery Platform.

![RESULTS | First Eleven Performance Lab](https://images.openai.com/static-rsc-4/FmXYxwQ87jprm87EwL9IjQ1qmwdYCzseHFHR2Kcwe6vgfbYQEvV-KbjYNvPCRLIxblWHCKc9TaJ9cHqE-4uNVD19j6QhErZCYMRohOSblTL3M9CiZV606C7z_ihloHGsmvlPyRZALvBV6C7jc4ug4rVPAd_g9r4Mw8hmyN4PaSKy_L4DjSQXxcLGuKlTZza9?purpose=fullsize)

1\. Performance dashboard

Show player performance, attendance percentage, match scores and readiness in one place.

![HAWY - Sports Performance Analytics Platform :: Behance](https://images.openai.com/static-rsc-4/jK4QkiWq2ahIhvyCP-pmCIbTXYRH6HrLk_jSB12I-oM_cCG5k05HsF4-gOju5r6kfeRf5w7amHLoCgAgjqAPZTvWu188AV_S2bvzFywVEjp49uHpBPKbM5nBBejtSHMTX-Pbx8sH_KLCklSVCaMBfYuHgKLy7QwEmyACXTzjJMFXqiX8g_bzkARl0cwVuhbs?purpose=fullsize)

2\. Digital player profile

Give each player a profile containing their performance history, making it easier to evaluate talent.

![8 Key Features of the New YouCoach Mobile App | YouCoach](https://images.openai.com/static-rsc-4/2K9cv8vbHfoF7hat98YJNKSH8Las6tdua8J5CPD6l50NqFT4emppymd65zgkgQDa-nLRAEOz3BYHb9iUBGpu8mgAzPvfq7RrcBF2-W2NjBdipLFCUO2ZwfZzwOiNKK95ugCRulFEzDyBP40hVYxJLCkYOg-fx8P347NeyabswUnaI91Ju8VYosUd4rFCC9ml?purpose=fullsize)

3\. One-click attendance

Coaches should be able to mark attendance quickly from their mobile phones.

![eps – Exsurgo Technologies](https://images.openai.com/static-rsc-4/VB8D0U7n5JWglLzFjaVN1GRuPOZ_TkQLTFi-Q3jdlbCZjfXrLPaBBpplcOEpwrWYL73azvJNdukjbwbOdA5V1QCAnGrfaDGeUOga82I0gwy6QT2vQrdABe-avR9EqZFmiW2dLeSyZWFW52BHcjDAfnZ0aGkMLHyM2hVAJwLn82pFlQE9_0MW1zEorsCTf5OC?purpose=fullsize)

4\. Automatic trial eligibility

Automatically identify players meeting the 75% attendance and 2-match criteria.

### Important advice for this challenge

Your challenge has strict rules, so don't add unnecessary features before completing the required functionality.

* Do not add multiple academies.

* Do not allow scouts to see all players.

* Do not allow manual Ready status.

* Do not allow absent players into match records.

* Do not allow attendance editing after closing a session.

* Do not compromise player privacy.

One important technical detail: The challenge says a new rule will be added on Wednesday, 4 November at 11:00 IST. Keep the readiness and validation rules modular so you can update them without rebuilding the entire website.

### Suggested project identity

### academy desk

SPORTS ACADEMY MANAGEMENT SYSTEM

![Sports coach dashboard with AI insights by Adam Rakús on Dribbble](https://images.openai.com/static-rsc-4/uFPj7nD9DknKcI7JbcK45wDIp5DSuJmaJgRJgqzcZhIVy5zSGZXT_qsPf5cAhW_7O-ZG1AX3TFlg_GD_5sSV7QzlAIPFW310m74uf6UVsosLu-vglO7Ztjzo9y5lJe5g5Znw0Omf85Yu96i9_7DJKN1TJEBG1gzZmNHW10DMiELVawYEcgwf8jWnXod3uKyZ?purpose=fullsize)

Tagline: Every Player. Every Practice. Every Performance.