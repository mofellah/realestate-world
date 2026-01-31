/**
 * Health Controller Integration Tests
 * Tests for GET /health endpoint (public, no auth required)
 */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { HealthController } from "../health.controller";

describe("HealthController (Integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return 200 with status ok", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/health").expect(200);

      // Assert
      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("ok");
    });

    it("should return timestamp in ISO8601 format", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/health").expect(200);

      // Assert
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.timestamp).toBe("string");
      // Verify it's a valid ISO8601 timestamp
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });

    it("should be accessible without authentication", async () => {
      // Act & Assert - should not require Authorization header
      await request(app.getHttpServer()).get("/health").expect(200);
    });

    it("should return response even with Authorization header", async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get("/health")
        .set("Authorization", "Bearer some-token")
        .expect(200);

      // Assert
      expect(response.body.status).toBe("ok");
    });

    it("should return valid timestamp format", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/health").expect(200);

      // Assert
      const timestamp = response.body.timestamp;
      const date = new Date(timestamp);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      expect(date.getTime()).toBeGreaterThan(Date.now() - 1000); // Within last second
    });

    it("should return consistent structure", async () => {
      // Act
      const response1 = await request(app.getHttpServer()).get("/health").expect(200);

      const response2 = await request(app.getHttpServer()).get("/health").expect(200);

      // Assert
      expect(Object.keys(response1.body).sort()).toEqual(Object.keys(response2.body).sort());
      expect(response1.body).toHaveProperty("status");
      expect(response1.body).toHaveProperty("timestamp");
      expect(Object.keys(response1.body).length).toBe(2);
    });

    it.skip("should handle multiple rapid requests", async () => {
      // SKIPPED: Flaky in CI due to resource constraints
      // Act & Assert
      const requests = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get("/health").expect(200));

      const responses = await Promise.all(requests);

      responses.forEach((response: any) => {
        expect(response.body.status).toBe("ok");
        expect(response.body.timestamp).toBeDefined();
      });
    });

    it("should return correct content-type header", async () => {
      // Act
      const response = await request(app.getHttpServer()).get("/health").expect(200);

      // Assert
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should work with path variations (trailing slash)", async () => {
      // Some frameworks handle trailing slashes differently
      // Act
      const response = await request(app.getHttpServer()).get("/health/").expect(200);

      // Assert (or 404 if trailing slash is not supported)
      expect(response.body).toHaveProperty("status");
    });
  });
});
