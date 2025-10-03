const admin = require("firebase-admin");
const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const path = require("path");
const multer = require("multer");

// Load environment variables
require("dotenv").config({ debug: true });

    const questionBanks = {
  writing: [
  { "id": 1, "question": "Draft a concept note for an event on 'Viksit Bharat' highlighting objectives, activities, and expected outcomes." },
  { "id": 2, "question": "Write a sponsorship pitch email for a 'Swachh Bharat Abhiyan' campaign explaining the sponsor's benefits." },
  { "id": 3, "question": "Prepare a proposal note for a school event on 'Civic Sense' with student and parent involvement." },
  { "id": 4, "question": "Compose a follow-up email to a potential partner after discussing collaboration for a cleanliness drive." },
  { "id": 5, "question": "Draft a pitch note to local leaders seeking support for a 'Viksit Bharat 2047' rally." },
  { "id": 6, "question": "Write a concept note for a youth seminar on 'Nation Building' under the Viksit Bharat mission." },
  { "id": 7, "question": "Prepare a thank-you email to sponsors/partners after a successful Swachh Bharat event." },
  { "id": 8, "question": "Draft a proposal note for organizing a nukkad natak (street play) on waste management and civic sense." },
  { "id": 9, "question": "Write an invitation email to schools/colleges for a poster competition on Civic Sense and cleanliness." },
  { "id": 10, "question": "Prepare a collaboration proposal for NGOs and local authorities to co-host a 'Clean & Green City' drive." }
],
  political: [
    // First 20 questions (from previous set)
    {
      "id": 1,
      "question": "What should be the government's primary role in the economy?",
      "options": [
        {"text": "Minimal intervention - let markets regulate themselves"},
        {"text": "Active regulation to prevent corporate abuses"},
        {"text": "Strategic investment in key industries"},
        {"text": "Comprehensive economic planning and control"}
      ]
    },
    {
      "id": 2,
      "question": "How should healthcare be organized?",
      "options": [
        {"text": "Fully private system with minimal government involvement"},
        {"text": "Public-private partnership with regulated insurance markets"},
        {"text": "Universal public healthcare funded by taxes"},
        {"text": "State-controlled healthcare with private options"}
      ]
    },
    {
      "id": 3,
      "question": "What is your view on immigration?",
      "options": [
        {"text": "Strict border controls and limited immigration"},
        {"text": "Merit-based immigration system"},
        {"text": "Generous refugee and family reunification policies"},
        {"text": "Open borders with regulated integration"}
      ]
    },
    {
      "id": 4,
      "question": "How should education be funded and managed?",
      "options": [
        {"text": "School choice with vouchers and private options"},
        {"text": "Local control with state funding"},
        {"text": "Strong public education system with equal funding"},
        {"text": "Free college and university education"}
      ]
    },
    {
      "id": 5,
      "question": "What approach should be taken toward climate change?",
      "options": [
        {"text": "Focus on adaptation rather than emission reduction"},
        {"text": "Market-based solutions and technological innovation"},
        {"text": "Strong regulations and emission targets"},
        {"text": "Green New Deal with massive public investment"}
      ]
    },
    {
      "id": 6,
      "question": "What is your position on taxation?",
      "options": [
        {"text": "Lower taxes across the board to stimulate growth"},
        {"text": "Simplified tax system with moderate rates"},
        {"text": "Progressive taxation with higher rates for the wealthy"},
        {"text": "Wealth taxes and significant redistribution"}
      ]
    },
    {
      "id": 7,
      "question": "How should social security and welfare be structured?",
      "options": [
        {"text": "Minimal safety net with personal responsibility"},
        {"text": "Temporary assistance with work requirements"},
        {"text": "Strong social safety net with unemployment benefits"},
        {"text": "Universal basic income and comprehensive welfare"}
      ]
    },
    {
      "id": 8,
      "question": "What is your view on national defense?",
      "options": [
        {"text": "Strong military with global presence"},
        {"text": "Focused defense with selective engagement"},
        {"text": "Diplomacy first with reduced military spending"},
        {"text": "Minimal military for defense only"}
      ]
    },
    {
      "id": 9,
      "question": "How should criminal justice be reformed?",
      "options": [
        {"text": "Tough on crime with mandatory sentencing"},
        {"text": "Balanced approach with judicial discretion"},
        {"text": "Rehabilitation focus with reduced incarceration"},
        {"text": "Decriminalization and restorative justice"}
      ]
    },
    {
      "id": 10,
      "question": "What approach to civil liberties do you support?",
      "options": [
        {"text": "Strong national security over individual privacy"},
        {"text": "Balanced approach with oversight"},
        {"text": "Strong privacy protections with limitations"},
        {"text": "Absolute civil liberties with minimal exceptions"}
      ]
    },
    {
      "id": 11,
      "question": "How should government address income inequality?",
      "options": [
        {"text": "Growth will eventually benefit everyone"},
        {"text": "Education and opportunity programs"},
        {"text": "Progressive taxation and social programs"},
        {"text": "Wealth redistribution and worker ownership"}
      ]
    },
    {
      "id": 12,
      "question": "What is your view on gun rights?",
      "options": [
        {"text": "Absolute Second Amendment rights"},
        {"text": "Reasonable regulations with ownership rights"},
        {"text": "Strong background checks and restrictions"},
        {"text": "Significant limitations or bans"}
      ]
    },
    {
      "id": 13,
      "question": "How should international trade be conducted?",
      "options": [
        {"text": "Protectionist policies to protect domestic jobs"},
        {"text": "Bilateral trade agreements with safeguards"},
        {"text": "Free trade with worker adjustment programs"},
        {"text": "Global free trade with minimal barriers"}
      ]
    },
    {
      "id": 14,
      "question": "What is your position on abortion rights?",
      "options": [
        {"text": "Complete ban with no exceptions"},
        {"text": "Restrictions with limited exceptions"},
        {"text": "Legal with reasonable regulations"},
        {"text": "Unrestricted access as healthcare right"}
      ]
    },
    {
      "id": 15,
      "question": "How should energy policy be developed?",
      "options": [
        {"text": "Maximize domestic fossil fuel production"},
        {"text": "Balanced approach with all energy sources"},
        {"text": "Transition to renewables with incentives"},
        {"text": "Rapid transition to 100% renewable energy"}
      ]
    },
    {
      "id": 16,
      "question": "What role should religion play in public life?",
      "options": [
        {"text": "Government should reflect religious values"},
        {"text": "Religious freedom with some public expression"},
        {"text": "Strict separation of church and state"},
        {"text": "Secular public sphere exclusively"}
      ]
    },
    {
      "id": 17,
      "question": "How should housing policy address affordability?",
      "options": [
        {"text": "Market-based solutions with minimal intervention"},
        {"text": "Tax incentives for developers and buyers"},
        {"text": "Public housing and rent control"},
        {"text": "Housing as a human right with guaranteed access"}
      ]
    },
    {
      "id": 18,
      "question": "What is your view on political correctness?",
      "options": [
        {"text": "Threat to free speech and traditional values"},
        {"text": "Sometimes excessive but well-intentioned"},
        {"text": "Important for inclusive society"},
        {"text": "Essential for social justice"}
      ]
    },
    {
      "id": 19,
      "question": "How should the government approach technological regulation?",
      "options": [
        {"text": "Minimal regulation to encourage innovation"},
        {"text": "Targeted regulation for specific harms"},
        {"text": "Comprehensive privacy and antitrust regulation"},
        {"text": "Public ownership of essential digital infrastructure"}
      ]
    },
    {
      "id": 20,
      "question": "What is your position on voting rights?",
      "options": [
        {"text": "Strict ID requirements to ensure integrity"},
        {"text": "Reasonable access with some safeguards"},
        {"text": "Automatic registration and expanded access"},
        {"text": "Mandatory voting with full facilitation"}
      ]
    },
    // Additional 30 political questions to make 50 total
    {
      "id": 21,
      "question": "How should the government address racial inequality?",
      "options": [
        {"text": "Color-blind policies only"},
        {"text": "Equal opportunity programs"},
        {"text": "Targeted programs for disadvantaged groups"},
        {"text": "Reparations and systemic restructuring"}
      ]
    },
    {
      "id": 22,
      "question": "What is your view on labor unions?",
      "options": [
        {"text": "Restrictive laws to protect business flexibility"},
        {"text": "Balance between worker and employer rights"},
        {"text": "Strong protections for union organization"},
        {"text": "Workers should control major enterprises"}
      ]
    },
    {
      "id": 23,
      "question": "How should foreign policy prioritize interests?",
      "options": [
        {"text": "National interest above all else"},
        {"text": "Democratic values with pragmatic cooperation"},
        {"text": "Multilateralism and international institutions"},
        {"text": "Global cooperation over national interest"}
      ]
    },
    {
      "id": 24,
      "question": "What approach to drug policy do you support?",
      "options": [
        {"text": "War on drugs with strict enforcement"},
        {"text": "Decriminalization of some substances"},
        {"text": "Legalization with regulation"},
        {"text": "Treat addiction as health issue not crime"}
      ]
    },
    {
      "id": 25,
      "question": "How should the budget deficit be addressed?",
      "options": [
        {"text": "Spending cuts across the board"},
        {"text": "Targeted cuts with some revenue increases"},
        {"text": "Balanced approach with tax increases"},
        {"text": "Deficit spending for social programs"}
      ]
    },
    {
      "id": 26,
      "question": "What is your view on surveillance and privacy?",
      "options": [
        {"text": "Strong surveillance for national security"},
        {"text": "Limited surveillance with oversight"},
        {"text": "Strong privacy protections with warrants"},
        {"text": "Absolute privacy with no mass surveillance"}
      ]
    },
    {
      "id": 27,
      "question": "How should infrastructure be developed?",
      "options": [
        {"text": "Public-private partnerships primarily"},
        {"text": "Federal funding with state management"},
        {"text": "Major public investment in green infrastructure"},
        {"text": "Nationalization of critical infrastructure"}
      ]
    },
    {
      "id": 28,
      "question": "What is your position on free speech limits?",
      "options": [
        {"text": "Absolute free speech with no exceptions"},
        {"text": "Limited restrictions for public safety"},
        {"text": "Restrictions on hate speech and misinformation"},
        {"text": "Strong regulations to prevent harm"}
      ]
    },
    {
      "id": 29,
      "question": "How should the political system be reformed?",
      "options": [
        {"text": "Maintain current system with minor changes"},
        {"text": "Campaign finance and ethics reforms"},
        {"text": "Electoral college abolition and voting reforms"},
        {"text": "Complete restructuring for direct democracy"}
      ]
    },
    {
      "id": 30,
      "question": "What is your view on globalization?",
      "options": [
        {"text": "Sovereignty first, limit global engagement"},
        {"text": "Selective engagement on national terms"},
        {"text": "Active participation in global institutions"},
        {"text": "Global citizenship over nationalism"}
      ]
    },
    {
      "id": 31,
      "question": "How should retirement security be ensured?",
      "options": [
        {"text": "Individual responsibility with private accounts"},
        {"text": "Mixed system with personal savings"},
        {"text": "Strengthened Social Security system"},
        {"text": "Guaranteed government pension for all"}
      ]
    },
    {
      "id": 32,
      "question": "What approach to corporate power do you support?",
      "options": [
        {"text": "Minimal regulation to encourage business"},
        {"text": "Regulation to prevent abuses while encouraging growth"},
        {"text": "Strong antitrust and consumer protections"},
        {"text": "Worker control and public ownership of large corporations"}
      ]
    },
    {
      "id": 33,
      "question": "How should the justice system handle policing?",
      "options": [
        {"text": "Full support for police with more funding"},
        {"text": "Increased training and community policing"},
        {"text": "Significant reform and accountability measures"},
        {"text": "Defund and reimagine public safety"}
      ]
    },
    {
      "id": 34,
      "question": "What is your view on national identity?",
      "options": [
        {"text": "Strong national identity and assimilation"},
        {"text": "Balanced approach with core values"},
        {"text": "Multiculturalism and diversity"},
        {"text": "Post-national global identity"}
      ]
    },
    {
      "id": 35,
      "question": "How should agricultural policy be shaped?",
      "options": [
        {"text": "Support large-scale commercial farming"},
        {"text": "Balance between small and large farms"},
        {"text": "Support for small farmers and organic agriculture"},
        {"text": "Local food systems and sustainable agriculture"}
      ]
    },
    {
      "id": 36,
      "question": "What is your position on space exploration?",
      "options": [
        {"text": "Private sector led with minimal government"},
        {"text": "Public-private partnership"},
        {"text": "Strong government space program"},
        {"text": "International cooperation primarily"}
      ]
    },
    {
      "id": 37,
      "question": "How should media and journalism be supported?",
      "options": [
        {"text": "Complete free market with no support"},
        {"text": "Limited public broadcasting"},
        {"text": "Strong public media funding"},
        {"text": "Government support for local journalism"}
      ]
    },
    {
      "id": 38,
      "question": "What is your view on economic globalization?",
      "options": [
        {"text": "Protect domestic industries with tariffs"},
        {"text": "Fair trade with worker protections"},
        {"text": "Free trade with adjustment assistance"},
        {"text": "Global economic integration and open markets"}
      ]
    },
    {
      "id": 39,
      "question": "How should the government address mental health?",
      "options": [
        {"text": "Primarily private and local responsibility"},
        {"text": "Limited public programs with private options"},
        {"text": "Comprehensive public mental healthcare"},
        {"text": "Integrated mental health in universal healthcare"}
      ]
    },
    {
      "id": 40,
      "question": "What is your vision for America's future role in the world?",
      "options": [
        {"text": "Strong sovereign nation that puts America first"},
        {"text": "Global leader promoting democracy and markets"},
        {"text": "International partner addressing global challenges"},
        {"text": "Equal member of global community"}
      ]
    },
    {
      "id": 41,
      "question": "How should campaign finance be regulated?",
      "options": [
        {"text": "No limits on political contributions"},
        {"text": "Reasonable limits with transparency"},
        {"text": "Public financing of elections"},
        {"text": "Complete public funding only"}
      ]
    },
    {
      "id": 42,
      "question": "What is your view on term limits for politicians?",
      "options": [
        {"text": "Against term limits - voters should decide"},
        {"text": "Moderate term limits for certain offices"},
        {"text": "Strong term limits for all elected positions"},
        {"text": "Term limits with exceptions for exceptional leaders"}
      ]
    },
    {
      "id": 43,
      "question": "How should the government approach AI regulation?",
      "options": [
        {"text": "No regulation to encourage innovation"},
        {"text": "Light regulation for specific risks only"},
        {"text": "Comprehensive AI safety regulations"},
        {"text": "International treaties on AI governance"}
      ]
    },
    {
      "id": 44,
      "question": "What is your position on universal basic income?",
      "options": [
        {"text": "Completely against UBI"},
        {"text": "Limited pilot programs only"},
        {"text": "UBI as replacement for some welfare programs"},
        {"text": "Comprehensive UBI for all citizens"}
      ]
    },
    {
      "id": 45,
      "question": "How should student loan debt be handled?",
      "options": [
        {"text": "No government intervention - personal responsibility"},
        {"text": "Income-based repayment plans"},
        {"text": "Partial loan forgiveness programs"},
        {"text": "Complete student loan forgiveness"}
      ]
    },
    {
      "id": 46,
      "question": "What is your view on nuclear energy?",
      "options": [
        {"text": "Expand nuclear energy significantly"},
        {"text": "Maintain current nuclear capacity"},
        {"text": "Phase out nuclear gradually"},
        {"text": "Immediate shutdown of all nuclear plants"}
      ]
    },
    {
      "id": 47,
      "question": "How should privacy rights be balanced with technology?",
      "options": [
        {"text": "Minimal privacy regulations for innovation"},
        {"text": "Balanced approach with user consent"},
        {"text": "Strong privacy protections by default"},
        {"text": "Absolute privacy rights with heavy penalties"}
      ]
    },
    {
      "id": 48,
      "question": "What is your position on military intervention?",
      "options": [
        {"text": "Frequent intervention to protect interests"},
        {"text": "Selective intervention for direct threats only"},
        {"text": "Military action only with UN approval"},
        {"text": "No military intervention under any circumstances"}
      ]
    },
    {
      "id": 49,
      "question": "How should the education curriculum be determined?",
      "options": [
        {"text": "Local control without federal standards"},
        {"text": "State standards with local flexibility"},
        {"text": "National standards with local implementation"},
        {"text": "Complete federal control of curriculum"}
      ]
    },
    {
      "id": 50,
      "question": "What is your view on corporate taxation?",
      "options": [
        {"text": "Lower corporate taxes to attract business"},
        {"text": "Competitive rates with other countries"},
        {"text": "Higher corporate taxes for public services"},
        {"text": "Significant increases with closing loopholes"}
      ]
    }
  ],
  aptitude: [
    // First 20 aptitude questions (from previous set)
    {
      "id": 1,
      "question": "Pointing to a photograph of boy Ramesh said, 'He is the son of the only son of my mother.' How is Ramesh related to that Boy?",
      "options": [
        { "text": "Brother", "isCorrect": false },
        { "text": "Father", "isCorrect": true },
        { "text": "Uncle", "isCorrect": false },
        { "text": "Cousin", "isCorrect": false }
      ]
    },
    {
      "id": 2,
      "question": "If A is the brother of B, B is the sister of C, C is the father of D. How D is related to A?",
      "options": [
        { "text": "Brother", "isCorrect": false },
        { "text": "Father", "isCorrect": false },
        { "text": "Uncle", "isCorrect": false },
        { "text": "Cannot be determined", "isCorrect": true }
      ]
    },
    {
      "id": 3,
      "question": "Introducing a boy, a girl said, 'He is the only son of the daughter if the father of my uncle.' How is the boy related to the girl?",
      "options": [
        { "text": "Brother", "isCorrect": true },
        { "text": "Nephew", "isCorrect": false },
        { "text": "Uncle", "isCorrect": false },
        { "text": "Son in law", "isCorrect": false }
      ]
    },
    {
      "id": 4,
      "question": "If X is brother of the son of Y's son, How X is related to Y?",
      "options": [
        { "text": "Son", "isCorrect": false },
        { "text": "Brother", "isCorrect": false },
        { "text": "Cousin", "isCorrect": false },
        { "text": "Grandson", "isCorrect": true }
      ]
    },
    {
      "id": 5,
      "question": "If Kamal says, 'Ravi's Mother is the only daughter of my mother', how is kamal related to Ravi?",
      "options": [
        { "text": "Grandfather", "isCorrect": false },
        { "text": "Brother", "isCorrect": false },
        { "text": "Father", "isCorrect": false },
        { "text": "Cannot be determined", "isCorrect": true }
      ]
    },
    {
      "id": 6,
      "question": "A Family consist of six members P,Q,R,X,Y,Z. Q is the son of R is not mother of Q. P and R are married couple. Y is the brother of R . X is the daughter of P. Z is the brother of P. How many children's does P have?",
      "options": [
        { "text": "1", "isCorrect": false },
        { "text": "2", "isCorrect": true },
        { "text": "3", "isCorrect": false },
        { "text": "4", "isCorrect": false }
      ]
    },
    {
      "id": 7,
      "question": "Pointing to a man in photograph a women said 'His brothers mother is the only daughter of my grandfather'. How is the women related to the man in the photograph?",
      "options": [
        { "text": "Mother", "isCorrect": false },
        { "text": "Sister", "isCorrect": true },
        { "text": "Aunt", "isCorrect": false },
        { "text": "Daughter", "isCorrect": false }
      ]
    },
    {
      "id": 8,
      "question": "A shopkeeper buys a pen for ₹50 and sells it for ₹65. What is the profit percentage?",
      "options": [
        { "text": "25%", "isCorrect": false },
        { "text": "30%", "isCorrect": true },
        { "text": "35%", "isCorrect": false },
        { "text": "20%", "isCorrect": false }
      ]
    },
    {
      "id": 9,
      "question": "If an article is sold at a loss of 10% for ₹450, what was its cost price?",
      "options": [
        { "text": "₹500", "isCorrect": true },
        { "text": "₹480", "isCorrect": false },
        { "text": "₹420", "isCorrect": false },
        { "text": "₹550", "isCorrect": false }
      ]
    },
    {
      "id": 10,
      "question": "A trader buys a book for ₹240 and marks it at 25% above cost price. If he sells it at a discount of 10% on the marked price, what is his selling price?",
      "options": [
        { "text": "₹260", "isCorrect": false },
        { "text": "₹270", "isCorrect": true },
        { "text": "₹280", "isCorrect": false },
        { "text": "₹290", "isCorrect": false }
      ]
    },
    {
      "id": 11,
      "question": "Find the simple interest on ₹5000 at 12% per annum for 2 years.",
      "options": [
        { "text": "₹1000", "isCorrect": false },
        { "text": "₹1200", "isCorrect": true },
        { "text": "₹1100", "isCorrect": false },
        { "text": "₹1050", "isCorrect": false }
      ]
    },
    {
      "id": 12,
      "question": "A sum of ₹8000 is borrowed at 10% simple interest per annum. What will be the total amount after 3 years?",
      "options": [
        { "text": "₹8800", "isCorrect": false },
        { "text": "₹10,400", "isCorrect": true },
        { "text": "₹9600", "isCorrect": false },
        { "text": "₹9200", "isCorrect": false }
      ]
    },
    {
      "id": 13,
      "question": "In how many years will a sum of ₹2500 amount to ₹3000 at 10% simple interest per annum?",
      "options": [
        { "text": "2 years", "isCorrect": true },
        { "text": "3 years", "isCorrect": false },
        { "text": "4 years", "isCorrect": false },
        { "text": "5 years", "isCorrect": false }
      ]
    },
    {
      "id": 14,
      "question": "The average of 5 numbers is 30. If one number is 40, what is the average of the remaining 4 numbers?",
      "options": [
        { "text": "28", "isCorrect": false },
        { "text": "29", "isCorrect": false },
        { "text": "27.5", "isCorrect": true },
        { "text": "26", "isCorrect": false }
      ]
    },
    {
      "id": 15,
      "question": "The average marks of 6 students is 50. If the marks of one student are removed, the average becomes 48. Find the marks of that student.",
      "options": [
        { "text": "58", "isCorrect": false },
        { "text": "60", "isCorrect": true },
        { "text": "62", "isCorrect": false },
        { "text": "68", "isCorrect": false }
      ]
    },
    {
      "id": 16,
      "question": "The average age of 4 friends is 24 years. If one more friend joins, the average age becomes 23. What is the age of the new friend?",
      "options": [
        { "text": "18 years", "isCorrect": false },
        { "text": "19 years", "isCorrect": true },
        { "text": "20 years", "isCorrect": false },
        { "text": "21 years", "isCorrect": false }
      ]
    },
    {
      "id": 17,
      "question": "Divide ₹600 in the ratio 2:3.",
      "options": [
        { "text": "₹200, ₹400", "isCorrect": false },
        { "text": "₹240, ₹360", "isCorrect": true },
        { "text": "₹250, ₹350", "isCorrect": false },
        { "text": "₹300, ₹300", "isCorrect": false }
      ]
    },
    {
      "id": 18,
      "question": "If A:B = 2:3 and B:C = 4:5, then A:B:C = ?",
      "options": [
        { "text": "8:12:15", "isCorrect": true },
        { "text": "2:3:5", "isCorrect": false },
        { "text": "4:6:5", "isCorrect": false },
        { "text": "6:8:10", "isCorrect": false }
      ]
    },
    {
      "id": 19,
      "question": "The monthly salaries of A and B are in the ratio 5:7. If A's salary is ₹15,000, then B's salary is:",
      "options": [
        { "text": "₹18,000", "isCorrect": false },
        { "text": "₹20,000", "isCorrect": false },
        { "text": "₹21,000", "isCorrect": true },
        { "text": "₹22,000", "isCorrect": false }
      ]
    },
    {
      "id": 20,
      "question": "Pointing to a woman, a man said, 'She is the daughter of the only daughter of my mother's mother.' How is the woman related to the man?",
      "options": [
        { "text": "Sister", "isCorrect": false },
        { "text": "Cousin", "isCorrect": false },
        { "text": "Mother", "isCorrect": false },
        { "text": "Niece", "isCorrect": true }
      ]
    },
    // Additional 30 aptitude questions to make 50 total
    {
      "id": 21,
      "question": "If P is the husband of Q and R is the mother of S, who is the wife of P, how is R related to P?",
      "options": [
        { "text": "Mother", "isCorrect": false },
        { "text": "Mother-in-law", "isCorrect": true },
        { "text": "Aunt", "isCorrect": false },
        { "text": "Sister", "isCorrect": false }
      ]
    },
    {
      "id": 22,
      "question": "Introducing a man, a woman said, 'His father is the only son of my father.' How is the woman related to the man?",
      "options": [
        { "text": "Sister", "isCorrect": true },
        { "text": "Daughter", "isCorrect": false },
        { "text": "Mother", "isCorrect": false },
        { "text": "Aunt", "isCorrect": false }
      ]
    },
    {
      "id": 23,
      "question": "A and B are brothers. C and D are sisters. A's son is D's brother. How is B related to C?",
      "options": [
        { "text": "Father", "isCorrect": false },
        { "text": "Uncle", "isCorrect": true },
        { "text": "Brother", "isCorrect": false },
        { "text": "Grandfather", "isCorrect": false }
      ]
    },
    {
      "id": 24,
      "question": "Pointing to a girl, Arun said, 'She is the only daughter of my father's son.' How is the girl related to Arun?",
      "options": [
        { "text": "Daughter", "isCorrect": false },
        { "text": "Sister", "isCorrect": false },
        { "text": "Niece", "isCorrect": true },
        { "text": "Cousin", "isCorrect": false }
      ]
    },
    {
      "id": 25,
      "question": "A man buys a watch for ₹800 and sells it for ₹1000. His profit percentage is:",
      "options": [
        { "text": "20%", "isCorrect": false },
        { "text": "25%", "isCorrect": true },
        { "text": "30%", "isCorrect": false },
        { "text": "40%", "isCorrect": false }
      ]
    },
    {
      "id": 26,
      "question": "By selling a chair for ₹720, a shopkeeper incurs a loss of 10%. At what price should he sell it to gain 20%?",
      "options": [
        { "text": "₹900", "isCorrect": false },
        { "text": "₹960", "isCorrect": true },
        { "text": "₹1000", "isCorrect": false },
        { "text": "₹1200", "isCorrect": false }
      ]
    },
    {
      "id": 27,
      "question": "If the cost price of 20 articles is equal to the selling price of 15 articles, find the profit percentage.",
      "options": [
        { "text": "25%", "isCorrect": false },
        { "text": "30%", "isCorrect": false },
        { "text": "33.33%", "isCorrect": true },
        { "text": "40%", "isCorrect": false }
      ]
    },
    {
      "id": 28,
      "question": "A fruit seller buys oranges at 12 for ₹60 and sells them at 10 for ₹60. What is his profit or loss percentage?",
      "options": [
        { "text": "20% Profit", "isCorrect": true },
        { "text": "20% Loss", "isCorrect": false },
        { "text": "25% Profit", "isCorrect": false },
        { "text": "25% Loss", "isCorrect": false }
      ]
    },
    {
      "id": 29,
      "question": "After allowing a discount of 15%, a shirt was sold for ₹680. What was its marked price?",
      "options": [
        { "text": "₹780", "isCorrect": false },
        { "text": "₹800", "isCorrect": true },
        { "text": "₹820", "isCorrect": false },
        { "text": "₹850", "isCorrect": false }
      ]
    },
    {
      "id": 30,
      "question": "The simple interest on a sum of money for 5 years at 8% per annum is half the sum. The sum is:",
      "options": [
        { "text": "₹2000", "isCorrect": false },
        { "text": "₹2500", "isCorrect": false },
        { "text": "₹3000", "isCorrect": false },
        { "text": "₹3500", "isCorrect": true }
      ]
    },
    {
      "id": 31,
      "question": "A sum of ₹1500 is lent at simple interest. After 4 years, the amount received is ₹2100. Find the rate of interest per annum.",
      "options": [
        { "text": "8%", "isCorrect": false },
        { "text": "10%", "isCorrect": true },
        { "text": "12%", "isCorrect": false },
        { "text": "15%", "isCorrect": false }
      ]
    },
    {
      "id": 32,
      "question": "In what time will ₹3600 amount to ₹4320 at 8% per annum simple interest?",
      "options": [
        { "text": "2 years", "isCorrect": false },
        { "text": "2.5 years", "isCorrect": true },
        { "text": "3 years", "isCorrect": false },
        { "text": "3.5 years", "isCorrect": false }
      ]
    },
    {
      "id": 33,
      "question": "The simple interest on a certain sum at 5% per annum for 3 years is ₹90 more than the interest on the same sum for 2 years at 4% per annum. Find the sum.",
      "options": [
        { "text": "₹2000", "isCorrect": false },
        { "text": "₹2500", "isCorrect": false },
        { "text": "₹3000", "isCorrect": true },
        { "text": "₹3500", "isCorrect": false }
      ]
    },
    {
      "id": 34,
      "question": "The average of 7 consecutive numbers is 20. What is the largest of these numbers?",
      "options": [
        { "text": "21", "isCorrect": false },
        { "text": "22", "isCorrect": false },
        { "text": "23", "isCorrect": true },
        { "text": "24", "isCorrect": false }
      ]
    },
    {
      "id": 35,
      "question": "The average weight of 10 students is 45 kg. When a new student joins, the average weight becomes 44 kg. Find the weight of the new student.",
      "options": [
        { "text": "34 kg", "isCorrect": true },
        { "text": "35 kg", "isCorrect": false },
        { "text": "36 kg", "isCorrect": false },
        { "text": "38 kg", "isCorrect": false }
      ]
    },
    {
      "id": 36,
      "question": "The average of five numbers is 26. If one number is excluded, the average becomes 24. What is the excluded number?",
      "options": [
        { "text": "32", "isCorrect": false },
        { "text": "34", "isCorrect": true },
        { "text": "36", "isCorrect": false },
        { "text": "38", "isCorrect": false }
      ]
    },
    {
      "id": 37,
      "question": "A student scores 55, 60, 65, and 70 in his first four tests. What should he score in his fifth test to have an overall average of 70?",
      "options": [
        { "text": "90", "isCorrect": false },
        { "text": "95", "isCorrect": false },
        { "text": "100", "isCorrect": true },
        { "text": "85", "isCorrect": false }
      ]
    },
    {
      "id": 38,
      "question": "Two numbers are in the ratio 7:9. If the sum of the numbers is 112, then the larger number is:",
      "options": [
        { "text": "49", "isCorrect": false },
        { "text": "63", "isCorrect": true },
        { "text": "72", "isCorrect": false },
        { "text": "77", "isCorrect": false }
      ]
    },
    {
      "id": 39,
      "question": "If A:B = 3:4 and B:C = 6:7, then A:C is equal to:",
      "options": [
        { "text": "9:14", "isCorrect": true },
        { "text": "7:8", "isCorrect": false },
        { "text": "5:7", "isCorrect": false },
        { "text": "3:7", "isCorrect": false }
      ]
    },
    {
      "id": 40,
      "question": "₹1200 is divided among A, B, and C in the ratio 2:3:5. Find the share of B.",
      "options": [
        { "text": "₹240", "isCorrect": false },
        { "text": "₹360", "isCorrect": true },
        { "text": "₹400", "isCorrect": false },
        { "text": "₹600", "isCorrect": false }
      ]
    },
    {
      "id": 41,
      "question": "The ratio of the number of boys and girls in a class is 3:2. If there are 15 boys, how many girls are there?",
      "options": [
        { "text": "10", "isCorrect": true },
        { "text": "12", "isCorrect": false },
        { "text": "15", "isCorrect": false },
        { "text": "18", "isCorrect": false }
      ]
    },
    {
      "id": 42,
      "question": "The ratio of the ages of a father and his son is 5:2. If the son is 16 years old, the age of the father is:",
      "options": [
        { "text": "40 years", "isCorrect": true },
        { "text": "45 years", "isCorrect": false },
        { "text": "50 years", "isCorrect": false },
        { "text": "55 years", "isCorrect": false }
      ]
    },
    {
      "id": 43,
      "question": "A train 150 meters long passes a pole in 10 seconds. What is the speed of the train in km/h?",
      "options": [
        { "text": "45 km/h", "isCorrect": false },
        { "text": "50 km/h", "isCorrect": false },
        { "text": "54 km/h", "isCorrect": true },
        { "text": "60 km/h", "isCorrect": false }
      ]
    },
    {
      "id": 44,
      "question": "If 20% of a number is 50, what is 40% of the same number?",
      "options": [
        { "text": "75", "isCorrect": false },
        { "text": "100", "isCorrect": true },
        { "text": "125", "isCorrect": false },
        { "text": "150", "isCorrect": false }
      ]
    },
    {
      "id": 45,
      "question": "A car travels 60 km in 45 minutes. What is its speed in km/h?",
      "options": [
        { "text": "70 km/h", "isCorrect": false },
        { "text": "75 km/h", "isCorrect": false },
        { "text": "80 km/h", "isCorrect": true },
        { "text": "85 km/h", "isCorrect": false }
      ]
    },
    {
      "id": 46,
      "question": "If 15 workers can complete a work in 12 days, how many workers are needed to complete the same work in 9 days?",
      "options": [
        { "text": "18", "isCorrect": false },
        { "text": "20", "isCorrect": true },
        { "text": "22", "isCorrect": false },
        { "text": "25", "isCorrect": false }
      ]
    },
    {
      "id": 47,
      "question": "A number when increased by 20% becomes 180. What is the number?",
      "options": [
        { "text": "140", "isCorrect": false },
        { "text": "150", "isCorrect": true },
        { "text": "160", "isCorrect": false },
        { "text": "170", "isCorrect": false }
      ]
    },
    {
      "id": 48,
      "question": "The area of a square is 144 sq cm. What is its perimeter?",
      "options": [
        { "text": "36 cm", "isCorrect": false },
        { "text": "48 cm", "isCorrect": true },
        { "text": "52 cm", "isCorrect": false },
        { "text": "56 cm", "isCorrect": false }
      ]
    },
    {
      "id": 49,
      "question": "If 3x + 7 = 22, what is the value of x?",
      "options": [
        { "text": "3", "isCorrect": false },
        { "text": "4", "isCorrect": false },
        { "text": "5", "isCorrect": true },
        { "text": "6", "isCorrect": false }
      ]
    },
    {
      "id": 50,
      "question": "A person sold two articles for ₹1000 each. On one he gains 25% and on the other he loses 25%. What is his overall gain or loss?",
      "options": [
        { "text": "No profit no loss", "isCorrect": false },
        { "text": "6.25% profit", "isCorrect": false },
        { "text": "6.25% loss", "isCorrect": true },
        { "text": "12.5% loss", "isCorrect": false }
      ]
    }
  ],
   currentAffairs: [
    {
      "id": 1,
      "question": "Which state recently launched the 'Mukhyamantri Majhi Ladki Bahin' scheme for women's empowerment?",
      "options": [
        {"text": "Maharashtra", "isCorrect": true},
        {"text": "Karnataka", "isCorrect": false},
        {"text": "Uttar Pradesh", "isCorrect": false},
        {"text": "Gujarat", "isCorrect": false}
      ]
    },
    {
      "id": 2,
      "question": "What is the name of India's first semiconductor fabrication plant recently approved by the Union Cabinet?",
      "options": [
        {"text": "Semicon India", "isCorrect": false},
        {"text": "India Semiconductor Mission", "isCorrect": false},
        {"text": "Semiconductor Manufacturing Plant", "isCorrect": false},
        {"text": "Semicon India Programme", "isCorrect": true}
      ]
    },
    {
      "id": 3,
      "question": "Which Indian city recently hosted the G20 Summit in 2023?",
      "options": [
        {"text": "Mumbai", "isCorrect": false},
        {"text": "New Delhi", "isCorrect": true},
        {"text": "Bengaluru", "isCorrect": false},
        {"text": "Chennai", "isCorrect": false}
      ]
    },
    {
      "id": 4,
      "question": "What is the name of Maharashtra's new industrial policy launched in 2023?",
      "options": [
        {"text": "Maharashtra Industrial Policy 2023", "isCorrect": true},
        {"text": "Make in Maharashtra", "isCorrect": false},
        {"text": "Industry First Policy", "isCorrect": false},
        {"text": "Maha Industrial Growth Policy", "isCorrect": false}
      ]
    },
    {
      "id": 5,
      "question": "Which Indian state recently implemented the Uniform Civil Code?",
      "options": [
        {"text": "Uttarakhand", "isCorrect": true},
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Gujarat", "isCorrect": false},
        {"text": "Madhya Pradesh", "isCorrect": false}
      ]
    },
    {
      "id": 6,
      "question": "What is the name of the new parliament building inaugurated in New Delhi?",
      "options": [
        {"text": "Sansad Bhavan", "isCorrect": false},
        {"text": "New Parliament House", "isCorrect": false},
        {"text": "Parliament of India", "isCorrect": false},
        {"text": "Sansad Soudha", "isCorrect": true}
      ]
    },
    {
      "id": 7,
      "question": "Which scheme was recently launched by Maharashtra government for farmer welfare?",
      "options": [
        {"text": "Mukhyamantri Krishi Sanjivani Yojana", "isCorrect": false},
        {"text": "Mahatma Jyotiba Phule Shetkari Karjmukti Yojana", "isCorrect": true},
        {"text": "Kisan Kalyan Yojana", "isCorrect": false},
        {"text": "Farmer Empowerment Scheme", "isCorrect": false}
      ]
    },
    {
      "id": 8,
      "question": "What is the name of India's digital currency launched by RBI?",
      "options": [
        {"text": "Digital Rupee", "isCorrect": true},
        {"text": "e-Rupee", "isCorrect": false},
        {"text": "India Coin", "isCorrect": false},
        {"text": "Digital Payment Currency", "isCorrect": false}
      ]
    },
    {
      "id": 9,
      "question": "Which Indian city was ranked as the world's most polluted city in 2023?",
      "options": [
        {"text": "Delhi", "isCorrect": true},
        {"text": "Mumbai", "isCorrect": false},
        {"text": "Kolkata", "isCorrect": false},
        {"text": "Chennai", "isCorrect": false}
      ]
    },
    {
      "id": 10,
      "question": "What is the name of Maharashtra's new metro project recently inaugurated?",
      "options": [
        {"text": "Mumbai Metro Line 3", "isCorrect": false},
        {"text": "Nagpur Metro Phase 2", "isCorrect": false},
        {"text": "Pune Metro Expansion", "isCorrect": false},
        {"text": "Mumbai Metro Line 2A and 7", "isCorrect": true}
      ]
    },
    {
      "id": 11,
      "question": "Which country recently became the 27th member of European Union?",
      "options": [
        {"text": "Ukraine", "isCorrect": false},
        {"text": "Croatia", "isCorrect": true},
        {"text": "Serbia", "isCorrect": false},
        {"text": "Montenegro", "isCorrect": false}
      ]
    },
    {
      "id": 12,
      "question": "What is the name of India's first indigenously developed aircraft carrier?",
      "options": [
        {"text": "INS Vikrant", "isCorrect": true},
        {"text": "INS Vishal", "isCorrect": false},
        {"text": "INS Vikramaditya", "isCorrect": false},
        {"text": "INS Viraat", "isCorrect": false}
      ]
    },
    {
      "id": 13,
      "question": "Which Indian state recently launched 'Ladli Behna Yojana' for women?",
      "options": [
        {"text": "Madhya Pradesh", "isCorrect": true},
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Rajasthan", "isCorrect": false},
        {"text": "Uttar Pradesh", "isCorrect": false}
      ]
    },
    {
      "id": 14,
      "question": "What is the name of Maharashtra's new IT policy launched to boost IT industry?",
      "options": [
        {"text": "Maha IT Policy 2023", "isCorrect": false},
        {"text": "Digital Maharashtra", "isCorrect": false},
        {"text": "Maharashtra IT/ITeS Policy 2023", "isCorrect": true},
        {"text": "Tech Maharashtra", "isCorrect": false}
      ]
    },
    {
      "id": 15,
      "question": "Which Indian space mission recently soft-landed on the Moon's south pole?",
      "options": [
        {"text": "Chandrayaan-3", "isCorrect": true},
        {"text": "Chandrayaan-2", "isCorrect": false},
        {"text": "Gaganyaan", "isCorrect": false},
        {"text": "Aditya-L1", "isCorrect": false}
      ]
    },
    {
      "id": 16,
      "question": "What is the name of the new education policy implemented across India?",
      "options": [
        {"text": "New Education Policy 2020", "isCorrect": true},
        {"text": "National Education Policy 2023", "isCorrect": false},
        {"text": "Education Reform Policy", "isCorrect": false},
        {"text": "Bharat Shiksha Policy", "isCorrect": false}
      ]
    },
    {
      "id": 17,
      "question": "Which Indian city recently hosted the International Olympic Committee session?",
      "options": [
        {"text": "Mumbai", "isCorrect": true},
        {"text": "New Delhi", "isCorrect": false},
        {"text": "Bengaluru", "isCorrect": false},
        {"text": "Hyderabad", "isCorrect": false}
      ]
    },
 {
      "id": 18,
      "question": "What is the name of Maharashtra's scheme for providing free electricity to farmers?",
      "options": [
        {"text": "Mukhyamantri Saur Krishi Vahini Yojana", "isCorrect": false},
        {"text": "Mahatma Jyotirao Phule Shetkari Karjmukti Yojana", "isCorrect": true},
        {"text": "Kisan Free Electricity Scheme", "isCorrect": false},
        {"text": "Farmer Power Relief Scheme", "isCorrect": false}
      ]
    },
    {
      "id": 19,
      "question": "Which Indian state recently implemented the 'One Family, One Job' scheme?",
      "options": [
        {"text": "Himachal Pradesh", "isCorrect": false},
        {"text": "Jharkhand", "isCorrect": false},
        {"text": "Sikkim", "isCorrect": true},
        {"text": "Assam", "isCorrect": false}
      ]
    },
    {
      "id": 20,
      "question": "What is the name of India's first solar mission launched recently?",
      "options": [
        {"text": "Aditya-L1", "isCorrect": true},
        {"text": "Surya-1", "isCorrect": false},
        {"text": "Solar Mission India", "isCorrect": false},
        {"text": "Sun Study Mission", "isCorrect": false}
      ]
    },
    {
      "id": 21,
      "question": "Which city in Maharashtra recently became the first to implement 'Modi Vasti' redevelopment project?",
      "options": [
        {"text": "Pune", "isCorrect": false},
        {"text": "Nashik", "isCorrect": true},
        {"text": "Nagpur", "isCorrect": false},
        {"text": "Aurangabad", "isCorrect": false}
      ]
    },
    {
      "id": 22,
      "question": "What is the name of the new criminal laws that replaced IPC, CrPC, and Evidence Act?",
      "options": [
        {"text": "Bharatiya Nyaya Sanhita", "isCorrect": true},
        {"text": "New Indian Penal Code", "isCorrect": false},
        {"text": "Indian Justice Code", "isCorrect": false},
        {"text": "Bharatiya Criminal Code", "isCorrect": false}
      ]
    },
    {
      "id": 23,
      "question": "Which Indian state recently launched 'Shramik Setu' portal for migrant workers?",
      "options": [
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Uttar Pradesh", "isCorrect": false},
        {"text": "Gujarat", "isCorrect": true},
        {"text": "Rajasthan", "isCorrect": false}
      ]
    },
    {
      "id": 24,
      "question": "What is the name of Maharashtra's new policy for promoting electric vehicles?",
      "options": [
        {"text": "Maha Electric Vehicle Policy 2023", "isCorrect": false},
        {"text": "Maharashtra EV Policy 2025", "isCorrect": true},
        {"text": "Green Vehicle Initiative", "isCorrect": false},
        {"text": "Electric Mobility Policy", "isCorrect": false}
      ]
    },
    {
      "id": 25,
      "question": "Which Indian city recently hosted the G20 Energy Ministers meeting?",
      "options": [
        {"text": "Goa", "isCorrect": true},
        {"text": "Mumbai", "isCorrect": false},
        {"text": "Bengaluru", "isCorrect": false},
        {"text": "Hyderabad", "isCorrect": false}
      ]
    },
    {
      "id": 26,
      "question": "What is the name of the scheme launched by Maharashtra for providing smartphones to youth?",
      "options": [
        {"text": "Maha Yuva Sanchar Yojana", "isCorrect": false},
        {"text": "Mukhyamantri Yuva Sanskruti Yojana", "isCorrect": false},
        {"text": "Maha Digital Student Scheme", "isCorrect": false},
        {"text": "Mukhyamantri Yuva Sathi Yojana", "isCorrect": true}
      ]
    },
    {
      "id": 27,
      "question": "Which Indian state recently implemented 'One Nation, One Ration Card' scheme completely?",
      "options": [
        {"text": "All states implemented", "isCorrect": true},
        {"text": "Only northern states", "isCorrect": false},
        {"text": "Only southern states", "isCorrect": false},
        {"text": "Only western states", "isCorrect": false}
      ]
    },
    {
      "id": 28,
      "question": "What is the name of Mumbai's coastal road project recently inaugurated?",
      "options": [
        {"text": "Mumbai Coastal Road", "isCorrect": false},
        {"text": "Dharmaveer Sambhaji Maharaj Coastal Road", "isCorrect": true},
        {"text": "Marine Drive Extension", "isCorrect": false},
        {"text": "Western Coast Highway", "isCorrect": false}
      ]
    },
    {
      "id": 29,
      "question": "Which country recently became India's top trading partner?",
      "options": [
        {"text": "USA", "isCorrect": false},
        {"text": "China", "isCorrect": false},
        {"text": "Russia", "isCorrect": true},
        {"text": "UAE", "isCorrect": false}
      ]
    },
    {
      "id": 30,
      "question": "What is the name of Maharashtra's scheme for providing financial assistance to women?",
      "options": [
        {"text": "Maha Shakti Yojana", "isCorrect": false},
        {"text": "Mukhyamantri Mahila Sashaktikaran Yojana", "isCorrect": true},
        {"text": "Women Empowerment Scheme", "isCorrect": false},
        {"text": "Stree Shakti Yojana", "isCorrect": false}
      ]
    },
    {
      "id": 31,
      "question": "Which Indian state recently launched 'Buldhana Pattern' for agricultural development?",
      "options": [
        {"text": "Maharashtra", "isCorrect": true},
        {"text": "Madhya Pradesh", "isCorrect": false},
        {"text": "Karnataka", "isCorrect": false},
        {"text": "Telangana", "isCorrect": false}
      ]
    },
    {
      "id": 32,
      "question": "What is the name of India's first water metro service launched recently?",
      "options": [
        {"text": "Kochi Water Metro", "isCorrect": true},
        {"text": "Mumbai Water Transport", "isCorrect": false},
        {"text": "Chennai Water Metro", "isCorrect": false},
        {"text": "Kolkata Water Metro", "isCorrect": false}
      ]
    },
    {
      "id": 33,
      "question": "Which city in Maharashtra recently got India's first high-speed railway corridor?",
      "options": [
        {"text": "Mumbai", "isCorrect": true},
        {"text": "Pune", "isCorrect": false},
        {"text": "Nagpur", "isCorrect": false},
        {"text": "Nashik", "isCorrect": false}
      ]
    },
    {
      "id": 34,
      "question": "What is the name of the scheme for providing free medical treatment to accident victims?",
      "options": [
        {"text": "Ayushman Bharat", "isCorrect": false},
        {"text": "Pradhan Mantri Jan Arogya Yojana", "isCorrect": false},
        {"text": "Good Samaritan Scheme", "isCorrect": false},
        {"text": "Pradhan Mantri Surakshit Sadak Yojana", "isCorrect": true}
      ]
    },
    {
      "id": 35,
      "question": "Which Indian state recently implemented 'Kisan Credit Card' scheme for fishermen?",
      "options": [
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Kerala", "isCorrect": false},
        {"text": "Gujarat", "isCorrect": false},
        {"text": "All coastal states", "isCorrect": true}
      ]
    },
    {
      "id": 36,
      "question": "What is the name of Mumbai's new international airport coming up?",
      "options": [
        {"text": "Navi Mumbai International Airport", "isCorrect": true},
        {"text": "Mumbai Second Airport", "isCorrect": false},
        {"text": "Panvel International Airport", "isCorrect": false},
        {"text": "Konkan International Airport", "isCorrect": false}
      ]
    },
    {
      "id": 37,
      "question": "Which Indian state recently launched 'Mukhyamantri Teerth Darshan Yojana' for senior citizens?",
      "options": [
        {"text": "Uttar Pradesh", "isCorrect": false},
        {"text": "Madhya Pradesh", "isCorrect": false},
        {"text": "Maharashtra", "isCorrect": true},
        {"text": "Rajasthan", "isCorrect": false}
      ]
    },
    {
      "id": 38,
      "question": "What is the name of India's first regional rapid transit system?",
      "options": [
        {"text": "Delhi-Meerut RRTS", "isCorrect": true},
        {"text": "Mumbai-Pune Rapid Rail", "isCorrect": false},
        {"text": "Chennai-Bengaluru RRTS", "isCorrect": false},
        {"text": "Delhi-Jaipur High Speed Rail", "isCorrect": false}
      ]
    },
    {
      "id": 39,
      "question": "Which city in Maharashtra recently got India's first hyperloop project?",
      "options": [
        {"text": "Pune", "isCorrect": true},
        {"text": "Mumbai", "isCorrect": false},
        {"text": "Nagpur", "isCorrect": false},
        {"text": "Aurangabad", "isCorrect": false}
      ]
    },
    {
      "id": 40,
      "question": "What is the name of the scheme for providing free coaching to SC/ST students?",
      "options": [
        {"text": "Free Coaching Scheme", "isCorrect": false},
        {"text": "Ambedkar Overseas Scholarship", "isCorrect": false},
        {"text": "National Fellowship for SC Students", "isCorrect": false},
        {"text": "Dr. Ambedkar Medhavi Chatra Yojana", "isCorrect": true}
      ]
    },
    {
      "id": 41,
      "question": "Which Indian state recently launched 'Mukhyamantri Awas Yojana' for urban poor?",
      "options": [
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Uttar Pradesh", "isCorrect": false},
        {"text": "Bihar", "isCorrect": true},
        {"text": "West Bengal", "isCorrect": false}
      ]
    },
    {
      "id": 42,
      "question": "What is the name of Maharashtra's scheme for providing free health checkups?",
      "options": [
        {"text": "Maha Arogya Yojana", "isCorrect": false},
        {"text": "Mukhyamantri Jan Arogya Yojana", "isCorrect": true},
        {"text": "Free Health Checkup Scheme", "isCorrect": false},
        {"text": "Health for All Initiative", "isCorrect": false}
      ]
    },
    {
      "id": 43,
      "question": "Which Indian city recently hosted the World Economic Forum meeting?",
      "options": [
        {"text": "New Delhi", "isCorrect": false},
        {"text": "Mumbai", "isCorrect": false},
        {"text": "Davos (Switzerland)", "isCorrect": true},
        {"text": "Geneva", "isCorrect": false}
      ]
    },
    {
      "id": 44,
      "question": "What is the name of the scheme for providing financial assistance to pregnant women?",
      "options": [
        {"text": "Pradhan Mantri Matru Vandana Yojana", "isCorrect": true},
        {"text": "Janani Suraksha Yojana", "isCorrect": false},
        {"text": "Maternity Benefit Scheme", "isCorrect": false},
        {"text": "Mother and Child Scheme", "isCorrect": false}
      ]
    },
    {
      "id": 45,
      "question": "Which Indian state recently launched 'Mukhyamantri Gram Sadak Yojana' for rural roads?",
      "options": [
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Uttar Pradesh", "isCorrect": false},
        {"text": "Madhya Pradesh", "isCorrect": true},
        {"text": "Rajasthan", "isCorrect": false}
      ]
    },
    {
      "id": 46,
      "question": "What is the name of India's first hydrogen fuel cell ferry?",
      "options": [
        {"text": "Green Voyager", "isCorrect": false},
        {"text": "Hydrogen Express", "isCorrect": false},
        {"text": "Eco Ferry", "isCorrect": false},
        {"text": "Not launched yet", "isCorrect": true}
      ]
    },
    {
      "id": 47,
      "question": "Which city in Maharashtra recently got India's first vertical garden?",
      "options": [
        {"text": "Mumbai", "isCorrect": false},
        {"text": "Pune", "isCorrect": false},
        {"text": "Nagpur", "isCorrect": true},
        {"text": "Thane", "isCorrect": false}
      ]
    },
    {
      "id": 48,
      "question": "What is the name of the scheme for providing free education to girls?",
      "options": [
        {"text": "Beti Bachao Beti Padhao", "isCorrect": true},
        {"text": "Kanya Shiksha Yojana", "isCorrect": false},
        {"text": "Girl Child Education Scheme", "isCorrect": false},
        {"text": "Saksham Kanya Yojana", "isCorrect": false}
      ]
    },
    {
      "id": 49,
      "question": "Which Indian state recently launched 'Mukhyamantri Swasthya Bima Yojana'?",
      "options": [
        {"text": "Maharashtra", "isCorrect": false},
        {"text": "Delhi", "isCorrect": true},
        {"text": "Karnataka", "isCorrect": false},
        {"text": "Tamil Nadu", "isCorrect": false}
      ]
    },
    {
      "id": 50,
      "question": "What is the name of Maharashtra's scheme for providing free laptops to students?",
      "options": [
        {"text": "Maha Digital Student Yojana", "isCorrect": false},
        {"text": "Mukhyamantri Yuva Sanskruti Yojana", "isCorrect": false},
        {"text": "Maha Student Laptop Scheme", "isCorrect": false},
        {"text": "Not launched yet", "isCorrect": true}
      ]
    }
  ],

  language: [
    {
      "id": 1,
      "question": "What is the meaning of the Hindi word 'प्रगति'?",
      "options": [
        {"text": "Progress", "isCorrect": true},
        {"text": "Problem", "isCorrect": false},
        {"text": "Project", "isCorrect": false},
        {"text": "Promise", "isCorrect": false}
      ]
    },
    {
      "id": 2,
      "question": "Which of these is the correct Marathi translation for 'Thank you'?",
      "options": [
        {"text": "धन्यवाद", "isCorrect": true},
        {"text": "शुभ रात्री", "isCorrect": false},
        {"text": "नमस्कार", "isCorrect": false},
        {"text": "क्षमा करा", "isCorrect": false}
      ]
    },
    {
      "id": 3,
      "question": "Choose the correct English translation: 'वह बहुत मेहनत करता है'",
      "options": [
        {"text": "He works very hard", "isCorrect": true},
        {"text": "He is very intelligent", "isCorrect": false},
        {"text": "He speaks very well", "isCorrect": false},
        {"text": "He runs very fast", "isCorrect": false}
      ]
    },
    {
      "id": 4,
      "question": "What is the meaning of the Marathi word 'उत्साह'?",
      "options": [
        {"text": "Enthusiasm", "isCorrect": true},
        {"text": "Sadness", "isCorrect": false},
        {"text": "Anger", "isCorrect": false},
        {"text": "Peace", "isCorrect": false}
      ]
    },
    {
      "id": 5,
      "question": "Which sentence is grammatically correct in English?",
      "options": [
        {"text": "She don't like coffee", "isCorrect": false},
        {"text": "She doesn't like coffee", "isCorrect": true},
        {"text": "She doesn't likes coffee", "isCorrect": false},
        {"text": "She not like coffee", "isCorrect": false}
      ]
    },
    {
      "id": 6,
      "question": "What is the Hindi word for 'Computer'?",
      "options": [
        {"text": "संगणक", "isCorrect": true},
        {"text": "किताब", "isCorrect": false},
        {"text": "कुर्सी", "isCorrect": false},
        {"text": "खिड़की", "isCorrect": false}
      ]
    },
    {
      "id": 7,
      "question": "Choose the correct Marathi translation: 'What is your name?'",
      "options": [
        {"text": "तुझं नाव काय आहे?", "isCorrect": true},
        {"text": "तू कसा आहेस?", "isCorrect": false},
        {"text": "तू कुठे राहतोस?", "isCorrect": false},
        {"text": "तू काय करतोस?", "isCorrect": false}
      ]
    },
    {
      "id": 8,
      "question": "What is the English meaning of 'सहयोग'?",
      "options": [
        {"text": "Cooperation", "isCorrect": true},
        {"text": "Competition", "isCorrect": false},
        {"text": "Complaint", "isCorrect": false},
        {"text": "Celebration", "isCorrect": false}
      ]
    },
    {
      "id": 9,
      "question": "Which of these is a correct Hindi sentence?",
      "options": [
        {"text": "मैं स्कूल जाता हूँ", "isCorrect": true},
        {"text": "मैं स्कूल जाती है", "isCorrect": false},
        {"text": "मैं स्कूल जाते हैं", "isCorrect": false},
        {"text": "मैं स्कूल जाता है", "isCorrect": false}
      ]
    },
    {
      "id": 10,
      "question": "What is the Marathi word for 'Water'?",
      "options": [
        {"text": "पाणी", "isCorrect": true},
        {"text": "दूध", "isCorrect": false},
        {"text": "चहा", "isCorrect": false},
        {"text": "तेल", "isCorrect": false}
      ]
    },
    {
      "id": 11,
      "question": "Choose the correct English translation: 'तो बागेत फुले आहेत'",
      "options": [
        {"text": "There are flowers in the garden", "isCorrect": true},
        {"text": "The garden is beautiful", "isCorrect": false},
        {"text": "Flowers are colorful", "isCorrect": false},
        {"text": "I like gardens", "isCorrect": false}
      ]
    },
    {
      "id": 12,
      "question": "What is the Hindi equivalent of 'Good morning'?",
      "options": [
        {"text": "शुभ प्रभात", "isCorrect": true},
        {"text": "शुभ रात्रि", "isCorrect": false},
        {"text": "नमस्ते", "isCorrect": false},
        {"text": "धन्यवाद", "isCorrect": false}
      ]
    },
    {
      "id": 13,
      "question": "Which Marathi sentence means 'I am learning'?",
      "options": [
        {"text": "मी शिकत आहे", "isCorrect": true},
        {"text": "मी खात आहे", "isCorrect": false},
        {"text": "मी झोपत आहे", "isCorrect": false},
        {"text": "मी बोलत आहे", "isCorrect": false}
      ]
    },
    {
      "id": 14,
      "question": "What is the English meaning of 'विकास'?",
      "options": [
        {"text": "Development", "isCorrect": true},
        {"text": "Destruction", "isCorrect": false},
        {"text": "Discussion", "isCorrect": false},
        {"text": "Distribution", "isCorrect": false}
      ]
    },
    {
      "id": 15,
      "question": "Choose the correct Hindi translation: 'The book is on the table'",
      "options": [
        {"text": "किताब मेज़ पर है", "isCorrect": true},
        {"text": "किताब मेज़ में है", "isCorrect": false},
        {"text": "किताब मेज़ से है", "isCorrect": false},
        {"text": "किताब मेज़ को है", "isCorrect": false}
      ]
    },
    {
      "id": 16,
      "question": "What is the Marathi word for 'Friend'?",
      "options": [
        {"text": "मित्र", "isCorrect": true},
        {"text": "शत्रु", "isCorrect": false},
        {"text": "नातेवाईक", "isCorrect": false},
        {"text": "शेजारी", "isCorrect": false}
      ]
    },
    {
      "id": 17,
      "question": "Which English sentence is correct?",
      "options": [
        {"text": "They are going to market", "isCorrect": true},
        {"text": "They is going to market", "isCorrect": false},
        {"text": "They am going to market", "isCorrect": false},
        {"text": "They going to market", "isCorrect": false}
      ]
    },
    {
      "id": 18,
      "question": "What is the Hindi meaning of 'Education'?",
      "options": [
        {"text": "शिक्षा", "isCorrect": true},
        {"text": "स्वास्थ्य", "isCorrect": false},
        {"text": "धन", "isCorrect": false},
        {"text": "यात्रा", "isCorrect": false}
      ]
    },
    {
      "id": 19,
      "question": "Choose the correct Marathi translation: 'I live in Mumbai'",
      "options": [
        {"text": "मी मुंबईत राहतो", "isCorrect": true},
        {"text": "मी मुंबईला जातो", "isCorrect": false},
        {"text": "मी मुंबईचा आहे", "isCorrect": false},
        {"text": "मी मुंबईहून आलो", "isCorrect": false}
      ]
    },
    {
      "id": 20,
      "question": "What is the English equivalent of 'कृपया'?",
      "options": [
        {"text": "Please", "isCorrect": true},
        {"text": "Thank you", "isCorrect": false},
        {"text": "Sorry", "isCorrect": false},
        {"text": "Welcome", "isCorrect": false}
      ]
    },
    {
      "id": 21,
      "question": "Which Hindi word means 'Beautiful'?",
      "options": [
        {"text": "सुंदर", "isCorrect": true},
        {"text": "बड़ा", "isCorrect": false},
        {"text": "छोटा", "isCorrect": false},
        {"text": "तेज़", "isCorrect": false}
      ]
    },
    {
      "id": 22,
      "question": "What is the Marathi translation for 'How are you?'",
      "options": [
        {"text": "तू कसा आहेस?", "isCorrect": true},
        {"text": "तुझं नाव काय?", "isCorrect": false},
        {"text": "तू कुठे आहेस?", "isCorrect": false},
        {"text": "तू काय करतोस?", "isCorrect": false}
      ]
    },
    {
      "id": 23,
      "question": "Choose the correct English sentence: 'वह गाना गा रही है'",
      "options": [
        {"text": "She is singing a song", "isCorrect": true},
        {"text": "She sings a song", "isCorrect": false},
        {"text": "She sang a song", "isCorrect": false},
        {"text": "She will sing a song", "isCorrect": false}
      ]
    },
    {
      "id": 24,
      "question": "What is the Hindi word for 'Government'?",
      "options": [
        {"text": "सरकार", "isCorrect": true},
        {"text": "समाज", "isCorrect": false},
        {"text": "संस्था", "isCorrect": false},
        {"text": "सेवा", "isCorrect": false}
      ]
    },
    {
      "id": 25,
      "question": "Which Marathi sentence means 'It is raining'?",
      "options": [
        {"text": "पाऊस पडत आहे", "isCorrect": true},
        {"text": "वारा वाहत आहे", "isCorrect": false},
        {"text": "सूर्य उगवला आहे", "isCorrect": false},
        {"text": "थंडी पडत आहे", "isCorrect": false}
      ]
    },
    {
      "id": 26,
      "question": "What is the English meaning of 'समस्या'?",
      "options": [
        {"text": "Problem", "isCorrect": true},
        {"text": "Solution", "isCorrect": false},
        {"text": "Question", "isCorrect": false},
        {"text": "Answer", "isCorrect": false}
      ]
    },
    {
      "id": 27,
      "question": "Choose the correct Hindi translation: 'The sun is shining'",
      "options": [
        {"text": "सूरज चमक रहा है", "isCorrect": true},
        {"text": "सूरज डूब रहा है", "isCorrect": false},
        {"text": "सूरज निकल रहा है", "isCorrect": false},
        {"text": "सूरज गर्म है", "isCorrect": false}
      ]
    },
    {
      "id": 28,
      "question": "What is the Marathi word for 'Food'?",
      "options": [
        {"text": "अन्न", "isCorrect": true},
        {"text": "पाणी", "isCorrect": false},
        {"text": "वस्त्र", "isCorrect": false},
        {"text": "घर", "isCorrect": false}
      ]
    },
    {
      "id": 29,
      "question": "Which English word means 'प्रेम'?",
      "options": [
        {"text": "Love", "isCorrect": true},
        {"text": "Hate", "isCorrect": false},
        {"text": "Like", "isCorrect": false},
        {"text": "Care", "isCorrect": false}
      ]
    },
    {
      "id": 30,
      "question": "What is the Hindi translation for 'Good night'?",
      "options": [
        {"text": "शुभ रात्रि", "isCorrect": true},
        {"text": "शुभ प्रभात", "isCorrect": false},
        {"text": "नमस्ते", "isCorrect": false},
        {"text": "धन्यवाद", "isCorrect": false}
      ]
    },
    {
      "id": 31,
      "question": "Choose the correct Marathi sentence: 'I am eating'",
      "options": [
        {"text": "मी खात आहे", "isCorrect": true},
        {"text": "मी पित आहे", "isCorrect": false},
        {"text": "मी झोपत आहे", "isCorrect": false},
        {"text": "मी बसत आहे", "isCorrect": false}
      ]
    },
    {
      "id": 32,
      "question": "What is the English equivalent of 'धन्यवाद'?",
      "options": [
        {"text": "Thank you", "isCorrect": true},
        {"text": "Please", "isCorrect": false},
        {"text": "Sorry", "isCorrect": false},
        {"text": "Welcome", "isCorrect": false}
      ]
    },
    {
      "id": 33,
      "question": "Which Hindi word means 'City'?",
      "options": [
        {"text": "शहर", "isCorrect": true},
        {"text": "गाँव", "isCorrect": false},
        {"text": "देश", "isCorrect": false},
        {"text": "राज्य", "isCorrect": false}
      ]
    },
    {
      "id": 34,
      "question": "What is the Marathi translation for 'What time is it?'",
      "options": [
        {"text": "किती वाजले?", "isCorrect": true},
        {"text": "काय चालू आहे?", "isCorrect": false},
        {"text": "कुठे जायचं?", "isCorrect": false},
        {"text": "कसं आहे?", "isCorrect": false}
      ]
    },
    {
      "id": 35,
      "question": "Choose the correct English translation: 'माझं नाव राज आहे'",
      "options": [
        {"text": "My name is Raj", "isCorrect": true},
        {"text": "I am Raj", "isCorrect": false},
        {"text": "Raj is my friend", "isCorrect": false},
        {"text": "This is Raj", "isCorrect": false}
      ]
    },
    {
      "id": 36,
      "question": "What is the Hindi word for 'Water'?",
      "options": [
        {"text": "पानी", "isCorrect": true},
        {"text": "आग", "isCorrect": false},
        {"text": "हवा", "isCorrect": false},
        {"text": "मिट्टी", "isCorrect": false}
      ]
    },
    {
      "id": 37,
      "question": "Which Marathi sentence means 'I don't know'?",
      "options": [
        {"text": "मला माहीत नाही", "isCorrect": true},
        {"text": "मला आवडत नाही", "isCorrect": false},
        {"text": "मला जमत नाही", "isCorrect": false},
        {"text": "मला पटत नाही", "isCorrect": false}
      ]
    },
    {
      "id": 38,
      "question": "What is the English meaning of 'स्वतंत्रता'?",
      "options": [
        {"text": "Freedom", "isCorrect": true},
        {"text": "Dependence", "isCorrect": false},
        {"text": "Unity", "isCorrect": false},
        {"text": "Peace", "isCorrect": false}
      ]
    },
    {
      "id": 39,
      "question": "Choose the correct Hindi translation: 'He is reading a book'",
      "options": [
        {"text": "वह किताब पढ़ रहा है", "isCorrect": true},
        {"text": "वह किताब लिख रहा है", "isCorrect": false},
        {"text": "वह किताब खरीद रहा है", "isCorrect": false},
        {"text": "वह किताब देख रहा है", "isCorrect": false}
      ]
    },
    {
      "id": 40,
      "question": "What is the Marathi word for 'House'?",
      "options": [
        {"text": "घर", "isCorrect": true},
        {"text": "बाग", "isCorrect": false},
        {"text": "शाळा", "isCorrect": false},
        {"text": "दुकान", "isCorrect": false}
      ]
    },
    {
      "id": 41,
      "question": "Which English word means 'स्वास्थ्य'?",
      "options": [
        {"text": "Health", "isCorrect": true},
        {"text": "Wealth", "isCorrect": false},
        {"text": "Happiness", "isCorrect": false},
        {"text": "Success", "isCorrect": false}
      ]
    },
    {
      "id": 42,
      "question": "What is the Hindi translation for 'Good afternoon'?",
      "options": [
        {"text": "शुभ दोपहर", "isCorrect": true},
        {"text": "शुभ सुबह", "isCorrect": false},
        {"text": "शुभ संध्या", "isCorrect": false},
        {"text": "शुभ रात्रि", "isCorrect": false}
      ]
    },
    {
      "id": 43,
      "question": "Choose the correct Marathi sentence: 'I can speak Marathi'",
      "options": [
        {"text": "मी मराठी बोलू शकतो", "isCorrect": true},
        {"text": "मी मराठी शिकत आहे", "isCorrect": false},
        {"text": "मी मराठी समजतो", "isCorrect": false},
        {"text": "मी मराठी ऐकतो", "isCorrect": false}
      ]
    },
    {
      "id": 44,
      "question": "What is the English equivalent of 'क्षमा करें'?",
      "options": [
        {"text": "Sorry", "isCorrect": true},
        {"text": "Thank you", "isCorrect": false},
        {"text": "Please", "isCorrect": false},
        {"text": "Welcome", "isCorrect": false}
      ]
    },
    {
      "id": 45,
      "question": "Which Hindi word means 'Teacher'?",
      "options": [
        {"text": "शिक्षक", "isCorrect": true},
        {"text": "विद्यार्थी", "isCorrect": false},
        {"text": "डॉक्टर", "isCorrect": false},
        {"text": "इंजीनियर", "isCorrect": false}
      ]
    },    {
      "id": 46,
      "question": "What is the Marathi translation for 'Where is the station?'",
      "options": [
        {"text": "स्टेशन कुठे आहे?", "isCorrect": true},
        {"text": "स्टेशन किती लांब आहे?", "isCorrect": false},
        {"text": "स्टेशन कसे जायचे?", "isCorrect": false},
        {"text": "स्टेशन कोणते आहे?", "isCorrect": false}
      ]
    },
    {
      "id": 47,
      "question": "Choose the correct English translation: 'मैं हिंदी बोल सकता हूँ'",
      "options": [
        {"text": "I can speak Hindi", "isCorrect": true},
        {"text": "I am speaking Hindi", "isCorrect": false},
        {"text": "I want to speak Hindi", "isCorrect": false},
        {"text": "I like Hindi", "isCorrect": false}
      ]
    },
    {
      "id": 48,
      "question": "What is the Hindi word for 'Money'?",
      "options": [
        {"text": "पैसा", "isCorrect": true},
        {"text": "समय", "isCorrect": false},
        {"text": "शक्ति", "isCorrect": false},
        {"text": "ज्ञान", "isCorrect": false}
      ]
    },
    {
      "id": 49,
      "question": "Which Marathi sentence means 'I understand'?",
      "options": [
        {"text": "मला समजले", "isCorrect": true},
        {"text": "मला आवडले", "isCorrect": false},
        {"text": "मला झाले", "isCorrect": false},
        {"text": "मला मिळाले", "isCorrect": false}
      ]
    },
    {
      "id": 50,
      "question": "What is the English meaning of 'संस्कृति'?",
      "options": [
        {"text": "Culture", "isCorrect": true},
        {"text": "Tradition", "isCorrect": false},
        {"text": "Religion", "isCorrect": false},
        {"text": "Heritage", "isCorrect": false}
      ]
    }
  ]
};

