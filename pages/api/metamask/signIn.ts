import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import jwt from "jsonwebtoken";

export interface Message {
  message: string;
  signature: string;
  address: string;
}

interface JWTPayload {
  userId: string;
}

interface HandlerResponse {
  statusCode: number;
  body: any;
}

export function service({
  message,
  signature,
  address,
}: Message): HandlerResponse {
  try {
    const signedAddress = ethers.utils.verifyMessage(message, signature);
    if (address === signedAddress) {
      let password = process.env.METAMASK_AUTHENTICATION_PASSWORD!;
      const payload: JWTPayload = {
        userId: address,
      };
      let token = jwt.sign(payload, password);
      return {
        statusCode: 200,
        body: {
          message: "OK",
          accessToken: token,
        },
      };
    }
  } catch (err) {}

  return {
    statusCode: 403,
    body: {
      message: "Forbidden",
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;
  const response = service(data);

  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });

  res.status(response.statusCode).json(response.body);
}
