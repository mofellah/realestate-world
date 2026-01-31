/**
 * PropertiesController unit tests.
 */
import { PropertiesController } from "../properties.controller";
import { PropertiesService } from "../properties.service";
import { PropertyUseCasesService } from "../../use-cases/property.use-cases.service";
import { OwnerContactUseCasesService } from "../../use-cases/owner-contact.use-cases.service";

const makeService = () => ({
  create: jest.fn(),
  search: jest.fn(),
  findByUser: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe("PropertiesController", () => {
  let controller: PropertiesController;
  let service: ReturnType<typeof makeService>;
  let propertyUseCases: { create: jest.Mock; search: jest.Mock };
  let ownerContactUseCases: { contactOwner: jest.Mock };

  beforeEach(() => {
    service = makeService();
    propertyUseCases = {
      create: jest.fn(),
      search: jest.fn(),
    };
    ownerContactUseCases = {
      contactOwner: jest.fn(),
    };
    controller = new PropertiesController(
      service as unknown as PropertiesService,
      propertyUseCases as unknown as PropertyUseCasesService,
      ownerContactUseCases as unknown as OwnerContactUseCasesService,
    );
  });

  it("should create property", async () => {
    const dto = { addressId: "addr-1" } as any;
    const user = { sub: "user-1" } as any;
    propertyUseCases.create.mockResolvedValue({ id: "prop-1" });

    await controller.create(dto, user);

    expect(propertyUseCases.create).toHaveBeenCalledWith("user-1", dto);
  });

  it("should search properties", async () => {
    const filters = { city: "Berlin" } as any;
    propertyUseCases.search.mockResolvedValue([]);

    await controller.search(filters);

    expect(propertyUseCases.search).toHaveBeenCalledWith(filters);
  });

  it("should find all properties for user", async () => {
    const user = { sub: "user-1" } as any;
    service.findByUser.mockResolvedValue([]);

    await controller.findAll(user, "2", "8");

    expect(service.findByUser).toHaveBeenCalledWith("user-1", 2, 8);
  });

  it("should use default pagination when skip/take missing", async () => {
    const user = { sub: "user-1" } as any;
    service.findByUser.mockResolvedValue([]);

    await controller.findAll(user, undefined as any, undefined as any);

    expect(service.findByUser).toHaveBeenCalledWith("user-1", 0, 10);
  });

  it("should find one property", async () => {
    service.findById.mockResolvedValue({ id: "prop-1" });

    await controller.findOne("prop-1");

    expect(service.findById).toHaveBeenCalledWith("prop-1");
  });

  it("should update property", async () => {
    const dto = { price: 100 } as any;
    const user = { sub: "user-1" } as any;
    service.update.mockResolvedValue({ id: "prop-1" });

    await controller.update("prop-1", dto, user);

    expect(service.update).toHaveBeenCalledWith("prop-1", "user-1", dto);
  });

  it("should delete property", async () => {
    const user = { sub: "user-1" } as any;
    service.delete.mockResolvedValue(undefined);

    await controller.delete("prop-1", user);

    expect(service.delete).toHaveBeenCalledWith("prop-1", "user-1");
  });
});