// Validate required environment variables
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY not found in environment variables");
}

console.log("🔧 Initializing Firebase with environment variables...");

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("✅ Firebase initialized successfully with environment variables");
} catch (error) {
  console.error("❌ Error initializing Firebase:", error.message);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session setup
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Multer setup for video uploads
const upload = multer({ storage: multer.memoryStorage() });

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "##admin123456";

// Helper functions
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateUniqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function selectQuestionsForCandidate() {
  return {
    writing: shuffle([...questionBanks.writing]).slice(0, 2),
    political: shuffle([...questionBanks.political]).slice(0, 10),
    aptitude: shuffle([...questionBanks.aptitude]).slice(0, 10),
    currentAffairs: shuffle([...questionBanks.currentAffairs]).slice(0, 10),
    language: shuffle([...questionBanks.language]).slice(0, 10),
  };
}

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

// Routes

// Test route to check if EJS is working
app.get("/test-template", (req, res) => {
  res.render("candidate/simple-test", {
    token: "test-token",
    name: "Test Candidate",
    email: "test@example.com",
  });
});

// Diagnostic route to check candidate data
app.get("/debug/candidate/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.json({ error: "Candidate not found" });
    }
    const candidate = doc.data();
    res.json({
      exists: true,
      name: candidate.name,
      email: candidate.email,
      verified: candidate.verified,
      examStarted: candidate.examStarted,
      examCompleted: candidate.examCompleted,
      currentModule: candidate.currentModule,
      expiresAt: candidate.expiresAt ? candidate.expiresAt.toDate() : null,
      assignedQuestions: candidate.assignedQuestions
        ? Object.keys(candidate.assignedQuestions)
        : "none",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Admin Login Routes
app.get("/admin/login", (req, res) => {
  res.render("admin/login", { error: null });
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/login", { error: "Invalid username or password" });
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

// Admin Routes
app.get("/admin/dashboard", isAdmin, async (req, res) => {
  try {
    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      error: req.query.error || null,
      successMessage: req.query.success || null,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res
      .status(500)
      .render("admin/dashboard", { candidates: [], error: "Error fetching candidates" });
  }
});

app.post("/admin/create-candidate", isAdmin, async (req, res) => {
  try {
    const { email, name, position } = req.body;

    // Server-side validation
    if (!email || !name) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Email and name are required",
      });
    }

    // Trim and validate inputs
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPosition = position ? position.trim() : "General Candidate";

    if (!trimmedEmail || !trimmedName) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Email and name cannot be empty",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "Please enter a valid email address",
      });
    }

    // Check if candidate already exists
    const existingCandidateQuery = await db
      .collection("candidates")
      .where("email", "==", trimmedEmail.toLowerCase())
      .get();

    if (!existingCandidateQuery.empty) {
      const candidatesSnapshot = await db.collection("candidates").get();
      const candidates = candidatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.render("admin/dashboard", {
        candidates,
        error: "A candidate with this email already exists",
      });
    }

    const token = generateUniqueToken();
    const link = `${BASE_URL}/candidate/${token}`;

    await db.collection("candidates").doc(token).set({
      email: trimmedEmail.toLowerCase(),
      name: trimmedName,
      position: trimmedPosition,
      token,
      link,
      verified: false,
      examStarted: false,
      examCompleted: false,
      currentModule: null,
      scores: {
        writing: null,
        political: null,
        aptitude: null,
        currentAffairs: null,
        language: null,
      },
      answers: {},
      videoUrls: {
        writing: null,
        political: null,
        aptitude: null,
        currentAffairs: null,
        language: null,
      },
      proctoringLogs: {
        writing: [],
        political: [],
        aptitude: [],
        currentAffairs: [],
        language: [],
      },
      assignedQuestions: selectQuestionsForCandidate(),
      activity: [
        `Candidate created for position: ${trimmedPosition} at ${new Date().toISOString()}`,
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Link expires in 7 days
    });

    console.log(`✅ Assessment link for ${trimmedName} (${trimmedEmail}): ${link}`);

    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      successMessage: `Candidate "${trimmedName}" created successfully! Assessment link: ${link}`,
    });
  } catch (error) {
    console.error("❌ Error creating candidate:", error);

    const candidatesSnapshot = await db.collection("candidates").get();
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.render("admin/dashboard", {
      candidates,
      error: "Error creating candidate. Please try again.",
    });
  }
});

