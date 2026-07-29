const doc = {
  type: 'PAYSLIP'
};
try {
  console.log((doc.fileSize / 1024).toFixed(1));
} catch (e) {
  console.log(e.message);
}
