import { getCorrelationId, getOrGenerateCorrelationId } from "../correlation-id.util";

describe("CorrelationId Util", () => {
  describe("getOrGenerateCorrelationId", () => {
    it("should generate a UUID when no request provided", () => {
      const id = getOrGenerateCorrelationId();
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should generate unique IDs", () => {
      const id1 = getOrGenerateCorrelationId();
      const id2 = getOrGenerateCorrelationId();
      expect(id1).not.toEqual(id2);
    });

    it("should use existing correlation ID from request header", () => {
      const testId = "test-correlation-id";
      const req = {
        headers: {
          "x-correlation-id": testId,
        },
      } as any;

      const result = getOrGenerateCorrelationId(req);
      expect(result).toBe(testId);
    });

    it("should generate new ID if not in request header", () => {
      const req = {
        headers: {},
      } as any;

      const result = getOrGenerateCorrelationId(req);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("getCorrelationId", () => {
    it("should retrieve correlation ID from request header", () => {
      const testId = "test-correlation-id";
      const req = {
        headers: {
          "x-correlation-id": testId,
        },
      } as any;

      const result = getCorrelationId(req);
      expect(result).toBe(testId);
    });

    it("should return undefined if no correlation ID is set", () => {
      const req = {
        headers: {},
      } as any;

      expect(getCorrelationId(req)).toBeUndefined();
    });

    it("should return undefined if no request provided", () => {
      expect(getCorrelationId()).toBeUndefined();
    });
  });
});