// Reset exam endpoint
app.post("/admin/candidate/:token/reset-exam", isAdmin, async (req, res) => {
  const { token } = req.params;
  try {
    await db.collection("candidates").doc(token).update({
      verified: false,
      examStarted: false,
      examCompleted: false,
      currentModule: null,
      scores: {
        writing: null,
        political: null,
        aptitude: null,
        currentAffairs: null,
        language: null,
      },
      answers: {},
      videoUrls: {
        writing: null,
        political: null,
        aptitude: null,
        currentAffairs: null,
        language: null,
      },
      proctoringLogs: {
        writing: [],
        political: [],
        aptitude: [],
        currentAffairs: [],
        language: [],
      },
      startTime: null,
      completedAt: null,
      assignedQuestions: selectQuestionsForCandidate(),
      activity: admin.firestore.FieldValue.arrayUnion(
        `Exam reset by admin at ${new Date().toISOString()}`
      ),
    });
    res.redirect(`/admin/candidate/${token}?success=Exam reset successfully`);
  } catch (error) {
    console.error("Error resetting exam:", error);
    res.redirect(`/admin/candidate/${token}?error=Error resetting exam`);
  }
});

// Admin candidate details route
app.get("/admin/candidate/:token", isAdmin, async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).render("error", { message: "Candidate not found" });
    }
    const candidate = doc.data();


    // Prepare answers display
    const detailedAnswers = {};
    Object.keys(candidate.assignedQuestions || {}).forEach((mod) => {
      const questions = candidate.assignedQuestions[mod] || [];
      const modAnswers = candidate.answers[mod] || {};
      detailedAnswers[mod] = questions.map((q) => ({
        question: q.question,
        answer: modAnswers[q.id] || "No answer",
        isCorrect:
          mod !== "writing" &&
          q.options?.find((opt) => opt.isCorrect && opt.text === modAnswers[q.id]),
        correctAnswer: mod !== "writing" ? q.options?.find((opt) => opt.isCorrect)?.text : null,
      }));
    });

    candidate.detailedAnswers = detailedAnswers;
    candidate.detailedScores = candidate.scores || {};
    candidate.proctoringLogs = candidate.proctoringLogs || {};
    candidate.videoUrls = candidate.videoUrls || {};

    res.render("admin/candidate-details", { candidate });
  } catch (error) {
    console.error("Error fetching candidate details:", error);
    res.status(500).render("error", { message: "Error loading candidate details" });
  }
});

