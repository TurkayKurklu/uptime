export interface ParsedError {
  category: string;
  message: string;
  humanReadable: string;
}

const ERROR_MAP: Record<string, { category: string; humanReadable: string }> = {
  ENOTFOUND: {
    category: "DNS_FAILURE",
    humanReadable: "DNS Resolution Failed",
  },
  ECONNREFUSED: {
    category: "CONNECTION_REFUSED",
    humanReadable: "Connection Refused",
  },
  ECONNRESET: {
    category: "CONNECTION_RESET",
    humanReadable: "Connection Reset",
  },
  ECONNABORTED: {
    category: "CONNECTION_ABORTED",
    humanReadable: "Connection Aborted",
  },
  ETIMEDOUT: {
    category: "TIMEOUT",
    humanReadable: "Connection Timed Out",
  },
  ESOCKETTIMEDOUT: {
    category: "TIMEOUT",
    humanReadable: "Socket Timed Out",
  },
  EHOSTUNREACH: {
    category: "HOST_UNREACHABLE",
    humanReadable: "Host Unreachable",
  },
  ENETUNREACH: {
    category: "NETWORK_UNREACHABLE",
    humanReadable: "Network Unreachable",
  },
  EPIPE: {
    category: "BROKEN_PIPE",
    humanReadable: "Broken Pipe",
  },
  ERR_TLS_CERT_ALTNAME_INVALID: {
    category: "SSL_ERROR",
    humanReadable: "SSL Certificate Name Mismatch",
  },
  CERT_HAS_EXPIRED: {
    category: "SSL_ERROR",
    humanReadable: "SSL Certificate Expired",
  },
  DEPTH_ZERO_SELF_SIGNED_CERT: {
    category: "SSL_ERROR",
    humanReadable: "Self-Signed SSL Certificate",
  },
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: {
    category: "SSL_ERROR",
    humanReadable: "SSL Certificate Verification Failed",
  },
  SELF_SIGNED_CERT_IN_CHAIN: {
    category: "SSL_ERROR",
    humanReadable: "Self-Signed Certificate in Chain",
  },
};

const HTTP_STATUS_MAP: Record<number, { category: string; humanReadable: string }> = {
  400: { category: "CLIENT_ERROR", humanReadable: "Bad Request" },
  401: { category: "AUTH_ERROR", humanReadable: "Unauthorized" },
  403: { category: "AUTH_ERROR", humanReadable: "Forbidden" },
  404: { category: "NOT_FOUND", humanReadable: "Page Not Found" },
  408: { category: "TIMEOUT", humanReadable: "Request Timeout" },
  429: { category: "RATE_LIMITED", humanReadable: "Rate Limited" },
  500: { category: "SERVER_ERROR", humanReadable: "Internal Server Error" },
  502: { category: "GATEWAY_ERROR", humanReadable: "Bad Gateway" },
  503: { category: "SERVER_ERROR", humanReadable: "Service Unavailable" },
  504: { category: "GATEWAY_ERROR", humanReadable: "Gateway Timeout" },
  520: { category: "CLOUDFLARE_ERROR", humanReadable: "Cloudflare Error" },
  521: { category: "SERVER_DOWN", humanReadable: "Web Server Is Down" },
  522: { category: "TIMEOUT", humanReadable: "Connection Timed Out (CDN)" },
  523: { category: "HOST_UNREACHABLE", humanReadable: "Origin Is Unreachable" },
  524: { category: "TIMEOUT", humanReadable: "A Timeout Occurred (CDN)" },
};

/**
 * Parses an error from a fetch check into a categorized, human-readable result
 */
export function parseError(error: unknown): ParsedError {
  if (error instanceof Error) {
    const errorCode = (error as NodeJS.ErrnoException).code;

    // Check for known error codes
    if (errorCode && ERROR_MAP[errorCode]) {
      return {
        category: ERROR_MAP[errorCode].category,
        message: error.message,
        humanReadable: ERROR_MAP[errorCode].humanReadable,
      };
    }

    // Check for SSL-related errors in the message
    const sslPatterns = ["SSL", "CERT", "certificate", "TLS", "handshake"];
    if (sslPatterns.some((p) => error.message.toLowerCase().includes(p.toLowerCase()))) {
      return {
        category: "SSL_ERROR",
        message: error.message,
        humanReadable: "SSL Handshake Failed",
      };
    }

    // Check for timeout patterns
    if (
      error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("timed out") ||
      error.name === "AbortError"
    ) {
      return {
        category: "TIMEOUT",
        message: error.message,
        humanReadable: "Request Timed Out",
      };
    }

    // Generic error
    return {
      category: "UNKNOWN_ERROR",
      message: error.message,
      humanReadable: "Connection Failed",
    };
  }

  return {
    category: "UNKNOWN_ERROR",
    message: String(error),
    humanReadable: "An Unknown Error Occurred",
  };
}

/**
 * Gets a human-readable description for an HTTP status code
 */
export function parseStatusCode(statusCode: number): ParsedError | null {
  if (statusCode >= 200 && statusCode < 400) {
    return null; // No error
  }

  const mapped = HTTP_STATUS_MAP[statusCode];
  if (mapped) {
    return {
      category: mapped.category,
      message: `HTTP ${statusCode}`,
      humanReadable: mapped.humanReadable,
    };
  }

  if (statusCode >= 500) {
    return {
      category: "SERVER_ERROR",
      message: `HTTP ${statusCode}`,
      humanReadable: `Server Error (${statusCode})`,
    };
  }

  if (statusCode >= 400) {
    return {
      category: "CLIENT_ERROR",
      message: `HTTP ${statusCode}`,
      humanReadable: `Client Error (${statusCode})`,
    };
  }

  return null;
}
