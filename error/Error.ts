export abstract class RequestError extends Error {
  statusCode: number;
  status;
  protected constructor(message?: string) {
    super(message);
  }
}

export class BadRequestException extends RequestError {
  constructor(message = '잘못된 요청입니다.') {
    super(message);
    this.statusCode = 400;
  }
}

export class ServerError extends RequestError {
  constructor(message = '서버에러가 발생했습니다.') {
    super(message);
    this.statusCode = 500;
  }
}

export class NotFoundException extends RequestError {
  constructor(message = '요청하신 리소스를 찾을 수 없습니다.') {
    super(message);
    this.statusCode = 404;
  }
}

export class UnAuthorizationException extends RequestError {
  constructor(message = '인증되지 않았습니다.') {
    super(message);
    this.statusCode = 401;
  }
}

export class AccessDeniedException extends RequestError {
  constructor(message = '권한이 없습니다.') {
    super(message);
    this.statusCode = 403;
  }
}