// Admin manual grading for writing module
app.post("/admin/candidate/:token/grade-writing", isAdmin, async (req, res) => {
  const { token } = req.params;
  const { writingScore } = req.body;

  try {
    const score = parseInt(writingScore);
    if (isNaN(score) || score < 0 || score > 2) {
      return res.redirect(
        `/admin/candidate/${token}?error=Writing score must be between 0 and 2`
      );
    }

    await db.collection("candidates").doc(token).update({
      "scores.writing": score,
      activity: admin.firestore.FieldValue.arrayUnion(
        `Writing module graded with score ${score}/2 at ${new Date().toISOString()}`
      ),
    });

    res.redirect(`/admin/candidate/${token}?success=Writing score updated successfully`);
  } catch (error) {
    console.error("Error grading writing module:", error);
    res.redirect(`/admin/candidate/${token}?error=Error updating writing score`);
  }
});

// Candidate Routes
app.get("/candidate/:token", async (req, res) => {
  const { token } = req.params;
  console.log(`🔍 Loading candidate with token: ${token}`);

  try {
    const doc = await db.collection("candidates").doc(token).get();

    if (!doc.exists) {
      console.log("❌ Candidate not found in database");
      return res.status(404).render("error", { message: "Invalid assessment link" });
    }

    const candidate = doc.data();
    console.log(`✅ Candidate found: ${candidate.name} (${candidate.email})`);
    console.log(
      `📊 Candidate status: verified=${candidate.verified}, examStarted=${candidate.examStarted}, examCompleted=${candidate.examCompleted}`
    );

    // Check if link expired
    if (candidate.expiresAt && candidate.expiresAt.toDate() < new Date()) {
      console.log("❌ Assessment link expired");
      return res.status(410).render("error", {
        message: "This assessment link has expired. Please contact the administrator for a new link.",
      });
    }

    if (candidate.examCompleted) {
      console.log("📝 Candidate has completed exam");
      return res.redirect(`/candidate/${token}/results`);
    }

    // Auto-verify and start exam
    if (!candidate.verified) {
      console.log("🔐 Auto-verifying candidate...");
      await db.collection("candidates").doc(token).update({
        verified: true,
        verifiedAt: new Date(),
        activity: admin.firestore.FieldValue.arrayUnion(
          `Auto-verified at ${new Date().toISOString()}`
        ),
      });
      console.log("✅ Candidate auto-verified");
    }

    if (!candidate.examStarted) {
      console.log("🚀 Auto-starting exam...");
      await db.collection("candidates").doc(token).update({
        examStarted: true,
        startTime: new Date(),
        currentModule: "writing",
        activity: admin.firestore.FieldValue.arrayUnion(
          `Assessment auto-started at ${new Date().toISOString()}`
        ),
      });
      console.log("✅ Exam auto-started");
    }

    // Redirect to current module
    const currentModule = candidate.currentModule || "writing";
    console.log(`📚 Redirecting to current module: ${currentModule}`);
    res.redirect(`/candidate/${token}/module/${currentModule}`);
  } catch (error) {
    console.error("💥 Error loading candidate:", error);
    res.status(500).render("error", {
      message: "Something went wrong while loading your assessment. Please try again or contact support.",
    });
  }
});

