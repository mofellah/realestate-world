/**
 * AgenciesController unit tests.
 */
import { AgenciesController } from "../agencies.controller";
import { AgenciesService } from "../agencies.service";

const makeService = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  addAgent: jest.fn(),
  removeAgent: jest.fn(),
  getPortfolio: jest.fn(),
});

describe("AgenciesController", () => {
  let controller: AgenciesController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new AgenciesController(service as unknown as AgenciesService);
  });

  it("should create agency", async () => {
    const req = { user: { sub: "user-1" } } as any;
    const dto = { name: "Agency", personId: "person-1" } as any;
    service.create.mockResolvedValue({ id: "agency-1" });

    await controller.create(req, dto);

    expect(service.create).toHaveBeenCalledWith("user-1", dto);
  });

  it("should find one agency", async () => {
    service.findOne.mockResolvedValue({ id: "agency-1" });

    await controller.findOne("agency-1");

    expect(service.findOne).toHaveBeenCalledWith("agency-1");
  });

  it("should update agency", async () => {
    const req = { user: { sub: "user-1" } } as any;
    const dto = { name: "Updated" } as any;
    service.update.mockResolvedValue({ id: "agency-1" });

    await controller.update(req, "agency-1", dto);

    expect(service.update).toHaveBeenCalledWith("agency-1", "user-1", dto);
  });

  it("should add agent", async () => {
    const req = { user: { sub: "user-1" } } as any;
    const dto = { userId: "agent-1", role: "agent" } as any;
    service.addAgent.mockResolvedValue({ id: "role-1" });

    await controller.addAgent(req, "agency-1", dto);

    expect(service.addAgent).toHaveBeenCalledWith("agency-1", "user-1", dto);
  });

  it("should remove agent", async () => {
    const req = { user: { sub: "user-1" } } as any;
    service.removeAgent.mockResolvedValue({ id: "role-1" });

    await controller.removeAgent(req, "agency-1", "agent-1");

    expect(service.removeAgent).toHaveBeenCalledWith("agency-1", "user-1", "agent-1");
  });

  it("should get portfolio with defaults", async () => {
    service.getPortfolio.mockResolvedValue({ items: [] });

    await controller.getPortfolio("agency-1");

    expect(service.getPortfolio).toHaveBeenCalledWith("agency-1", 0, 20);
  });

  it("should get portfolio with skip/take", async () => {
    service.getPortfolio.mockResolvedValue({ items: [] });

    await controller.getPortfolio("agency-1", 5, 10);

    expect(service.getPortfolio).toHaveBeenCalledWith("agency-1", 5, 10);
  });
});
