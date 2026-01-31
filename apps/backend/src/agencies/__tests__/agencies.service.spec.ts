import { Test, TestingModule } from "@nestjs/testing";
import { AgenciesService } from "../agencies.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";

describe("AgenciesService", () => {
  let service: AgenciesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    agency: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    person: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    agencyRole: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    property: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgenciesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: "LOGGER",
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgenciesService>(AgenciesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create an agency successfully", async () => {
      const userId = "user-001";
      const dto = {
        personId: "person-001",
        name: "Test Agency",
        email: "test@agency.com",
        phone: "+1234567890",
      };

      const mockPerson = {
        id: "person-001",
        type: "organization",
        userId: "user-001",
        organization: { id: "org-001" },
      };

      const mockAgency = {
        id: "agency-001",
        personId: "person-001",
        name: "Test Agency",
        email: "test@agency.com",
        phone: "+1234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson);
      mockPrismaService.agency.create.mockResolvedValue(mockAgency);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockAgency);
      expect(prisma.person.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: dto.personId },
        }),
      );
      expect(prisma.agency.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if agency already exists", async () => {
      const userId = "user-001";
      const dto = {
        personId: "person-001",
        name: "Test Agency",
        email: "test@agency.com",
        phone: "+1234567890",
      };

      const mockPerson = {
        id: "person-001",
        type: "organization",
        userId: "user-001",
        organization: { id: "org-001" },
      };

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson);
      mockPrismaService.agency.findUnique.mockResolvedValue({ id: "agency-001" });

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if person not found", async () => {
      const userId = "user-001";
      const dto = {
        personId: "person-001",
        name: "Test Agency",
        email: "test@agency.com",
        phone: "+1234567890",
      };

      mockPrismaService.person.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if person is not organization", async () => {
      const userId = "user-001";
      const dto = {
        personId: "person-001",
        name: "Test Agency",
        email: "test@agency.com",
        phone: "+1234567890",
      };

      const mockPerson = {
        id: "person-001",
        type: "individual",
        userId: "user-001",
      };

      mockPrismaService.person.findUnique.mockResolvedValue(mockPerson);

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("findOne", () => {
    it("should return an agency by id", async () => {
      const mockAgency = {
        id: "agency-001",
        name: "Test Agency",
        person: { user: { name: "Owner" } },
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      const result = await service.findOne("agency-001");

      expect(result).toEqual(mockAgency);
      expect(prisma.agency.findUnique).toHaveBeenCalledWith({
        where: { id: "agency-001" },
        include: expect.any(Object),
      });
    });

    it("should throw NotFoundException if agency not found", async () => {
      mockPrismaService.agency.findUnique.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update an agency successfully", async () => {
      const agencyId = "agency-001";
      const userId = "user-001";
      const dto = {};

      const mockAgency = {
        id: agencyId,
        person: { userId: "user-001" },
        name: "Test Agency",
        employees: [{ userId: "user-001", role: "owner" }], // Need employees for auth check
      };

      const mockUpdated = { ...mockAgency };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.agency.update.mockResolvedValue(mockUpdated);

      const result = await service.update(agencyId, userId, dto);

      expect(result).toEqual(mockUpdated);
      expect(prisma.agency.update).toHaveBeenCalled();
    });

    it("should throw NotFoundException if agency not found", async () => {
      mockPrismaService.agency.findUnique.mockResolvedValue(null);

      await expect(service.update("nonexistent", "user-001", {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if not owner", async () => {
      const mockAgency = {
        id: "agency-001",
        employees: [],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      await expect(service.update("agency-001", "user-001", {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("addAgent", () => {
    it("should add an agent to agency", async () => {
      const agencyId = "agency-001";
      const userId = "user-001";
      const dto = { userId: "agent-001", role: "agent" as const };

      const mockAgency = {
        id: agencyId,
        person: { userId: "user-001" },
        maxAgents: 5,
        employees: [{ userId: "user-001", role: "owner" }],
      };

      const mockRelation = {
        id: "relation-001",
        agencyId,
        userId: "agent-001",
        role: "agent" as const,
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "agent-001" });
      mockPrismaService.agencyRole.create.mockResolvedValue(mockRelation);

      const result = await service.addAgent(agencyId, userId, dto);

      expect(result).toEqual(mockRelation);
      expect(prisma.agencyRole.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if max agents reached", async () => {
      const mockAgency = {
        id: "agency-001",
        maxAgents: 1,
        employees: [{ userId: "user-001", role: "owner" }],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      await expect(
        service.addAgent("agency-001", "user-001", { userId: "agent-001", role: "agent" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if user already employee", async () => {
      const mockAgency = {
        id: "agency-001",
        maxAgents: 5,
        employees: [
          { userId: "user-001", role: "owner" },
          { userId: "agent-001", role: "agent" },
        ],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "agent-001" });

      await expect(
        service.addAgent("agency-001", "user-001", { userId: "agent-001", role: "agent" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user not found", async () => {
      const mockAgency = {
        id: "agency-001",
        maxAgents: 5,
        employees: [{ userId: "user-001", role: "owner" }],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addAgent("agency-001", "user-001", { userId: "agent-404", role: "agent" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if not agency owner", async () => {
      const mockAgency = {
        id: "agency-001",
        person: { userId: "other-user" },
        employees: [{ userId: "other-user", role: "owner" }], // User is not in employees
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      await expect(
        service.addAgent("agency-001", "user-001", { userId: "agent-001", role: "agent" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("removeAgent", () => {
    it("should remove an agent from agency", async () => {
      const agencyId = "agency-001";
      const userId = "user-001";
      const agentId = "agent-001";

      const mockAgency = {
        id: agencyId,
        person: { userId: "user-001" },
        employees: [
          { id: "role-owner", userId: "user-001", role: "owner" },
          { id: "role-agent", userId: "agent-001", role: "agent" },
        ],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.agencyRole.delete.mockResolvedValue({ id: "role-agent" });

      await service.removeAgent(agencyId, userId, agentId);

      expect(prisma.agencyRole.delete).toHaveBeenCalledWith({
        where: { id: "role-agent" },
      });
    });

    it("should throw NotFoundException if relation not found", async () => {
      const mockAgency = {
        id: "agency-001",
        person: { userId: "user-001" },
        employees: [{ userId: "user-001", role: "owner" }],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrismaService.agencyRole.findFirst.mockResolvedValue(null);

      await expect(service.removeAgent("agency-001", "user-001", "agent-001")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when removing last owner", async () => {
      const mockAgency = {
        id: "agency-001",
        employees: [{ id: "role-owner", userId: "user-001", role: "owner" }],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      await expect(service.removeAgent("agency-001", "user-001", "user-001")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ForbiddenException if requester not admin", async () => {
      const mockAgency = {
        id: "agency-001",
        employees: [{ id: "role-agent", userId: "agent-001", role: "agent" }],
      };

      mockPrismaService.agency.findUnique.mockResolvedValue(mockAgency);

      await expect(service.removeAgent("agency-001", "user-001", "agent-001")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getPortfolio", () => {
    it("should throw NotFoundException if agency not found", async () => {
      mockPrismaService.agency.findUnique.mockResolvedValue(null);

      await expect(service.getPortfolio("agency-404")).rejects.toThrow(NotFoundException);
    });
  });
});