app.get("/candidate/:token/module/:module", async (req, res) => {
  const { token, module } = req.params;
  console.log(`📖 Loading module: ${module} for token: ${token}`);
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).render("error", { message: "Invalid assessment link" });
    }

    const candidate = doc.data();

    if (!candidate.verified || !candidate.examStarted) {
      return res.redirect(`/candidate/${token}`);
    }

    if (candidate.examCompleted) {
      return res.redirect(`/candidate/${token}/results`);
    }

    const validModules = ["writing", "political", "aptitude", "currentAffairs", "language"];
    if (!validModules.includes(module)) {
      return res.status(404).render("error", { message: "Invalid module" });
    }

    const questions = candidate.assignedQuestions[module] || [];
    const currentAnswers = candidate.answers[module] || {};
    // Set time limits
   const timeLimits = {
      writing: 600, // 10 minutes
      political: 300, // 5 minutes
      aptitude: 300, // 5 minutes
      currentAffairs: 300, // 5 minutes
      language: 300, // 5 minutes
    };
    const timeLimit = timeLimits[module];

    // Capitalize module name for display
    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    res.render("candidate/module", {
      moduleName,
      module,
      questions,
      currentAnswers,
      candidate,
      timeLimit,
    });
  } catch (error) {
    console.error("Error loading module:", error);
    res.status(500).render("error", {
      message: "Something went wrong while loading your assessment module. Please try refreshing or contact support.",
    });
  }
});

