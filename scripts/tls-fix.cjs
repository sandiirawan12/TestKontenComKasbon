"use strict";

// Dev lokal: bypass SSL verify (jaringan kantor Windows). Production tidak pakai script ini.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const originalEmitWarning = process.emitWarning;
process.emitWarning = function emitWarning(warning, ...args) {
  const message =
    typeof warning === "string"
      ? warning
      : warning instanceof Error
        ? warning.message
        : String(warning);

  if (message.includes("NODE_TLS_REJECT_UNAUTHORIZED")) {
    return;
  }

  return originalEmitWarning.call(process, warning, ...args);
};
