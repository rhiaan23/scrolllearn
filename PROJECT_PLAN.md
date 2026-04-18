HackPrinceton Project Writeup
=============================

Project Working Title
---------------------
ScrollLearn
Alternative names:
- BrainScroll
- LearnTok
- EduReels
- QuizLoop

One-Line Summary
----------------
A TikTok-style feed of educational mini-games for elementary school students that turns scrolling into active learning.

Core Idea
---------
Kids already love short-form, swipe-based content. Instead of fighting that behavior, we use the same interaction pattern to deliver fast, fun educational games. Each swipe shows a new mini-game in Math, English, or Science. The platform can adapt difficulty, explain answers, and keep students engaged through streaks, points, and lightweight competition.

Problem
-------
A lot of kids spend time on highly engaging apps, but most of that time is not educational. Existing game websites like Cool Math Games may involve logic or numbers, but many of the games are not actually built around learning outcomes. Teachers also struggle to find tools that are both educational and genuinely engaging.

Our Solution
------------
We are building a vertical, reel-like platform of educational mini-games designed for elementary students. Instead of watching videos, students scroll through playable learning activities.

Each game is:
- short
- easy to start
- tied to a real learning objective
- designed to feel fun first, educational second

The experience is inspired by short-form content apps, but the content is:
- interactive instead of passive
- educational instead of purely entertaining
- personalized instead of random

Target Users
------------
Primary users:
- elementary school students

Secondary users:
- teachers
- parents

Use Cases
---------
1. At home:
A child opens the app and scrolls through quick educational games for 10-15 minutes after school.

2. In class:
A teacher uses the platform during the last 10-15 minutes of class as review time. Students play mini-games based on material they just learned.

3. Skill practice:
A student keeps getting multiplication problems wrong, so the app serves more multiplication-focused games with easier difficulty and explanations.

Main Product Vision
-------------------
The long-term vision is a platform with many educational mini-games across subjects. For the hackathon MVP, we are showing the system through a smaller but polished demo.

Important note:
We do NOT need to build 100 games.
We only need to prove the platform model works.

Hackathon MVP
-------------
For the hackathon, we should build:

1. A vertical scrolling home feed
2. Around 6-10 mini-game cards total
3. 3 subject categories:
   - Math
   - English
   - Science
4. 2-3 game mechanics reused across subjects
5. Basic personalization logic
6. Instant feedback after each answer
7. Simple score/streak tracking
8. Optional voice narration for questions and instructions

The goal is to make it feel like a real platform, not just a collection of disconnected quiz screens.

Best Scope for the Weekend
--------------------------
This project only works if we keep the scope tight.

Build:
- polished feed
- a few strong mini-game types
- clean onboarding
- simple progression
- 1-2 standout AI features

Do not overbuild:
- full classroom dashboard
- full teacher analytics portal
- complex multiplayer
- large reward shop
- elaborate account systems
- true 100-game library
- advanced recommendation engine

What Makes This Different
-------------------------
This is not just another quiz app.

Our differentiators:
1. TikTok-style UX
   The learning format feels familiar and engaging.

2. Mini-game first design
   Students are playing, not just answering static worksheets.

3. Multi-subject content
   Math, English, and Science can all live in one feed.

4. Adaptive system
   The next game can depend on the student's performance.

5. Fast feedback loop
   Students answer, learn, swipe, repeat.

6. Optional classroom fit
   Teachers can use it as a review/reinforcement tool.

Feature Breakdown
-----------------

A. Student Experience
---------------------
- Open app
- Choose age/grade or start immediately
- Scroll through mini-games vertically
- Complete quick challenges
- See instant correctness feedback
- Earn points/streaks
- Get another game that matches performance

B. Game Feed
------------
Every card in the feed is a playable learning experience.
Examples:
- Solve a math problem
- Match a word to its meaning
- Pick the correct science fact
- Drag answers into the right category
- Choose the missing word in a sentence

C. Categories
-------------
Math:
- addition
- subtraction
- multiplication
- division
- number patterns
- shapes

English:
- spelling
- vocabulary
- sentence completion
- synonyms/antonyms
- reading comprehension snippets

Science:
- animals
- plants
- weather
- body systems
- habitats
- simple cause/effect

D. Game Types We Can Reuse
--------------------------
To move fast, we should create a small set of reusable templates.

Recommended game templates:
1. Multiple Choice
   Prompt + 4 answer options

2. Match / Pairing
   Match two related items

3. Fill in the Blank
   Simple text completion

4. Sort / Categorize
   Put choices into the correct group

These same templates can support all 3 subjects.

