// Typed application errors. The central error handler maps these to HTTP
// status codes so route handlers can throw semantic errors instead of
// juggling res.status(...) everywhere.

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, "VALIDATION_ERROR", details);
  }
}

// Used for illegal state-machine transitions. 409 Conflict communicates that
// the request is well-formed but conflicts with the resource's current state.
export class InvalidTransitionError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, "INVALID_TRANSITION", details);
  }
}
