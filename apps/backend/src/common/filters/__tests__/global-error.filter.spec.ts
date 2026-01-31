/**
 * GlobalErrorFilter unit tests.
 */
import { ArgumentsHost, BadRequestException, HttpException } from "@nestjs/common";
import { GlobalErrorFilter } from "../global-error.filter";

jest.mock("@boilerplate/logger", () => ({
  Logger: jest.fn().mockImplementation(() => ({
    setCorrelationId: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const makeHost = () => {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  const request = { method: "GET", url: "/test", correlationId: "cid-123" };
  const host = {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, reply };
};

describe("GlobalErrorFilter", () => {
  it("should handle HttpException with object response", () => {
    const filter = new GlobalErrorFilter();
    const { host, reply } = makeHost();
    const exception = new BadRequestException("Invalid");

    filter.catch(exception, host);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalled();
  });

  it("should handle HttpException with string response", () => {
    const filter = new GlobalErrorFilter();
    const { host, reply } = makeHost();
    const exception = new HttpException("oops", 418);

    filter.catch(exception, host);

    expect(reply.status).toHaveBeenCalledWith(418);
    expect(reply.send).toHaveBeenCalled();
  });

  it("should handle generic Error", () => {
    const filter = new GlobalErrorFilter();
    const { host, reply } = makeHost();

    filter.catch(new Error("boom"), host);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalled();
  });

  it("should handle non-Error exceptions", () => {
    const filter = new GlobalErrorFilter();
    const { host, reply } = makeHost();

    filter.catch("unknown error", host);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalled();
  });
});
