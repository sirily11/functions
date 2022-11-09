import { Solc } from "../../../lib/solc";
import { service } from "../../../pages/api/solidity/compile";
import semver from "semver";

jest.mock("../../../lib/solc", () => ({
  Solc: jest.fn().mockImplementation(() => ({
    loadRemoteCompiler: jest.fn().mockResolvedValue({
      compile: jest.fn().mockReturnValue(
        JSON.stringify({
          errors: [],
          contracts: {
            "test.sol": {
              Test: {
                evm: {
                  bytecode: {
                    object: "0x1234",
                  },
                },
                abi: [],
              },
            },
          },
        })
      ),
    }),
  })),
}));

describe("Given a soldity compiler", () => {
  it.skip("should compile a solidity file", async () => {
    const source = `pragma solidity ^0.5.0;
    contract Test {
        function get() public pure returns (uint) {
        return 42;
        }
    }`;
    const response = await service({ source, contractName: "Test" });
    expect(response.statusCode).toBe(200);
    expect(response.body.bytecode).toBeDefined();
    expect(response.body.abi).toBeDefined();
  });

  it.skip("should compile a solidity file with version", async () => {
    const source = `// SPDX-License-Identifier: MIT\npragma solidity ^0.5.0;
    contract Test {
        function get() public pure returns (uint) {
        return 42;
        }
    }`;
    const response = await service({ source, contractName: "Test" });
    expect(response.statusCode).toBe(200);
    expect(response.body.bytecode).toBeDefined();
    expect(response.body.abi).toBeDefined();
  });
});
