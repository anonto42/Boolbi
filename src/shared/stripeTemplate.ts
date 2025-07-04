

export const reconnectURL  = ( url: any ) => {
    return `<!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Revalidate Your Account</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f7fc;
                }

                .container {
                    max-width: 600px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .header h1 {
                    color: #333;
                    font-size: 24px;
                }

                .content {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 20px;
                }

                .button-container {
                    text-align: center;
                    margin-top: 20px;
                }

                .revalidate-btn {
                    background-color: #4CAF50;
                    color: #fff;
                    font-size: 18px;
                    padding: 15px 30px;
                    border-radius: 5px;
                    text-decoration: none;
                    display: inline-block;
                    width: 100%;
                    max-width: 300px;
                }

                .revalidate-btn:hover {
                    background-color: #45a049;
                }

                @media (max-width: 600px) {
                    .container {
                        margin: 20px;
                        padding: 15px;
                    }

                    .revalidate-btn {
                        font-size: 16px;
                        padding: 12px 20px;
                    }
                }
            </style>
        </head>

        <body>
            <div class="container">
                <div class="header">
                    <h1>Revalidate Your Account</h1>
                </div>
                <div class="content">
                    <p>It looks like you need to reconnect your account. To continue, please click the button below to revalidate your account and complete the setup process.</p>
                    <p>If you experience any issues or need further assistance, feel free to reach out to our support team.</p>
                </div>
                <div class="button-container">
                    <a href="${url}" class="revalidate-btn" target="_blank">Revalidate Your Account</a>
                </div>
            </div>
        </body>

    </html>
`
}


export const accountBindSuccessfull = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Account Binding Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #28a745;
            font-size: 24px;
        }

        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 20px;
        }

        .button-container {
            text-align: center;
            margin-top: 20px;
        }

        .next-step-btn {
            background-color: #007bff;
            color: #fff;
            font-size: 18px;
            padding: 15px 30px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            width: 100%;
            max-width: 300px;
        }

        .next-step-btn:hover {
            background-color: #0056b3;
        }

        @media (max-width: 600px) {
            .container {
                margin: 20px;
                padding: 15px;
            }

            .next-step-btn {
                font-size: 16px;
                padding: 12px 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Account Binding Successful!</h1>
        </div>
        <div class="content">
            <p>Your account has been successfully bound to our platform. You're now ready to start processing payments and managing your account with Stripe.</p>
            <p>If you need further assistance, please reach out to our support team. Otherwise, you can continue by clicking the button below.</p>
        </div>
        <div class="button-container">
            <a href="<%= nextStepUrl %>" class="next-step-btn" target="_blank">Proceed to Dashboard</a>
        </div>
    </div>
</body>

</html>
`