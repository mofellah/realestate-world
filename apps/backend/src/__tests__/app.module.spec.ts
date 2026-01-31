/**
 * AppModule unit tests.
 */
import { AppModule } from "../app.module";
import { CorrelationIdMiddleware } from "../common/middleware/correlation-id.middleware";

describe("AppModule", () => {
  it("should apply CorrelationIdMiddleware to all routes", () => {
    const appModule = new AppModule();
    const apply = jest.fn().mockReturnValue({ forRoutes: jest.fn() });
    const consumer = { apply } as any;

    appModule.configure(consumer);

    expect(apply).toHaveBeenCalledWith(CorrelationIdMiddleware);
  });
});
