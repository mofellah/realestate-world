import { Test, TestingModule } from "@nestjs/testing";
import { AdminController } from "../admin.controller";
import { AdminService } from "../admin.service";

describe("AdminController", () => {
  let controller: AdminController;
  let mockAdminService: any;

  beforeEach(async () => {
    mockAdminService = {
      getMetrics: jest.fn(),
      getActivity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getMetrics", () => {
    it("should return system metrics", async () => {
      const mockMetrics = {
        totalUsers: 100,
        totalProperties: 250,
        totalListings: 150,
        activeListings: 100,
        revenue: 5000,
      };

      mockAdminService.getMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getMetrics();

      expect(result).toEqual(mockMetrics);
      expect(mockAdminService.getMetrics).toHaveBeenCalled();
    });
  });

  describe("getActivity", () => {
    it("should return recent activity with provided limit", async () => {
      const mockActivity = [
        {
          id: "1",
          type: "user_registered",
          description: "New user: test@example.com",
          timestamp: "2024-01-01T00:00:00Z",
        },
      ];

      mockAdminService.getActivity.mockResolvedValue(mockActivity);

      const result = await controller.getActivity("10");

      expect(result).toEqual(mockActivity);
      expect(mockAdminService.getActivity).toHaveBeenCalledWith(10);
    });

    it("should use default limit if not provided", async () => {
      const mockActivity: any[] = [];
      mockAdminService.getActivity.mockResolvedValue(mockActivity);

      const result = await controller.getActivity();

      expect(result).toEqual(mockActivity);
      expect(mockAdminService.getActivity).toHaveBeenCalledWith(10);
    });

    it("should handle invalid limit and use default", async () => {
      const mockActivity: any[] = [];
      mockAdminService.getActivity.mockResolvedValue(mockActivity);

      const result = await controller.getActivity("invalid");

      expect(result).toEqual(mockActivity);
      expect(mockAdminService.getActivity).toHaveBeenCalledWith(10);
    });
  });
});
