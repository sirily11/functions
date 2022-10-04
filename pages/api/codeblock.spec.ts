import { Message, service } from "./codeblock";

describe("Given a handler", () => {
  test("When parsing succeed", async () => {
    const code = `
      //@codeblock
      string a = "a"`;

    const message: Message = {
      code: code,
      mode: "parse",
      language: "solidity",
    };
    const result = service(message);
    const data = result.body;
    expect(data.blocks.length).toBe(1);
  });

  test("When generation succeed", async () => {
    const code = `
      //@codeblock
      string a = "a"`;

    const message: Message = {
      code,
      blocks: [],
      mode: "generate",
      language: "solidity",
    };
    const result = service(message);
    const data = result.body;
    expect(data.code).toBeDefined();
  });

  test("When failed", async () => {
    const code = `
      //@codeblock
      string a = "a"`;

    const message: Message = {
      blocks: [],
      //@ts-ignore
      mode: "a",
      language: "solidity",
    };
    const result = service(message);
    expect(result.statusCode).toBe(400);
  });

  test("When parsing failed", async () => {
    const code = `
      //@codeblock
      string a = "a"`;

    const message: Message = {
      code: code,
      mode: "parse",
      language: "python",
    };
    const result = service(message);
    expect(result.statusCode).toBe(500);
    expect(result.body).toStrictEqual({
      message: "Error: Language python not supported",
    });
  });
});
