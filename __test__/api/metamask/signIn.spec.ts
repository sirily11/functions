import { service, Message } from "../../../pages/api/metamask/signIn";
import { ethers } from "ethers";

describe("Given a handler", () => {
  beforeAll(() => {
    process.env.PASSWORD = "password";
  });

  test("When authentication failed", async () => {
    const message: Message = {
      message: "Hello World",
      signature: "0x",
      address: "0x0000000000000000000000000000000000000000",
    };
    const response = service(message);
    expect(response.statusCode).toBe(403);
  });

  test("When authentication succeeded", async () => {
    const textMessage = "hello world";
    const wallet = ethers.Wallet.createRandom({});
    const signature = await wallet.signMessage(textMessage);

    const message: Message = {
      message: textMessage,
      signature: signature,
      address: wallet.address,
    };
    const response = service(message);
    expect(response.statusCode).toBe(200);
    let body = JSON.parse(response.body);
  });

  test("When authentication failed", async () => {
    const textMessage = "hello world";
    const wallet = ethers.Wallet.createRandom({});
    const signature = await wallet.signMessage(textMessage);

    const message: Message = {
      message: "",
      signature: signature,
      address: wallet.address,
    };
    const response = service(message);
    expect(response.statusCode).toBe(403);
  });
});
