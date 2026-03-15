const db = require('../config/db');

// Sample questions for each topic (10 questions per topic = 150 total)
const sampleQuestions = {
  // Percentages (topic_id: 1)
  percentages: [
    {
      question_text: "What is 35% of 200?",
      option_a: "60",
      option_b: "70",
      option_c: "80",
      option_d: "90",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "A student scored 85% on a test with 40 questions. How many questions did they answer correctly?",
      option_a: "32",
      option_b: "34",
      option_c: "36",
      option_d: "38",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "If the price of a product increases by 20% and then decreases by 20%, what is the net change?",
      option_a: "0%",
      option_b: "-4%",
      option_c: "+4%",
      option_d: "-2%",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "A company's revenue grew from $500,000 to $600,000. What is the percentage increase?",
      option_a: "15%",
      option_b: "18%",
      option_c: "20%",
      option_d: "25%",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "If 40% of a number is 120, what is 75% of that number?",
      option_a: "180",
      option_b: "200",
      option_c: "225",
      option_d: "250",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "A population increases by 10% each year. If it starts at 50,000, what will it be after 2 years?",
      option_a: "55,000",
      option_b: "60,000",
      option_c: "60,500",
      option_d: "65,000",
      correct_option: "C",
      difficulty: "hard"
    },
    {
      question_text: "What percentage of 80 is 24?",
      option_a: "25%",
      option_b: "30%",
      option_c: "35%",
      option_d: "40%",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "If a discount of 15% reduces the price to $340, what was the original price?",
      option_a: "$380",
      option_b: "$400",
      option_c: "$420",
      option_d: "$450",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "A mixture contains 30% alcohol. If 10 liters of pure alcohol is added to 90 liters of the mixture, what is the new percentage?",
      option_a: "35%",
      option_b: "38%",
      option_c: "40%",
      option_d: "42%",
      correct_option: "C",
      difficulty: "hard"
    },
    {
      question_text: "If 25% of x equals 30% of y, and x = 60, what is y?",
      option_a: "40",
      option_b: "45",
      option_c: "50",
      option_d: "55",
      correct_option: "C",
      difficulty: "medium"
    }
  ],

  // Profit & Loss (topic_id: 2)
  profitLoss: [
    {
      question_text: "A shopkeeper buys an item for $80 and sells it for $100. What is the profit percentage?",
      option_a: "20%",
      option_b: "25%",
      option_c: "30%",
      option_d: "35%",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "If a product is sold at a loss of 15% for $425, what was the cost price?",
      option_a: "$450",
      option_b: "$475",
      option_c: "$500",
      option_d: "$525",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "A trader sells two items at the same price. On one he makes 20% profit and on the other 20% loss. What is the overall result?",
      option_a: "4% profit",
      option_b: "4% loss",
      option_c: "No profit no loss",
      option_d: "2% loss",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "If the cost price of 20 items equals the selling price of 25 items, what is the profit or loss percentage?",
      option_a: "20% profit",
      option_b: "20% loss",
      option_c: "25% profit",
      option_d: "25% loss",
      correct_option: "D",
      difficulty: "hard"
    },
    {
      question_text: "A company sells a product for $120 making a profit of 20%. What would be the profit percentage if sold for $135?",
      option_a: "25%",
      option_b: "30%",
      option_c: "35%",
      option_d: "40%",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "If marked price is $500 and discount is 10%, and profit is 25%, what is the cost price?",
      option_a: "$337.50",
      option_b: "$350",
      option_c: "$362.50",
      option_d: "$375",
      correct_option: "A",
      difficulty: "hard"
    },
    {
      question_text: "A shopkeeper offers a 20% discount and still makes 10% profit. If the marked price is $220, what is the cost price?",
      option_a: "$160",
      option_b: "$165",
      option_c: "$170",
      option_d: "$175",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If selling price is doubled, profit increases from 25% to 75%. What is the original profit percentage?",
      option_a: "15%",
      option_b: "20%",
      option_c: "25%",
      option_d: "30%",
      correct_option: "C",
      difficulty: "hard"
    },
    {
      question_text: "A manufacturer sells to wholesaler at 20% profit, wholesaler to retailer at 25% profit, retailer to customer at 30% profit. If customer pays $156, what was manufacturer's cost?",
      option_a: "$60",
      option_b: "$65",
      option_c: "$70",
      option_d: "$75",
      correct_option: "A",
      difficulty: "hard"
    },
    {
      question_text: "If cost price: selling price = 4:5 and selling price: marked price = 5:6, what is the discount percentage?",
      option_a: "15%",
      option_b: "16.67%",
      option_c: "20%",
      option_d: "25%",
      correct_option: "B",
      difficulty: "medium"
    }
  ],

  // Time & Work (topic_id: 3)
  timeWork: [
    {
      question_text: "If A can complete a work in 10 days and B in 15 days, how many days will they take together?",
      option_a: "5 days",
      option_b: "6 days",
      option_c: "7 days",
      option_d: "8 days",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "A can do a piece of work in 20 days and B in 30 days. They work together for 5 days, then A leaves. How many more days will B take to finish?",
      option_a: "15 days",
      option_b: "17.5 days",
      option_c: "20 days",
      option_d: "22.5 days",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "If 3 men can do a work in 8 days, how many men are needed to do it in 6 days?",
      option_a: "3",
      option_b: "4",
      option_c: "5",
      option_d: "6",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "A and B together can complete a work in 12 days. A alone can do it in 20 days. How many days will B take alone?",
      option_a: "25 days",
      option_b: "30 days",
      option_c: "35 days",
      option_d: "40 days",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "If 10 workers can build a wall in 5 days, how many days will 15 workers take?",
      option_a: "3 days",
      option_b: "3.33 days",
      option_c: "3.5 days",
      option_d: "4 days",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "A can do half the work in 6 days and B can do half in 8 days. How many days will they take together?",
      option_a: "4.8 days",
      option_b: "5 days",
      option_c: "5.33 days",
      option_d: "6 days",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "If A is twice as efficient as B, and A can complete a work in 15 days, how many days will B take?",
      option_a: "25 days",
      option_b: "30 days",
      option_c: "35 days",
      option_d: "40 days",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "A and B together can complete a work in x days. A alone takes y days. How many days will B take alone?",
      option_a: "(xy)/(x-y)",
      option_b: "(xy)/(y-x)",
      option_c: "(x+y)/xy",
      option_d: "(y-x)/xy",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "If 4 men or 6 women can do a work in 20 days, how many days will 2 men and 3 women take?",
      option_a: "20 days",
      option_b: "25 days",
      option_c: "30 days",
      option_d: "40 days",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "A can complete 60% of work in 12 days. How many days will he take to complete the whole work?",
      option_a: "18 days",
      option_b: "20 days",
      option_c: "22 days",
      option_d: "24 days",
      correct_option: "B",
      difficulty: "easy"
    }
  ],

  // Time, Speed & Distance (topic_id: 4)
  timeSpeedDistance: [
    {
      question_text: "If a car travels at 60 km/h for 3 hours, what distance does it cover?",
      option_a: "120 km",
      option_b: "150 km",
      option_c: "180 km",
      option_d: "200 km",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "A train covers 300 km in 4 hours. What is its average speed?",
      option_a: "60 km/h",
      option_b: "65 km/h",
      option_c: "70 km/h",
      option_d: "75 km/h",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "If speed is increased by 20%, time taken decreases by what percentage for same distance?",
      option_a: "16.67%",
      option_b: "20%",
      option_c: "25%",
      option_d: "33.33%",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "A person walks at 5 km/h and runs at 10 km/h. If he covers 20 km walking and 30 km running, what is average speed?",
      option_a: "6.5 km/h",
      option_b: "7 km/h",
      option_c: "7.5 km/h",
      option_d: "8 km/h",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Two cars start from same point going in opposite directions. If one goes at 40 km/h and other at 60 km/h, after how many hours will they be 200 km apart?",
      option_a: "1 hour",
      option_b: "1.5 hours",
      option_c: "2 hours",
      option_d: "2.5 hours",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "A train 150m long passes a platform 100m long in 10 seconds. What is its speed?",
      option_a: "20 m/s",
      option_b: "25 m/s",
      option_c: "30 m/s",
      option_d: "35 m/s",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "If a person covers half distance at 30 km/h and remaining at 60 km/h, what is average speed?",
      option_a: "36 km/h",
      option_b: "40 km/h",
      option_c: "45 km/h",
      option_d: "50 km/h",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "A boat goes 30 km upstream in 3 hours and downstream in 2 hours. What is speed of stream?",
      option_a: "2.5 km/h",
      option_b: "3 km/h",
      option_c: "3.5 km/h",
      option_d: "4 km/h",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If two trains 100m and 150m long are moving in opposite directions at 25 m/s and 15 m/s, how long to cross each other?",
      option_a: "4 seconds",
      option_b: "5 seconds",
      option_c: "6 seconds",
      option_d: "7 seconds",
      correct_option: "A",
      difficulty: "hard"
    },
    {
      question_text: "A person is 20 minutes late if walking at 4 km/h. If he walks at 6 km/h, he's 10 minutes early. What is the distance?",
      option_a: "4 km",
      option_b: "6 km",
      option_c: "8 km",
      option_d: "10 km",
      correct_option: "B",
      difficulty: "hard"
    }
  ],

  // Ratio & Proportion (topic_id: 5)
  ratioProportion: [
    {
      question_text: "If a:b = 3:4 and b:c = 5:6, what is a:c?",
      option_a: "15:24",
      option_b: "5:8",
      option_c: "3:6",
      option_d: "15:8",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "If 8 workers can complete a task in 12 days, how many workers are needed to complete it in 8 days?",
      option_a: "10",
      option_b: "12",
      option_c: "15",
      option_d: "18",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "If x:y = 2:3 and y:z = 4:5, what is x:y:z?",
      option_a: "8:12:15",
      option_b: "2:3:5",
      option_c: "4:6:10",
      option_d: "8:12:20",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If 15% of a number is 45, what is 25% of that number?",
      option_a: "60",
      option_b: "65",
      option_c: "70",
      option_d: "75",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "If the ratio of boys to girls in a class is 3:2 and there are 30 boys, how many students are there?",
      option_a: "40",
      option_b: "45",
      option_c: "50",
      option_d: "55",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "If A:B:C = 2:3:4 and sum is 180, what is B?",
      option_a: "45",
      option_b: "54",
      option_c: "60",
      option_d: "72",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "If 3x = 4y and 5y = 6z, what is x:y:z?",
      option_a: "8:6:5",
      option_b: "4:3:2.5",
      option_c: "24:18:15",
      option_d: "8:6:4",
      correct_option: "A",
      difficulty: "hard"
    },
    {
      question_text: "If two numbers are in ratio 5:6 and their HCF is 12, what are the numbers?",
      option_a: "60, 72",
      option_b: "50, 60",
      option_c: "25, 30",
      option_d: "35, 42",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If a:b = 3:4 and (a+3):(b+3) = 4:5, what are a and b?",
      option_a: "6, 8",
      option_b: "9, 12",
      option_c: "12, 16",
      option_d: "15, 20",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "If 20% of A = 30% of B and 40% of B = 50% of C, what is A:B:C?",
      option_a: "3:2:1.6",
      option_b: "15:10:8",
      option_c: "75:50:40",
      option_d: "6:4:3.2",
      correct_option: "B",
      difficulty: "hard"
    }
  ],

  // Number Series (topic_id: 6)
  numberSeries: [
    {
      question_text: "Find the next number: 2, 4, 8, 16, 32, ?",
      option_a: "48",
      option_b: "64",
      option_c: "96",
      option_d: "128",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing number: 1, 4, 9, 16, ?, 36",
      option_a: "20",
      option_b: "24",
      option_c: "25",
      option_d: "30",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "Find the next number: 3, 6, 11, 18, 27, ?",
      option_a: "36",
      option_b: "38",
      option_c: "40",
      option_d: "42",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the next number: 1, 1, 2, 3, 5, 8, ?",
      option_a: "11",
      option_b: "12",
      option_c: "13",
      option_d: "14",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the next number: 2, 5, 10, 17, 26, ?",
      option_a: "35",
      option_b: "37",
      option_c: "39",
      option_d: "41",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the next number: 1, 8, 27, 64, 125, ?",
      option_a: "144",
      option_b: "169",
      option_c: "196",
      option_d: "216",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the next number: 4, 12, 36, 108, ?",
      option_a: "216",
      option_b: "324",
      option_c: "432",
      option_d: "540",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "Find the next number: 2, 3, 5, 7, 11, 13, ?",
      option_a: "15",
      option_b: "16",
      option_c: "17",
      option_d: "19",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the next number: 1, 4, 7, 10, 13, ?",
      option_a: "14",
      option_b: "15",
      option_c: "16",
      option_d: "17",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "Find the next number: 3, 4, 7, 11, 18, 29, ?",
      option_a: "42",
      option_b: "43",
      option_c: "45",
      option_d: "47",
      correct_option: "D",
      difficulty: "hard"
    }
  ],

  // Coding-Decoding (topic_id: 7)
  codingDecoding: [
    {
      question_text: "If CAT is coded as 3120, how is DOG coded?",
      option_a: "4157",
      option_b: "4167",
      option_c: "4267",
      option_d: "5167",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If MANGO is coded as NBMHP, how is ORANGE coded?",
      option_a: "PSBOHF",
      option_b: "PTBOHF",
      option_c: "PSBMHF",
      option_d: "PTBMHF",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If 123 = 6, 234 = 9, 345 = 12, then 456 = ?",
      option_a: "13",
      option_b: "14",
      option_c: "15",
      option_d: "16",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "If A=1, B=2, C=3, then what is the value of CAB?",
      option_a: "312",
      option_b: "123",
      option_c: "231",
      option_d: "321",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If MACHINE is coded as 513-9-9-14-9-14-5, what is ENGINE?",
      option_a: "5-14-7-9-14-5",
      option_b: "5-14-7-8-14-5",
      option_c: "5-13-7-9-14-5",
      option_d: "5-14-7-9-13-5",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If PENCIL = 5-1-14-3-9-12, then ERASER = ?",
      option_a: "5-18-1-19-5-18",
      option_b: "5-18-1-18-5-18",
      option_c: "5-17-1-19-5-18",
      option_d: "5-18-1-19-5-17",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If 2+3=10, 3+4=17, 4+5=26, then 5+6=?",
      option_a: "35",
      option_b: "36",
      option_c: "37",
      option_d: "38",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "If WATER is coded as XBTGU, then WINE is coded as?",
      option_a: "XKPF",
      option_b: "XKPG",
      option_c: "XKQF",
      option_d: "XKQG",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If 1=1, 2=4, 3=9, 4=16, then 5=?",
      option_a: "20",
      option_b: "24",
      option_c: "25",
      option_d: "30",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "If COMPUTER is coded as DPOUPVQS, then LAPTOP is coded as?",
      option_a: "MBQUPO",
      option_b: "MBQUPQ",
      option_c: "MCQUPO",
      option_d: "MCQUPQ",
      correct_option: "B",
      difficulty: "medium"
    }
  ],

  // Blood Relations (topic_id: 8)
  bloodRelations: [
    {
      question_text: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Who is in the photograph?",
      option_a: "His son",
      option_b: "His nephew",
      option_c: "His cousin",
      option_d: "He himself",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?",
      option_a: "Granddaughter",
      option_b: "Daughter",
      option_c: "Grandmother",
      option_d: "Sister",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?",
      option_a: "Uncle",
      option_b: "Father",
      option_c: "Brother",
      option_d: "Grandfather",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "A woman introduces a man as the son of her brother's sister. How is the man related to the woman?",
      option_a: "Son",
      option_b: "Nephew",
      option_c: "Cousin",
      option_d: "Brother",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "If A's mother is B's sister and C's mother is A's sister, how is C related to B?",
      option_a: "Cousin",
      option_b: "Nephew",
      option_c: "Uncle",
      option_d: "Brother",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "A man said to a woman, 'Your brother's father is my wife's brother.' How is the woman related to the man?",
      option_a: "Sister",
      option_b: "Sister-in-law",
      option_c: "Aunt",
      option_d: "Mother",
      correct_option: "B",
      difficulty: "hard"
    },
    {
      question_text: "If X is the brother of Y, Y is the sister of Z, and Z is the mother of W, how is X related to W?",
      option_a: "Uncle",
      option_b: "Father",
      option_c: "Brother",
      option_d: "Grandfather",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "A is the father of B. B is the sister of C. D is the mother of C. How is A related to D?",
      option_a: "Husband",
      option_b: "Brother",
      option_c: "Son",
      option_d: "Father",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If P is Q's brother, Q is R's sister, and R is T's mother, how is P related to T?",
      option_a: "Uncle",
      option_b: "Father",
      option_c: "Brother",
      option_d: "Grandfather",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "A woman says to her son, 'Your brother's only sister is my daughter.' How many children does the woman have?",
      option_a: "1",
      option_b: "2",
      option_c: "3",
      option_d: "4",
      correct_option: "B",
      difficulty: "medium"
    }
  ],

  // Direction Sense (topic_id: 9)
  directionSense: [
    {
      question_text: "A person walks 3 km north, then turns right and walks 4 km. How far is he from the starting point?",
      option_a: "5 km",
      option_b: "7 km",
      option_c: "12 km",
      option_d: "1 km",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If I stand facing east and turn 135° clockwise, which direction will I face?",
      option_a: "South",
      option_b: "Southwest",
      option_c: "West",
      option_d: "Northwest",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "A man walks 6 km south, then 8 km east, then 6 km north. How far is he from the starting point?",
      option_a: "6 km",
      option_b: "8 km",
      option_c: "10 km",
      option_d: "14 km",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "If south-west becomes north, what will north-east become?",
      option_a: "South",
      option_b: "South-east",
      option_c: "South-west",
      option_d: "West",
      correct_option: "A",
      difficulty: "hard"
    },
    {
      question_text: "A person walks 2 km east, 3 km north, 4 km west, and 1 km south. Where is he relative to starting point?",
      option_a: "2 km west",
      option_b: "2 km east",
      option_c: "1 km west",
      option_d: "1 km east",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "If I start at point A, walk 5 km east, turn right and walk 12 km, then turn left and walk 5 km, which direction am I facing?",
      option_a: "East",
      option_b: "West",
      option_c: "North",
      option_d: "South",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "A person walks 10 km north, then 10 km east, then 10 km south. How far is he from starting point?",
      option_a: "10 km",
      option_b: "20 km",
      option_c: "14.14 km",
      option_d: "0 km",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If at 6:00, the hour hand points east, at 3:00 it will point?",
      option_a: "North",
      option_b: "South",
      option_c: "East",
      option_d: "West",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "A man walks 3 km north, turns left and walks 4 km, turns left and walks 3 km. How far from start?",
      option_a: "4 km",
      option_b: "6 km",
      option_c: "8 km",
      option_d: "10 km",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "If I walk 6 km south, then 8 km west, then 6 km north, then 8 km east, where am I?",
      option_a: "Starting point",
      option_b: "6 km south",
      option_c: "8 km west",
      option_d: "14 km away",
      correct_option: "A",
      difficulty: "easy"
    }
  ],

  // Analogy (topic_id: 10)
  analogy: [
    {
      question_text: "Doctor is to Patient as Teacher is to?",
      option_a: "Student",
      option_b: "Class",
      option_c: "Book",
      option_d: "School",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Cat is to Kitten as Dog is to?",
      option_a: "Puppy",
      option_b: "Cub",
      option_c: "Kitten",
      option_d: "Fawn",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Book is to Library as Painting is to?",
      option_a: "Gallery",
      option_b: "Museum",
      option_c: "Studio",
      option_d: "Exhibition",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Water is to Ice as Steam is to?",
      option_a: "Liquid",
      option_b: "Gas",
      option_c: "Solid",
      option_d: "Vapor",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Pen is to Write as Camera is to?",
      option_a: "Click",
      option_b: "Capture",
      option_c: "Photo",
      option_d: "Shoot",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Ship is to Captain as Airplane is to?",
      option_a: "Pilot",
      option_b: "Co-pilot",
      option_c: "Crew",
      option_d: "Passenger",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Root is to Tree as Foundation is to?",
      option_a: "Building",
      option_b: "House",
      option_c: "Structure",
      option_d: "Base",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "Key is to Lock as Password is to?",
      option_a: "Computer",
      option_b: "Account",
      option_c: "Security",
      option_d: "Access",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Seed is to Plant as Egg is to?",
      option_a: "Bird",
      option_b: "Chicken",
      option_c: "Nest",
      option_d: "Hatch",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "Composer is to Symphony as Author is to?",
      option_a: "Book",
      option_b: "Novel",
      option_c: "Story",
      option_d: "Poem",
      correct_option: "B",
      difficulty: "medium"
    }
  ],

  // Odd One Out (topic_id: 11)
  oddOneOut: [
    {
      question_text: "Find the odd one out: Apple, Banana, Carrot, Orange",
      option_a: "Apple",
      option_b: "Banana",
      option_c: "Carrot",
      option_d: "Orange",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "Find the odd one out: 2, 4, 6, 9, 10",
      option_a: "2",
      option_b: "4",
      option_c: "6",
      option_d: "9",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the odd one out: Circle, Square, Triangle, Cube",
      option_a: "Circle",
      option_b: "Square",
      option_c: "Triangle",
      option_d: "Cube",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the odd one out: Rose, Lily, Tulip, Oak",
      option_a: "Rose",
      option_b: "Lily",
      option_c: "Tulip",
      option_d: "Oak",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the odd one out: January, March, May, July",
      option_a: "January",
      option_b: "March",
      option_c: "May",
      option_d: "July",
      correct_option: "A",
      difficulty: "medium"
    },
    {
      question_text: "Find the odd one out: Piano, Guitar, Violin, Drum",
      option_a: "Piano",
      option_b: "Guitar",
      option_c: "Violin",
      option_d: "Drum",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Find the odd one out: Mercury, Venus, Earth, Sun",
      option_a: "Mercury",
      option_b: "Venus",
      option_c: "Earth",
      option_d: "Sun",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the odd one out: 8, 27, 64, 125, 216",
      option_a: "8",
      option_b: "27",
      option_c: "64",
      option_d: "125",
      correct_option: "C",
      difficulty: "hard"
    },
    {
      question_text: "Find the odd one out: Heart, Liver, Brain, Stomach",
      option_a: "Heart",
      option_b: "Liver",
      option_c: "Brain",
      option_d: "Stomach",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the odd one out: 3, 5, 7, 9, 11",
      option_a: "3",
      option_b: "5",
      option_c: "7",
      option_d: "9",
      correct_option: "D",
      difficulty: "easy"
    }
  ],

  // Syllogisms (topic_id: 12)
  syllogisms: [
    {
      question_text: "All cats are animals. Some animals are pets. Which conclusion is valid?",
      option_a: "All cats are pets",
      option_b: "Some cats are pets",
      option_c: "Some pets are cats",
      option_d: "No valid conclusion",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "All students are intelligent. All intelligent people are successful. Which conclusion is valid?",
      option_a: "All successful people are students",
      option_b: "Some successful people are students",
      option_c: "All students are successful",
      option_d: "No valid conclusion",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "No birds are mammals. All bats are mammals. Which conclusion is valid?",
      option_a: "No bats are birds",
      option_b: "Some bats are birds",
      option_c: "All birds are bats",
      option_d: "No valid conclusion",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Some doctors are rich. All rich people are happy. Which conclusion is valid?",
      option_a: "All doctors are happy",
      option_b: "Some doctors are happy",
      option_c: "Some happy people are doctors",
      option_d: "No valid conclusion",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "All flowers are beautiful. Some beautiful things are fragrant. Which conclusion is valid?",
      option_a: "All flowers are fragrant",
      option_b: "Some flowers are fragrant",
      option_c: "Some fragrant things are flowers",
      option_d: "No valid conclusion",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "No criminals are honest. Some politicians are not honest. Which conclusion is valid?",
      option_a: "Some politicians are criminals",
      option_b: "No politicians are criminals",
      option_c: "Some criminals are politicians",
      option_d: "No valid conclusion",
      correct_option: "D",
      difficulty: "hard"
    },
    {
      question_text: "All engineers are logical. Some logical people are artists. Which conclusion is valid?",
      option_a: "All engineers are artists",
      option_b: "Some engineers are artists",
      option_c: "Some artists are engineers",
      option_d: "No valid conclusion",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Some books are interesting. All interesting things are worth reading. Which conclusion is valid?",
      option_a: "All books are worth reading",
      option_b: "Some books are worth reading",
      option_c: "Some worth reading things are books",
      option_d: "No valid conclusion",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "All metals conduct electricity. Gold conducts electricity. Which conclusion is valid?",
      option_a: "Gold is a metal",
      option_b: "Some metals are gold",
      option_c: "All conductors are metals",
      option_d: "No valid conclusion",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "No vegetables are fruits. Some fruits are sweet. Some sweet things are not vegetables. Which conclusion is valid?",
      option_a: "All vegetables are not sweet",
      option_b: "Some sweet things are fruits",
      option_c: "No vegetables are sweet",
      option_d: "All of the above",
      correct_option: "D",
      difficulty: "hard"
    }
  ],

  // Statement & Conclusion (topic_id: 13)
  statementConclusion: [
    {
      question_text: "Statement: All students who study regularly pass exams. Conclusion: Students who don't pass exams don't study regularly.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Statement: The company's profits increased by 20% last year. Conclusion: The company performed well.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "Statement: All roads lead to Rome. Conclusion: There are no roads outside Rome.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Statement: Every cloud has a silver lining. Conclusion: There are no clouds without silver linings.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Statement: Some employees work from home. Conclusion: All employees who don't work from home come to office.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Statement: The temperature dropped below freezing last night. Conclusion: It snowed last night.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Statement: No birds are mammals. Conclusion: Some mammals are not birds.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Statement: All successful people work hard. Conclusion: People who don't work hard are not successful.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Statement: Most students prefer online learning. Conclusion: All students prefer online learning.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Statement: If it rains, the ground gets wet. The ground is wet. Conclusion: It rained.",
      option_a: "Definitely true",
      option_b: "Probably true",
      option_c: "Probably false",
      option_d: "Definitely false",
      correct_option: "C",
      difficulty: "hard"
    }
  ],

  // Alphabet Series (topic_id: 14)
  alphabetSeries: [
    {
      question_text: "Find the next letter: A, C, E, G, I, ?",
      option_a: "J",
      option_b: "K",
      option_c: "L",
      option_d: "M",
      correct_option: "B",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing letter: A, D, G, J, ?, P",
      option_a: "K",
      option_b: "L",
      option_c: "M",
      option_d: "N",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the next letter: Z, X, V, T, R, ?",
      option_a: "P",
      option_b: "Q",
      option_c: "S",
      option_d: "T",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Find the next letter: A, C, F, J, O, ?",
      option_a: "T",
      option_b: "U",
      option_c: "V",
      option_d: "W",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the next pair: AB, DE, HI, MN, ?",
      option_a: "RS",
      option_b: "ST",
      option_c: "TU",
      option_d: "UV",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the next letter: B, D, H, P, ?",
      option_a: "Q",
      option_b: "R",
      option_c: "S",
      option_d: "T",
      correct_option: "D",
      difficulty: "medium"
    },
    {
      question_text: "Find the next letter: A, E, I, M, Q, ?",
      option_a: "U",
      option_b: "V",
      option_c: "W",
      option_d: "X",
      correct_option: "A",
      difficulty: "easy"
    },
    {
      question_text: "Find the next letter: C, F, I, L, O, ?",
      option_a: "P",
      option_b: "Q",
      option_c: "R",
      option_d: "S",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing letter: A, C, F, ?, M, R",
      option_a: "H",
      option_b: "I",
      option_c: "J",
      option_d: "K",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the next letter: Z, Y, X, W, V, ?",
      option_a: "S",
      option_b: "T",
      option_c: "U",
      option_d: "V",
      correct_option: "C",
      difficulty: "easy"
    }
  ],

  // Missing Number Pattern (topic_id: 15)
  missingNumberPattern: [
    {
      question_text: "Find the missing number: 2, 6, 12, 20, 30, ?",
      option_a: "40",
      option_b: "42",
      option_c: "44",
      option_d: "46",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 1, 4, 9, 16, 25, ?",
      option_a: "30",
      option_b: "32",
      option_c: "35",
      option_d: "36",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing number: 3, 8, 15, 24, 35, ?",
      option_a: "44",
      option_b: "46",
      option_c: "48",
      option_d: "50",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 1, 2, 4, 7, 11, ?",
      option_a: "14",
      option_b: "15",
      option_c: "16",
      option_d: "17",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 5, 10, 20, 40, 80, ?",
      option_a: "120",
      option_b: "140",
      option_c: "160",
      option_d: "180",
      correct_option: "C",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing number: 2, 5, 10, 17, 26, ?",
      option_a: "35",
      option_b: "37",
      option_c: "39",
      option_d: "41",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 1, 8, 27, 64, 125, ?",
      option_a: "144",
      option_b: "169",
      option_c: "196",
      option_d: "216",
      correct_option: "D",
      difficulty: "easy"
    },
    {
      question_text: "Find the missing number: 6, 11, 18, 27, 38, ?",
      option_a: "47",
      option_b: "49",
      option_c: "51",
      option_d: "53",
      correct_option: "C",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 3, 6, 11, 18, 27, ?",
      option_a: "36",
      option_b: "38",
      option_c: "40",
      option_d: "42",
      correct_option: "B",
      difficulty: "medium"
    },
    {
      question_text: "Find the missing number: 4, 9, 16, 25, 36, ?",
      option_a: "45",
      option_b: "47",
      option_c: "49",
      option_d: "51",
      correct_option: "C",
      difficulty: "easy"
    }
  ]
};

