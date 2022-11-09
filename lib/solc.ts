//@ts-ignore
import { loadRemoteVersion } from "solc";

interface RemoteCompiler {
  compile: (source: string) => any;
}

export class Solc {
  async loadRemoteCompiler(version: string): Promise<RemoteCompiler> {
    return new Promise((resolve, reject) => {
      loadRemoteVersion(version, (err: any, solc: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(solc);
        }
      });
    });
  }
}
