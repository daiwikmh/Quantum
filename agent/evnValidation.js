// envValidation.js
function validateEnvironment() {
  const missingVars = [];
  const requiredVars = ["APTOS_PRIVATE_KEY"];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set:");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

export default validateEnvironment;
