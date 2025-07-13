// index.mjs

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; 

const s3 = new S3Client(); // これが正しいAWS SDK V3のS3クライアントのインスタンス化です。

// ★ここを修正しました★
export const handler = async (event) => { 
    // ログにイベント全体を出力して、リクエストの形式を確認する
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucketName = 'dlr-bucket-tokyo'; // あなたのS3バケット名

    const pathParameters = event.pathParameters || {};
    const prefix = pathParameters.prefix;
    const filename = pathParameters.filename;

    // パスパラメータが正しく取得できているか確認する
    console.log(`Path parameters - prefix: ${prefix}, filename: ${filename}`);

    if (!prefix || !filename) {
        console.error('Validation Error: Missing prefix or filename in path parameters.');
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Bad Request: Missing prefix or filename in path parameters.'
            }),
        };
    }

    const s3ObjectKey = `dlsite_data/${prefix}/${filename}`; // ★ここも修正しました（{}を削除）★
    console.log(`Constructed S3 Object Key: ${s3ObjectKey}`);

    const params = {
        Bucket: bucketName,
        Key: s3ObjectKey,
    };

    try {
        console.log(`Attempting to get object from S3: Bucket=${bucketName}, Key=${s3ObjectKey}`);
        
        const command = new GetObjectCommand(params);
        const data = await s3.send(command);

        console.log(`Successfully retrieved object from S3. Content-Type: ${data.ContentType}, Size: ${data.ContentLength} bytes`);
        
        const fileContent = await data.Body.transformToString('utf-8');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: fileContent
        };
    } catch (error) {
        console.error(`Error processing request for S3 object ${s3ObjectKey}:`, error);

        if (error.name === 'NoSuchKey') { 
            console.warn(`S3 Object Not Found: The key ${s3ObjectKey} does not exist in bucket ${bucketName}.`);
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `File not found: ${s3ObjectKey}`
                }),
            };
        } else {
            console.error(`An unexpected error occurred: ${error.message || error}`);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Internal Server Error'
                }),
            };
        }
    }
};