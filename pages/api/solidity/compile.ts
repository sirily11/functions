import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import Parser from "tree-sitter";
//@ts-ignore
import Solidity from "tree-sitter-solidity";
import semver from "semver";
import axios from "axios";
import { Solc } from "../../../lib/solc";

const solcURL = "https://solc-bin.ethereum.org/bin/";

interface Body {
  source: string;
  compilerVersion?: string;
}

interface Response {
  statusCode: number;
  body: {
    bytecode?: string;
    abi?: any;
    errors: string[];
    compilerVersion?: string;
  };
}

interface VersionList {
  builds: {
    path: string;
    version: string;
    longVersion: string;
    build: string;
  }[];
}

/**
 * Parse the source code and return the Solidity compiler version requested.
 */
function parseVersion(source: string): string {
  const parser = new Parser();
  const { Query } = Parser;
  parser.setLanguage(Solidity);
  const tree = parser.parse(source);
  const query = new Query(
    Solidity,
    `
    (
     (solidity_version_comparison_operator) @operator
     (solidity_version) @version
    )
  `
  );

  const matches = query.matches(tree.rootNode);

  const operator = matches[0].captures[0].node.text;
  const version = matches[0].captures[1].node.text;

  return `${operator}${version}`;
}

async function getVersion(version: string) {
  const versionList = await versions();
  const targetVersion = semver.maxSatisfying(
    versionList.builds.map((b) => b.version),
    version
  );
  if (!targetVersion) {
    throw new Error("Invalid version");
  }

  const foundVersion = versionList.builds.find(
    (b) => b.version === targetVersion
  );

  return foundVersion!;
}

/**
 * Get list of available compiler versions.
 */
async function versions(): Promise<VersionList> {
  const result = await axios.get(solcURL + "list.json");
  return result.data;
}

export async function service(body: Body) {
  try {
    const input = {
      language: "Solidity",
      sources: {
        "contract.sol": {
          content: body.source,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };

    let output: any;
    let bytecode = "";
    let abi: any = [];
    let returnedCompilerVersion: string | undefined = undefined;

    if (body.compilerVersion) {
      const solc = new Solc();
      const remoteCompiler = await solc.loadRemoteCompiler(
        `v${body.compilerVersion}`
      );
      output = JSON.parse(remoteCompiler.compile(JSON.stringify(input)));
      returnedCompilerVersion = body.compilerVersion;
    } else {
      // get version from source code
      const version = parseVersion(body.source);
      // use version list and find the latest version that matches
      const compilerVersion = await getVersion(version);
      returnedCompilerVersion = compilerVersion.longVersion;
      console.log("compilerVersion", compilerVersion.longVersion);
      // load the compiler
      const remoteVersion = `v${compilerVersion.longVersion}`;
      // format like v0.4.1+commit.4fc6fc2c
      const solc = new Solc();
      const compiler = await solc.loadRemoteCompiler(remoteVersion);
      // compile
      output = JSON.parse(compiler.compile(JSON.stringify(input)));
    }

    if (output.errors && output.errors.length > 0) {
      let warningOnly = true;
      for (const error of output.errors) {
        if (!error.formattedMessage.startsWith("Warning")) {
          warningOnly = false;
          break;
        }
      }

      if (!warningOnly) {
        return {
          statusCode: 400,
          body: {
            errors: output.errors.map((error: any) => error.formattedMessage),
          },
        };
      }
    }

    for (let cn in output.contracts["contract.sol"]) {
      let tempBytecode =
        output.contracts["contract.sol"][cn].evm.bytecode.object;
      let tempAbi = output.contracts["contract.sol"][cn].abi;

      if (tempBytecode.length > 0) {
        bytecode = tempBytecode;
        abi = tempAbi;
        break;
      }
    }

    return {
      statusCode: 200,
      body: {
        bytecode,
        abi,
        compilerVersion: returnedCompilerVersion,
      },
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: {
        errors: [`${error}`],
      },
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body as Body;
  const response = await service(data);

  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  res.status(response.statusCode).json(response.body);
}
