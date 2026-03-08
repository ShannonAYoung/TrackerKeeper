import { ConnectionStatus } from "../types/enums";

export function getProtocolInstructions(deviceState: any) {
  switch (deviceState.status) {
    case ConnectionStatus.CONNECTED:
      return "Secure link established. Monitoring active.";
    case ConnectionStatus.SEARCHING:
      return "Attempting secure handshake...";
    case ConnectionStatus.DISCONNECTED:
    default:
      return "Device not connected. Pair to begin.";
  }
}