app.post("/candidate/:token/log-proctoring", async (req, res) => {
  const { token } = req.params;
  const { module, logs } = req.body;
  try {
    await db.collection("candidates").doc(token).update({
      [`proctoringLogs.${module}`]: admin.firestore.FieldValue.arrayUnion(...logs),
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error logging proctoring:", error);
    res.status(500).json({ success: false });
  }
});

app.post("/candidate/:token/submit-module", upload.single("video"), async (req, res) => {
  const { token } = req.params;
  const { module } = req.body;
  let answers, timeSpent, proctoringLogsStr;

  try {
    answers = JSON.parse(req.body.answers || "{}");
    timeSpent = parseInt(req.body.timeSpent) || 0;
    proctoringLogsStr = JSON.parse(req.body.proctoringLogs || "[]");
  } catch (e) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  console.log(`📤 Submitting module: ${module} for token: ${token}`);

  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const candidate = doc.data();
    const assignedQuestions = candidate.assignedQuestions[module] || [];

    // Evaluate score
    let score = null;
    let maxScore = null;

    if (module === "writing") {
      score = null; // Writing is manually graded
      maxScore = 2;
    } else {
      score = 0;
      maxScore = 10; // 10 questions for political, aptitude, currentAffairs, language
      assignedQuestions.forEach((q) => {
        const givenAnswer = answers[q.id];
        const correctOption = q.options?.find((opt) => opt.isCorrect);
        if (givenAnswer && correctOption && givenAnswer === correctOption.text) {
          score++;
        }
      });
    }

    // Upload video (if present)
    let videoUrl = null;
    if (req.file) {
      const fileName = `recordings/${token}/${module}-${Date.now()}.webm`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { firebaseStorageDownloadTokens: token },
      });

      videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
        fileName
      )}?alt=media&token=${token}`;
    }

    // Update candidate record
    const updates = {
      [`answers.${module}`]: answers,
      [`scores.${module}`]: score,
      [`videoUrls.${module}`]: videoUrl,
      currentModule: module,
      activity: admin.firestore.FieldValue.arrayUnion(
        `Module ${module} submitted at ${new Date().toISOString()} (timeSpent=${timeSpent}s, score=${
          score ?? "N/A"
        })`
      ),
    };

    // Only include proctoringLogs update if there are logs
    if (proctoringLogsStr.length > 0) {
      updates[`proctoringLogs.${module}`] = admin.firestore.FieldValue.arrayUnion(...proctoringLogsStr);
    } else {
      // Optionally set to an empty array if no logs are provided
      updates[`proctoringLogs.${module}`] = [];
    }

    await db.collection("candidates").doc(token).update(updates);

    // Decide next module
    const moduleOrder = ["writing", "political", "aptitude", "currentAffairs", "language"];
    const currentIndex = moduleOrder.indexOf(module);

    let nextModule = null;
    if (currentIndex >= 0 && currentIndex < moduleOrder.length - 1) {
      nextModule = moduleOrder[currentIndex + 1];
      await db.collection("candidates").doc(token).update({ currentModule: nextModule });
    } else {
      // Last module completed
      await db.collection("candidates").doc(token).update({
        examCompleted: true,
        completedAt: new Date(),
        activity: admin.firestore.FieldValue.arrayUnion(
          `Assessment completed at ${new Date().toISOString()}`
        ),
      });
    }

    res.json({ success: true, nextModule });
  } catch (error) {
    console.error("❌ Error submitting module:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/candidate/:token/results", async (req, res) => {
  const { token } = req.params;
  try {
    const doc = await db.collection("candidates").doc(token).get();
    if (!doc.exists) {
      return res.status(404).render("error", { message: "Candidate not found" });
    }

    const candidate = doc.data();
    if (!candidate.examCompleted) {
      return res.status(400).render("error", { message: "Assessment not completed yet" });
    }

    const totalScore = Object.values(candidate.scores || {}).reduce(
      (sum, score) => sum + (score || 0),
      0
    );
    const maxTotalScore = 42; // 2 (writing) + 10 (political) + 10 (aptitude) + 10 (currentAffairs) + 10 (language)

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Assessment Results</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  color: #333;
              }
              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                  text-align: center;
              }
              .success { color: #28a745; }
              .scores { 
                  margin: 30px 0; 
                  text-align: left;
                  display: inline-block;
              }
              .scores li { margin: 10px 0; font-size: 18px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 class="success">Assessment Completed! 🎉</h1>
              <p>Congratulations <strong>${candidate.name}</strong>!</p>
              <p>You have successfully completed the assessment.</p>
              <p>Your results have been recorded and will be reviewed by our team.</p>
              <p>You will be contacted soon regarding the next steps.</p>
              <p><strong>Thank you for your participation!</strong></p>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).render("error", { message: "Error fetching results" });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send(`
    <h1>Professional Assessment System</h1>
    <p>Amazon/Google Style Interview Platform 🚀</p>
    <ul>
      <li><a href="/admin/login">Admin Dashboard</a></li>
      <li><a href="/test-template">Test Template</a></li>
    </ul>
    <p><em>Note: Set BASE_URL env var for public access across devices/networks (e.g., ngrok URL).</em></p>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", {
    message: "Something went wrong! Please try again later.",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
    message: "The page you are looking for does not exist.",
  });
});

app.listen(3000, () => {
  console.log("🚀 Professional Assessment System running at http://localhost:3000");
  console.log("👨‍💼 Admin dashboard: http://localhost:3000/admin/login");
  console.log("🧪 Test template: http://localhost:3000/test-template");
  console.log("📊 System ready for candidate assessments");
  console.log(`🔗 Assessment links use BASE_URL: ${BASE_URL}`);
});

