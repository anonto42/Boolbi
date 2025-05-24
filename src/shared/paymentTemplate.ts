

export const paymentSuccessfull = `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
      background: #e0ffe0;
    }
    .message-box {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2ecc71;
    }
    p {
      font-size: 18px;
    }
    .btn {
      margin-top: 1rem;
      display: inline-block;
      padding: 10px 20px;
      background: #2ecc71;
      color: #fff;
      border: none;
      border-radius: 4px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="message-box">
    <h1>Payment Successful!</h1>
    <p>Your transaction has been completed successfully.</p>
    <a class="btn" href="/">Go Home</a>
  </div>
</body>
</html>`;

export const cardAddedSuccessfull = `<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Card Added Successfully</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f0f8ff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .container {
      max-width: 400px;
      background: #ffffff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    .checkmark {
      font-size: 60px;
      color: #2ecc71;
      margin-bottom: 1rem;
    }
    h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    .btn {
      padding: 10px 20px;
      background: #00aaff;
      color: white;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-size: 16px;
    }
    .btn:hover {
      background-color: #008ecc;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h2>Card Added Successfully!</h2>
    <p>Your card has been added and is ready to use for payments.</p>
    <a class="btn" href="/">Go Home</a>
  </div>
</body>
</html>`;

export const errorOnPayment = `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancelled</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
      background: #ffe0e0;
    }
    .message-box {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #e74c3c;
    }
    p {
      font-size: 18px;
    }
    .btn {
      margin-top: 1rem;
      display: inline-block;
      padding: 10px 20px;
      background: #e74c3c;
      color: #fff;
      border: none;
      border-radius: 4px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="message-box">
    <h1>Card adding Cancelled</h1>
    <p>Your process was not completed. Please try again later.</p>
    <a class="btn" href="/">Try Again</a>
  </div>
</body>
</html>
`;