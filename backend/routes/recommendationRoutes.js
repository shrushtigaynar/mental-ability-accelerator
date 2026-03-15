const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    // AI study guidance based on message content
    const lowerMsg = message.toLowerCase();
    
    let response = '';
    
    if (lowerMsg.includes('percentages') || lowerMsg.includes('percentage')) {
      response = `📚 **How to Study Percentages:**\n\n1. **Core Formula:** Percentage = (Part/Whole) × 100\n2. **Start with:** Basic percentage calculations (10%, 25%, 50%)\n3. **Practice:** Percentage increase/decrease problems daily\n4. **Shortcut:** Learn fraction-percentage equivalents (1/4=25%, 1/5=20%)\n5. **Common traps:** Successive percentage changes\n\n💡 **Daily Plan:** Solve 10 percentage problems every morning for 2 weeks.`;
    } else if (lowerMsg.includes('profit') || lowerMsg.includes('loss')) {
      response = `📚 **How to Study Profit & Loss:**\n\n1. **Key Formulas:** CP, SP, Profit% = (Profit/CP)×100\n2. **Master:** Marked price, discount, successive discounts\n3. **Practice:** Word problems involving shopkeeper scenarios\n4. **Shortcut:** Multiplying factor method\n\n💡 **Daily Plan:** 5 profit/loss problems + review 2 previous mistakes.`;
    } else if (lowerMsg.includes('time') && lowerMsg.includes('work')) {
      response = `📚 **How to Study Time & Work:**\n\n1. **Core Concept:** Work = Rate × Time, use 1/n per day approach\n2. **Master:** Pipes & cisterns (same logic)\n3. **Practice:** Problems with 2-3 people working together\n4. **Shortcut:** LCM method for work problems\n\n💡 **Daily Plan:** 8 time & work problems daily, focus on efficiency ratios.`;
    } else if (lowerMsg.includes('speed') || lowerMsg.includes('distance')) {
      response = `📚 **How to Study Speed, Time & Distance:**\n\n1. **Formula:** Speed = Distance/Time — memorize cold\n2. **Master:** Relative speed, trains, boats & streams\n3. **Practice:** Problems with two objects moving\n4. **Shortcut:** Unit conversion tricks (km/h to m/s: ×5/18)\n\n💡 **Daily Plan:** 10 speed problems, alternating between train and boat problems.`;
    } else if (lowerMsg.includes('number series') || lowerMsg.includes('series')) {
      response = `📚 **How to Study Number Series:**\n\n1. **Pattern Types:** Arithmetic, Geometric, Fibonacci, Square/Cube series\n2. **Approach:** Find differences, then differences of differences\n3. **Practice:** Identify pattern type within 30 seconds\n4. **Common patterns:** +n, ×n, alternating, two-step\n\n💡 **Daily Plan:** 15 number series daily — time yourself to build speed.`;
    } else if (lowerMsg.includes('blood relation')) {
      response = `📚 **How to Study Blood Relations:**\n\n1. **Draw family trees** for every problem\n2. **Master:** Generation levels, maternal vs paternal\n3. **Practice:** Coded blood relations\n4. **Shortcut:** Use symbols (M=male, F=female, arrows for relationships)\n\n💡 **Daily Plan:** 5 blood relation problems, always draw the tree first.`;
    } else if (lowerMsg.includes('coding') || lowerMsg.includes('decoding')) {
      response = `📚 **How to Study Coding-Decoding:**\n\n1. **Types:** Letter coding, Number coding, Symbol coding\n2. **Approach:** Find the shift pattern (A→D = +3)\n3. **Practice:** Reverse coding problems\n4. **Shortcut:** Alphabet position chart (A=1, Z=26)\n\n💡 **Daily Plan:** 10 coding problems, mix all types for variety.`;
    } else if (lowerMsg.includes('syllogism')) {
      response = `📚 **How to Study Syllogisms:**\n\n1. **Use Venn diagrams** for every problem\n2. **Master:** All, Some, No, Some-not statements\n3. **Practice:** 2-statement and 3-statement syllogisms\n4. **Shortcut:** Possibility cases with dotted Venn diagrams\n\n💡 **Daily Plan:** 8 syllogism problems, draw Venn diagrams without fail.`;
    } else if (lowerMsg.includes('direction')) {
      response = `📚 **How to Study Direction Sense:**\n\n1. **Always draw** a compass (N/S/E/W) before solving\n2. **Master:** Left turns, right turns, shadow problems\n3. **Practice:** Multi-step direction problems\n4. **Shortcut:** Right turn = 90° clockwise on your diagram\n\n💡 **Daily Plan:** 5 direction problems with mandatory diagram drawing.`;
    } else if (lowerMsg.includes('ratio') || lowerMsg.includes('proportion')) {
      response = `📚 **How to Study Ratio & Proportion:**\n\n1. **Core:** a:b means for every a parts there are b parts\n2. **Master:** Compound ratios, proportions, variations\n3. **Practice:** Mixture and alligation problems\n4. **Shortcut:** Cross multiplication for proportion problems\n\n💡 **Daily Plan:** 8 ratio problems covering all subtypes daily.`;
    } else {
      response = `📚 **General Study Strategy for Aptitude:**\n\n1. **Identify your weak topics** from the Weak Topics page\n2. **Daily routine:** 30 min aptitude practice every day\n3. **Topic rotation:** Don't stick to one topic — rotate weekly\n4. **Review mistakes:** Spend 10 min reviewing wrong answers\n5. **Timed practice:** Always solve under time pressure\n\n💡 **Ask me about specific topics like:**\n- Percentages, Profit & Loss\n- Time & Work, Speed & Distance\n- Number Series, Blood Relations\n- Coding-Decoding, Syllogisms\n- Direction Sense, Ratio & Proportion`;
    }
    
    res.json({ response, timestamp: new Date() });
  } catch (err) {
    console.error('Recommendation chat error:', err);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

module.exports = router;
