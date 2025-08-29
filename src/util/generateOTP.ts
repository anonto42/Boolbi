const generateOTP = () => {
  // Generates a random number between 100000 and 999999
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};

export default generateOTP;
