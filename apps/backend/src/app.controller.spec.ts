/**
 * AppController unit tests.
 */
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  it("should return greeting from service", () => {
    const appService = { getHello: jest.fn().mockReturnValue("hello") } as unknown as AppService;
    const controller = new AppController(appService);

    const result = controller.getHello();

    expect(appService.getHello).toHaveBeenCalled();
    expect(result).toBe("hello");
  });
});
