import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import TreeSitter, { Query } from "tree-sitter";
//@ts-ignore
import Solidity from "tree-sitter-solidity";

interface Message {
  source: string;
}

interface Response {
  statusCode: number;
  body: {
    names: string[];
  };
}

export function service({ source }: Message): Response {
  const parser = new TreeSitter();
  parser.setLanguage(Solidity);
  const tree = parser.parse(source);
  console.log(tree.rootNode.toString());
  const query = new Query(
    Solidity,
    ` (
        (contract_declaration name: (identifier) @name
         ) 
     )
      
    `
  );
  const matches = query.matches(tree.rootNode);
  console.log(matches);
  const names = matches.map((match) => match.captures[0].node.text);

  return {
    statusCode: 200,
    body: {
      names,
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body as Message;
  const response = service(data);

  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  res.status(response.statusCode).json(response.body);
}
