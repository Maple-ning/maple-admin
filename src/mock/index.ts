import { registerAuthMocks } from "./handlers/auth";
import { registerUserMocks } from "./handlers/user";

function setupMockServer() {
  registerAuthMocks();
  registerUserMocks();

  if (import.meta.env.DEV) {
    console.log("[Mock] All handlers registered");
  }
}

setupMockServer();
