async function testRaceCondition() {
  console.log('🚀 Démarrage du Test de Concurrence (Race Condition)...');
  
  const FROM_EMPLOYEE_ID = process.env.FROM_ID || 'EMPLOYEE_1_ID';
  const TO_EMPLOYEE_ID = process.env.TO_ID || 'EMPLOYEE_2_ID';
  const AMOUNT = 800;

  const API_URL = 'http://localhost:3000/api/v1/transactions/transfer';

  const makeTransfer = async (label) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromEmployeeId: FROM_EMPLOYEE_ID,
        toEmployeeId: TO_EMPLOYEE_ID,
        amount: AMOUNT,
        description: `Virement ${label} (Race Condition)`
      })
    });
    const json = await res.json();
    return { httpStatus: res.status, body: json };
  };

  console.log(`⚡ Lancement simultané de 2 virements de ${AMOUNT} DT...`);
  console.log(`   (Solde du compte expéditeur : exactement ${AMOUNT} DT)`);
  console.log(`   → Si les 2 passent = double-spend ⚠️`);
  console.log(`   → Si 1 passe + 1 bloqué = sécurité ✅\n`);

  try {
    const [r1, r2] = await Promise.allSettled([
      makeTransfer('A'),
      makeTransfer('B')
    ]);

    let successes = 0;
    let rejections = 0;

    [r1, r2].forEach((res, index) => {
      if (res.status === 'rejected') {
        console.log(`❌ Requête ${index + 1} — Erreur réseau : ${res.reason?.message}`);
        rejections++;
      } else {
        const { httpStatus, body } = res.value;
        const isSuccess = httpStatus === 201 && body.success !== false && !body.message?.includes('Insufficient');
        if (isSuccess) {
          successes++;
          console.log(`✅ Requête ${index + 1} — ACCEPTÉE (HTTP ${httpStatus}) | ref: ${body.data?.reference}`);
        } else {
          rejections++;
          console.log(`🛡️ Requête ${index + 1} — BLOQUÉE (HTTP ${httpStatus}) | message: ${body.message}`);
        }
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Conclusion :');
    if (successes === 2) {
      console.log('⚠️  VULNÉRABLE — Les 2 virements de 800 DT sont passés avec un solde de 800 DT !');
      console.log('    → Double-Spend détecté ! Le système n\'est PAS protégé.');
    } else if (successes === 1 && rejections >= 1) {
      console.log('🛡️  PROTÉGÉ — 1 virement accepté, 1 virement bloqué atomiquement.');
      console.log('    → La correction findOneAndUpdate($gte) fonctionne correctement !');
      console.log('    → Le compte ne peut pas tomber en négatif sous concurrence.');
    } else {
      console.log(`❓ Résultat inattendu : ${successes} succès, ${rejections} rejets.`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('Erreur globale du test :', error);
  }
}

console.log('⚠️  Pour lancer ce test, le backend doit être allumé et vous devez fournir des IDs valides.');
console.log('Exemple: FROM_ID=id1 TO_ID=id2 node test_race_condition.js\n');

testRaceCondition();
