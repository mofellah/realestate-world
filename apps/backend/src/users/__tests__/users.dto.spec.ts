/**
 * Users DTO Validation Tests
 * Tests for ChangePasswordDto and UpdateProfileDto validation
 */

import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";

describe("Users DTOs", () => {
  describe("ChangePasswordDto", () => {
    it("should validate a correct password change request", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "NewPass456!",
        confirmPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail if currentPassword is missing", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        newPassword: "NewPass456!",
        confirmPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("currentPassword");
    });

    it("should fail if currentPassword is too short", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "Short1!",
        newPassword: "NewPass456!",
        confirmPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("currentPassword");
    });

    it("should fail if newPassword is missing", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        confirmPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("newPassword");
    });

    it("should fail if newPassword is too short", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "Short1",
        confirmPassword: "Short1",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if newPassword lacks uppercase letter", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "newpass123!",
        confirmPassword: "newpass123!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("newPassword");
    });

    it("should fail if newPassword lacks lowercase letter", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "NEWPASS123!",
        confirmPassword: "NEWPASS123!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("newPassword");
    });

    it("should fail if newPassword lacks number", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "NewPassTest!",
        confirmPassword: "NewPassTest!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("newPassword");
    });

    it("should fail if currentPassword is not a string", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: 12345,
        newPassword: "NewPass456!",
        confirmPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if newPassword is not a string", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: 12345,
        confirmPassword: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if confirmPassword is missing", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "NewPass456!",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("confirmPassword");
    });

    it("should fail if confirmPassword is too short", async () => {
      const dto = plainToInstance(ChangePasswordDto, {
        currentPassword: "OldPass123!",
        newPassword: "NewPass456!",
        confirmPassword: "Short1",
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("UpdateProfileDto", () => {
    it("should validate with all optional fields provided", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: "Jane Doe",
        bio: "Real estate investor",
        phone: "+32 470 12 34 56",
        avatarUrl: "https://example.com/avatar.jpg",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with no fields provided (all optional)", async () => {
      const dto = plainToInstance(UpdateProfileDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with only name provided", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: "Jane Doe",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with only bio provided", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        bio: "Real estate investor",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with only phone provided", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: "+32 470 12 34 56",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with only avatarUrl provided", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: "https://example.com/avatar.jpg",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should fail if name exceeds max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: "a".repeat(256),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("name");
    });

    it("should fail if bio exceeds max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        bio: "a".repeat(1001),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("bio");
    });

    it("should fail if phone exceeds max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: "a".repeat(51),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("phone");
    });

    it("should fail if avatarUrl exceeds max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: "https://example.com/" + "a".repeat(2100),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe("avatarUrl");
    });

    it("should fail if name is not a string", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if bio is not a string", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        bio: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if phone is not a string", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail if avatarUrl is not a string", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: 12345,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should accept null values for optional fields", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: null,
        bio: null,
        phone: null,
        avatarUrl: null,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with partial update", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: "Jane Doe",
        phone: "+32 470 12 34 56",
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with name at max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        name: "a".repeat(255),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with bio at max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        bio: "a".repeat(1000),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with phone at max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        phone: "a".repeat(50),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should validate with avatarUrl at max length", async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        avatarUrl: "https://example.com/" + "a".repeat(2028),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
