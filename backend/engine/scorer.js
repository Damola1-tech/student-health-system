function calculateScore(data) {
  let score = 0;
  const flags = [];

  // Water intake
  if (data.water === 'less than 4') { score += 3; flags.push('low water intake'); }
  else if (data.water === '4-6') { score += 2; }
  else if (data.water === '7-8') { score += 1; }

  // Sleep
  if (data.sleep === 'less than 4') { score += 3; flags.push('very low sleep'); }
  else if (data.sleep === '4-5') { score += 2; flags.push('low sleep'); }
  else if (data.sleep === '6-7') { score += 1; }

  // Meals per day
  if (data.meals === 'none') { score += 4; flags.push('no meals'); }
  else if (data.meals === '1') { score += 3; flags.push('only 1 meal'); }
  else if (data.meals === '2') { score += 1; }

  // Breakfast
  if (data.breakfast === 'never' || data.breakfast === 'rarely') { score += 2; flags.push('skipping breakfast'); }
  else if (data.breakfast === 'sometimes') { score += 1; }

  // BMI
  const bmi = parseFloat(data.bmi);
  if (!isNaN(bmi)) {
    if (bmi < 18.5 || bmi > 27) { score += 2; flags.push('abnormal BMI'); }
  }

  // Physical activity
  if (data.activity === 'never') { score += 2; flags.push('no physical activity'); }
  else if (data.activity === '1-2') { score += 1; }

  // Stress
  if (data.stress === 'very high') { score += 3; flags.push('very high stress'); }
  else if (data.stress === 'high') { score += 2; flags.push('high stress'); }
  else if (data.stress === 'moderate') { score += 1; }

  // Fatigue
  if (data.fatigue === 'always') { score += 3; flags.push('constant fatigue'); }
  else if (data.fatigue === 'often') { score += 2; }
  else if (data.fatigue === 'sometimes') { score += 1; }

  // Meal skipping
  if (data.skipping === 'always' || data.skipping === 'often') { score += 3; flags.push('frequent meal skipping'); }
  else if (data.skipping === 'sometimes') { score += 1; }

  // Headaches
  if (data.headaches === 'frequently') { score += 2; flags.push('frequent headaches'); }
  else if (data.headaches === 'sometimes' || data.headaches === 'rarely') { score += 1; }

  // Symptoms
  const symptoms = data.symptoms || [];
  if (symptoms.includes('dizziness')) { score += 2; flags.push('dizziness'); }
  if (symptoms.includes('weakness')) { score += 2; flags.push('weakness/body pain'); }
  if (symptoms.includes('nausea')) { score += 2; flags.push('nausea'); }
  if (symptoms.includes('loss of appetite')) { score += 2; flags.push('loss of appetite'); }
  if (symptoms.includes('difficulty concentrating')) { score += 1; flags.push('difficulty concentrating'); }

  // Risk classification
  let risk, message, color;
  if (score <= 8) {
    risk = 'Low Risk';
    color = 'green';
    message = 'Your health indicators look good. Keep maintaining healthy habits!';
  } else if (score <= 16) {
    risk = 'Medium Risk';
    color = 'orange';
    message = 'Some of your health habits need attention. Check the recommendations below.';
  } else {
    risk = 'High Risk';
    color = 'red';
    message = 'Your health is at risk. Please visit the EKSU Health Centre as soon as possible.';
  }

  // Recommendations based on flags
  const recommendations = getRecommendations(flags, risk);

  return { score, risk, color, message, flags, recommendations };
}

function getRecommendations(flags, risk) {
  const recs = [];

  if (flags.includes('low water intake')) {
    recs.push('Drink at least 8 glasses of water daily. Carry a water bottle to class.');
  }
  if (flags.includes('very low sleep') || flags.includes('low sleep')) {
    recs.push('Aim for at least 7-8 hours of sleep. Avoid studying past midnight consistently.');
  }
  if (flags.includes('no meals') || flags.includes('only 1 meal')) {
    recs.push('Try to eat at least 3 meals a day. Even small, affordable meals help maintain energy.');
  }
  if (flags.includes('skipping breakfast')) {
    recs.push('Eating breakfast improves concentration and energy. Try bread, eggs, or fruit in the morning.');
  }
  if (flags.includes('no physical activity')) {
    recs.push('Even a 20-minute walk 3 times a week improves your overall health significantly.');
  }
  if (flags.includes('very high stress') || flags.includes('high stress')) {
    recs.push('High stress affects your physical health. Try short breaks between study sessions and talk to someone you trust.');
  }
  if (flags.includes('constant fatigue')) {
    recs.push('Persistent fatigue may indicate poor nutrition or sleep. Rest and eat balanced meals.');
  }
  if (flags.includes('frequent meal skipping')) {
    recs.push('Skipping meals causes fatigue and poor concentration. Plan simple meals ahead of time.');
  }
  if (flags.includes('dizziness') || flags.includes('nausea')) {
    recs.push('Dizziness and nausea can be signs of dehydration or low blood sugar. Eat and drink regularly.');
  }
  if (flags.includes('frequent headaches')) {
    recs.push('Frequent headaches are often linked to dehydration or eye strain. Drink more water and rest your eyes.');
  }
  if (flags.includes('abnormal BMI')) {
    recs.push('Your BMI is outside the healthy range. Consider speaking with a nutritionist at the health centre.');
  }

  if (recs.length === 0) {
    recs.push('Keep up your healthy habits! Stay hydrated, eat regularly, and get enough rest.');
  }

  if (risk === 'High Risk') {
    recs.unshift('⚠️ URGENT: Please visit the EKSU Health Centre immediately for a proper check-up.');
  }

  return recs;
}

module.exports = { calculateScore };