Example Games
-------------
Math examples:
- "What is 7 x 3?"
- "Which number comes next: 2, 4, 6, ?"
- "Which shape has 4 equal sides?"

English examples:
- "Which word means happy?"
- "Choose the missing word in the sentence"
- "Match the word to its definition"

Science examples:
- "Which animal is a mammal?"
- "What do plants need to grow?"
- "Which season comes after winter?"

AI Features
-----------
We should use AI where it actually improves the product.

Strongest AI uses:
1. Question generation
   AI can generate new questions from a subject, grade, and difficulty level.

2. Difficulty adjustment
   If a student does well, the next game gets slightly harder.
   If a student struggles, the next game gets simpler.

3. Answer explanations
   AI can explain why an answer is right or wrong in kid-friendly language.

4. Content expansion
   In the future, AI could scale the game library far beyond what we manually build.

Good pitch line:
"We are not building just a fixed set of games. We are building a system that can generate and personalize educational mini-games at scale."

How to Use ElevenLabs
---------------------
ElevenLabs is a strong fit for this project.

Possible uses:
- Read instructions aloud
- Narrate questions
- Read explanations after answers
- Encourage the student with positive feedback

Examples:
- "Great job! Let's try a harder one."
- "Not quite. Remember, plants need sunlight and water to grow."
- "Swipe for your next challenge."

This makes the experience:
- more accessible
- more engaging
- better for younger kids
- stronger for the ElevenLabs prize track

Simple Personalization Logic
----------------------------
We do not need a complicated recommendation algorithm for the hackathon.

Basic version:
- Track subject performance
- Track recent correct/incorrect answers
- Serve more of what the student needs practice in
- Increase difficulty after streaks
- Decrease difficulty after repeated misses

Example:
- Student gets 3 English questions right in a row -> slightly harder English card appears
- Student misses 2 science questions -> easier science card with explanation appears next

This is enough for demo purposes.

Gamification
------------
Keep this lightweight.

Recommended:
- points
- daily streak
- simple progress bar
- "You are improving in Math" message
- optional leaderboard mockup for classroom mode

Do not spend too much time on:
- full coin shop
- skins/custom items
- complex reward economy

Classroom Angle
---------------
This project can work both in class and out of class.

Best classroom story:
- Teacher teaches lesson for most of class
- Last 10-15 minutes are game-based reinforcement
- Students review content in a fun way
- Teacher can see who understood the lesson

For the hackathon, this can be shown as a simple future-facing mode or a lightweight mockup instead of a full teacher portal.

Best Demo Story
---------------
The clearest demo is:

1. Student opens app
2. Sees swipeable feed of educational games
3. Plays Math card
4. Gets answer right
5. App gives feedback and moves to a slightly harder card
6. Plays English card
7. Gets it wrong
8. App explains the answer
9. App serves another easier English-related card
10. Voice narration reads the next prompt
11. Show streak/progress
12. End with "teachers can use this in class, and AI lets us scale the game library"

That is a clean, compelling story.

What Judges Should Understand
-----------------------------
This is not "Cool Math Games but with more subjects."

This is:
- an engagement-first education platform
- using a familiar short-form interaction model
- powered by adaptive and scalable AI content generation
- designed for real student use

Why This Can Win the Education Track
------------------------------------
The Education track rewards projects that make learning more interactive, accessible, or personalized. This project directly fits that description because it:
- makes learning interactive through mini-games
- makes learning more engaging through a scrollable game feed
- makes learning more personalized through adaptive difficulty and content
- can be used both by students independently and in classrooms

This aligns strongly with the HackPrinceton Education category. The packet describes Education projects as those that make learning more interactive, accessible, or personalized. It also notes that teams must enroll in one of the required tracks, including Education. See the HackPrinceton packet for track details and judging expectations. Source: Hacker Information Packet Spring '26.

Prize Strategy
--------------
Primary target:
- Best Education Hack

Strong secondary targets:
- Best Use of ElevenLabs
- Best Use of Gemini API
- Best AI-Powered App

Possible stack-on items:
- GoDaddy domain prize
- DigitalOcean deployment prize

Recommended Final Positioning
-----------------------------
Position the project as:
"A short-form educational gaming platform for elementary students that uses AI to personalize mini-games across Math, English, and Science."

Do not position it as:
- just a website with games
- just a quiz app
- a clone of Cool Math Games

Architecture Plan
-----------------
Suggested stack:
- Frontend: Next.js / React
- Styling: Tailwind
- Database: Supabase or Firebase
- AI generation/explanations: Gemini or another LLM API
- Voice: ElevenLabs
- Hosting: Vercel or DigitalOcean