async function seedQuestions() {
  try {
    console.log('Starting to seed 150 new questions...');
    
    // Map topic names to their IDs
    const topicIdMap = {
      percentages: 1,
      profitLoss: 2,
      timeWork: 3,
      timeSpeedDistance: 4,
      ratioProportion: 5,
      numberSeries: 6,
      codingDecoding: 7,
      bloodRelations: 8,
      directionSense: 9,
      analogy: 10,
      oddOneOut: 11,
      syllogisms: 12,
      statementConclusion: 13,
      alphabetSeries: 14,
      missingNumberPattern: 15
    };

    let totalInserted = 0;

    // Insert questions for each topic
    for (const [topicKey, questions] of Object.entries(sampleQuestions)) {
      const topicId = topicIdMap[topicKey];
      
      for (const question of questions) {
        try {
          const result = await db.query(
            `INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              topicId,
              question.question_text,
              question.option_a,
              question.option_b,
              question.option_c,
              question.option_d,
              question.correct_option,
              question.difficulty
            ]
          );
          
          totalInserted++;
          console.log(`Inserted question ID: ${result.rows[0].id} for topic: ${topicKey}`);
        } catch (error) {
          console.error(`Error inserting question for ${topicKey}:`, error.message);
        }
      }
    }

    console.log(`Successfully inserted ${totalInserted} questions!`);
    return totalInserted;
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedQuestions()
    .then((count) => {
      console.log(`Seeding completed! Added ${count} questions.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedQuestions, sampleQuestions };
