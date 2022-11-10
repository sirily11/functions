import { service } from "../../../../pages/api/solidity/contract/names";

describe("Given a naming service", () => {
  it.skip("should return a list of names", () => {
    const source = `
        contract Foo {
            uint256 bar;
        }
        `;
    const response = service({ source });
    expect(response.statusCode).toEqual(200);
    expect(response.body.names).toEqual(["Foo"]);
  });

  it.skip("should return a list of names", () => {
    const source = `
        contract Foo {
            uint256 bar;
        }
        contract Bar {
            uint256 foo;
        }
        `;
    const response = service({ source });
    expect(response.statusCode).toEqual(200);
    expect(response.body.names).toEqual(["Foo", "Bar"]);
  });
});