Simple architecture:
1. Frontend shows feed and game cards
2. Backend stores game templates and user progress
3. AI service generates/adapts content
4. Voice service narrates prompts/explanations
5. Personalization logic chooses next game

Build Plan for the Team
-----------------------

Phase 1: Foundation
- Create project repo
- Set up frontend app
- Build main layout
- Build vertical feed UI
- Decide final branding/name

Phase 2: Core Game Engine
- Create reusable game card component
- Create 2-3 reusable game templates
- Build answer submission and feedback logic
- Add scoring/streak state

Phase 3: Subject Content
- Add Math cards
- Add English cards
- Add Science cards
- Make sure each category has enough demo content

Phase 4: Personalization
- Track correct vs incorrect
- Adjust next card based on performance
- Show simple difficulty progression

Phase 5: AI Layer
- Generate questions dynamically
- Generate explanations
- Make outputs safe and simple for kids

Phase 6: Voice Layer
- Add ElevenLabs narration to prompts or explanations
- Add audio button or autoplay option

Phase 7: Polish
- Animations
- Better transitions
- Cleaner colors and icons
- Demo-ready landing page
- Final seeded data and bug fixing

Role Suggestions
----------------
Even if everyone uses AI heavily, it still helps to split ownership.

Person 1:
- Feed UI
- animations
- app polish

Person 2:
- game components
- answer logic
- scoring/streaks

Person 3:
- AI integration
- question generation
- explanations

Person 4:
- backend/state
- data flow
- deployment/demo prep

If team size is smaller, merge roles.

Non-Negotiables for MVP
-----------------------
By demo time, we must have:
- working feed
- working mini-games
- at least 3 subjects visible
- instant feedback
- some form of adaptive logic
- clean UI
- a short, clear pitch

Nice-to-Haves
-------------
- voice narration
- teacher mode mockup
- leaderboard
- daily challenge
- parent dashboard concept

Things to Fake Tastefully If Needed
-----------------------------------
For a hackathon demo, it is okay to simulate parts of the future vision as long as the core product actually works.

Possible demo-safe simplifications:
- pre-generate most games instead of fully generating all in real time
- use simple rules instead of a full recommendation engine
- show mock teacher dashboard screens
- seed data instead of full user account creation

Judges care more about clarity and usefulness than perfect production depth.

Strong Pitch Language
---------------------
Useful lines for presenting:
- "Kids already know how to scroll. We turned that instinct into learning."
- "Instead of passive content consumption, each swipe is an active learning challenge."
- "Our platform adapts to what a student is struggling with and gives them the right next challenge."
- "We are making learning feel as engaging as the apps kids already use every day."
- "Cool Math Games is fun, but many of those games were not designed around direct learning outcomes. Ours is."

2-Minute Pitch Structure
------------------------
1. Problem
   Kids spend time on engaging apps, but most educational tools are not equally engaging.

2. Solution
   We built a TikTok-style feed of educational mini-games for elementary students.

3. How it works
   Students swipe through Math, English, and Science games, get instant feedback, and receive adaptive follow-up questions.

4. AI angle
   AI helps generate content, adjust difficulty, and explain answers in kid-friendly language.

5. Why it matters
   This makes learning more interactive, personalized, and classroom-friendly.

6. Close
   We are turning scrolling into learning.

What to Avoid Saying
--------------------
Avoid saying:
- "It's basically TikTok but for school"
- "It's just like Cool Math Games"
- "We made 100 games"

Better:
- "It's a short-form adaptive learning platform"
- "It's a feed of AI-personalized educational mini-games"
- "Our demo shows the platform model with a representative set of games"

Final Recommendation
--------------------
This is a strong hackathon idea if we stay disciplined.

The winning path is:
- make the UI feel real
- make the games work smoothly
- clearly show personalization
- clearly show educational value
- use AI in a way that feels meaningful, not forced

If we execute the core experience well, this is competitive for the Education track and naturally supports AI-related side prizes.

Relevant HackPrinceton Notes
----------------------------
- Projects must be completed during the 36-hour hacking period.
- Teams must submit a public GitHub repository created during the event.
- Teams must prepare a demo/presentation that does not exceed 2 minutes.
- Teams are required to enroll in one of the required tracks, including Education.
- Education projects are defined as projects that make learning more interactive, accessible, or personalized.
- Additional donor/MLH prizes include Best Use of ElevenLabs and Best Use of Gemini API.

Source reference:
HackPrinceton Hacker Information Packet Spring '26.
